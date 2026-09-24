import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createFormDelivery } from '../server/form-delivery.js';
import { createHostingerStore } from '../server/hostinger-store.js';
import { saveFormRecord, historyToken } from '../server/form-history.js';
import { ServiceError } from '../server/reach.js';
import { createFormTrips } from '../server/form-trips.js';
const secret = 'test-only';
async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'wananga-delivery-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return createHostingerStore(directory);
}
test('Reach outages retry automatically after restart in contact order and never duplicate saved requests', async t => {
  const db = await fixture(t); let now = 1000; let fail = true; const calls = [];
  const records = [0, 1].map(index => ({ requestId: randomUUID(), kind: 'contact', nome: 'Test', email: 'test@example.com', at: `2026-09-24T10:0${index}:00Z`, messaggio: `Message ${index}`, status: 'queued', consenso_newsletter: false }));
  for (const record of records) await saveFormRecord(db, `forms/${record.email}/${record.requestId}`, record, { secret });
  const options = { store: () => db, origin: 'https://test.example', historySecret: secret, hash: s => s, now: () => now, reach: () => ({ submitForm: async record => {
    calls.push(record.requestId); if (fail) throw new ServiceError('reach_503');
    assert.ok(record.historyUrl.endsWith(historyToken(record.email, secret)));
    return { contactUuid: 'c', newsletter: 'not_requested' };
  } }) };
  await createFormDelivery(options).kick();
  assert.equal(calls.length, 1);
  assert.equal((await db.findPendingForms()).length, 2);
  fail = false;
  await createFormDelivery(options).kick();
  assert.equal(calls.length, 1, 'retry backoff survives restart');
  now += 5000;
  await createFormDelivery(options).kick();
  assert.deepEqual(calls, [records[0].requestId, records[0].requestId, records[1].requestId]);
  assert.equal((await db.findPendingForms()).length, 0);
  await createFormDelivery(options).kick();
  assert.equal(calls.length, 3);
  const archive = await db.getJSON('form-history/' + historyToken(records[0].email, secret));
  assert.equal(archive.records.length, 2);
  assert.ok(archive.records.every(record => record.status === 'received'));
});
test('two workers cannot deliver the same queued request concurrently', async t => {
  const db = await fixture(t); let calls = 0; let finish;
  const record = { requestId: randomUUID(), kind: 'contact', nome: 'Test', email: 'test@example.com', at: '2026-09-24T10:00:00Z', status: 'queued' };
  await saveFormRecord(db, `forms/${record.email}/${record.requestId}`, record, { secret });
  const options = { store: () => db, origin: 'https://test.example', historySecret: secret, hash: s => s, reach: () => ({ submitForm: async () => { calls++; return new Promise(resolve => { finish = resolve; }); } }) };
  const first = createFormDelivery(options).kick();
  while (!finish) await new Promise(resolve => setImmediate(resolve));
  await createFormDelivery(options).kick();
  assert.equal(calls, 1);
  finish({ contactUuid: 'c', newsletter: 'not_requested' }); await first;
});
test('trip validation uses the warmed catalog and survives a restart or brief CMS outage', async t => {
  const db = await fixture(t); let calls = 0; let now = 1000;
  const query = async () => { calls++; return [{ slug: 'bali', title: 'Bali', status: 'interest' }]; };
  const catalog = createFormTrips({ store: () => db, query, now: () => now });
  await catalog.refresh();
  assert.equal((await catalog.get('bali')).status, 'interest');
  assert.equal(await catalog.get('missing'), undefined); assert.equal(calls, 1);
  const offline = createFormTrips({ store: () => db, now: () => now, query: async () => { throw Error('CMS offline'); } });
  assert.equal((await offline.get('bali')).title, 'Bali');
  now += 31000;
  assert.equal((await offline.get('bali')).title, 'Bali');
  now += 300000;
  await assert.rejects(offline.get('bali'), { code: 'trips_unavailable' });
  const closed = createFormTrips({ store: () => db, now: () => now, query: async () => [{ slug: 'bali', status: 'closed' }] });
  await closed.refresh(); assert.equal((await closed.get('bali')).status, 'closed');
});
