import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createBrevoDelivery } from '../server/brevo-delivery.js';
import { createFormHandler } from '../server/forms.js';
import { createHostingerStore } from '../server/hostinger-store.js';
import { tripRequestPath } from '../src/lib/content.js';
const input = () => ({ requestId: randomUUID(), nome: 'Test Wānanga', email: 'test@example.com', privacy_accepted: true, consenso_newsletter: false, messaggio: 'Una domanda sul viaggio.' });
const application = () => ({ ...input(), tripSlug: 'bali', telefono: '+39 333 1234567', eta: '30', numero_persone: '2', contatto_preferito: 'sera', motivazione: 'Vorrei scoprire Bali.', esperienza_gruppo: 'No', info_utili: '' });
const request = (body, path = '/api/contact', origin = 'https://test.example') => new Request('https://test.example' + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body) });
async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'wananga-forms-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const db = createHostingerStore(directory);
  return { db, directory };
}
test('invalid forms, cross-origin submissions and closed trips never enter the delivery queue', async t => {
  const { db } = await fixture(t);
  const handler = createFormHandler({ historySecret: 'unit-test-history-secret', store: () => db, enabled: () => true, hash: s => s, getTrip: async () => ({ title: 'Bali', status: 'closed' }) });
  for (const bad of [{...input(), privacy_accepted:false},{...input(),consenso_newsletter:'false'},{...input(),email:'bad'},{...input(),messaggio:'x'.repeat(5001)},{...input(),website:'spam'},{...input(),requestId:'../secret'}]) assert.equal((await handler(request(bad))).status,400);
  assert.equal((await handler(request(input(),'/api/contact','https://other.example'))).status,403);
  assert.equal((await handler(request({...application(),eta:0},'/api/application'))).status,400);
  assert.equal((await handler(request(application(),'/api/application'))).status,409);
  assert.equal((await db.findForms()).length,0);
});
test('a confirmed request is durably queued once before Brevo responds, including after a restart', async t => {
  const { db, directory } = await fixture(t); let calls = 0; let finish;
  const handler = createFormHandler({ historySecret: 'unit-test-history-secret', store: () => db, enabled: () => true, hash: s => s });
  const data = input();
  assert.equal((await handler(request(data))).status, 200);
  assert.equal((await handler(request(data))).status, 200);
  const saved = await db.findForms(data.email);
  assert.equal(saved.length, 1); assert.equal(saved[0].status, 'queued');
  assert.equal(saved[0].messaggio, data.messaggio);
  const afterRestart = createHostingerStore(directory);
  const delivery = createBrevoDelivery({ origin: 'https://test.example', historySecret: 'unit-test-history-secret', store: () => afterRestart, hash: s => s,
    client: { submit: async () => { calls++; return new Promise(resolve => { finish = resolve; }); } },
  });
  const pending = delivery.kick();
  while (!finish) await new Promise(resolve => setImmediate(resolve));
  // The next visitor can submit while a slow provider is still processing this email.
  assert.equal((await handler(request({ ...data, requestId: randomUUID(), messaggio: 'Second request' }))).status, 200);
  finish({ contactId: 1, noteId: 'n', dealId: 'd' }); await pending;
  assert.equal(calls, 1);
  assert.equal((await handler(request(data))).status, 200);
  assert.equal((await db.findForms(data.email)).find(row => row.requestId === data.requestId).status, 'received');
});
test('a storage failure never returns a successful submission', async () => {
  const handler = createFormHandler({ historySecret: 'test', enabled: () => true, hash: s => s, store: () => ({
    withLock: async (_, operation) => operation(), getJSON: async () => null, limit: async () => {}, setJSON: async () => { throw Error('disk failure'); },
  }) });
  assert.equal((await handler(request(input()))).status, 503);
});
test('concurrent submissions for one email are serialized and lock releases after failure',async t=>{
  const {db}=await fixture(t);let release;
  const a=db.withLock('email',()=>new Promise(r=>{release=r;}));
  while(!release)await new Promise(r=>setImmediate(r));
  await assert.rejects(db.withLock('email',async()=>{}),{code:'request_in_progress'});
  release();await a;
  await assert.rejects(db.withLock('email',async()=>{throw Error('failure');}));
  await db.withLock('email',async()=>{});
});
test('forms from tabs opened before the Brevo migration use the same validated delivery and storage', async t => {
  const { db } = await fixture(t); const delivered = [];
  const handler = createFormHandler({ historySecret: 'test-secret', store: () => db, enabled: () => true, hash: s => s,
    getTrip: async slug => slug === 'bali' ? { title: 'Bali', status: 'interest' } : null,
  });
  const contact = input(); delete contact.requestId;
  const path = '/hcgi/platform/api/collections/contatti/records';
  assert.equal((await handler(request(contact, path, 'https://other.example'))).status, 403);
  assert.equal((await handler(request({ ...contact, privacy_accepted: false }, path))).status, 400);
  assert.equal((await handler(request(contact, path))).status, 200);
  const oldApplication = { ...application(), viaggio: 'Bali', info_utili: 'Età: 30 anni\n\nPreferisco la sera.' };
  delete oldApplication.requestId; delete oldApplication.eta; delete oldApplication.tripSlug;
  const applicationPath = '/hcgi/platform/api/collections/candidature/records';
  assert.equal((await handler(request({ ...oldApplication, info_utili: 'Età: 0 anni' }, applicationPath))).status, 400);
  assert.equal((await handler(request(oldApplication, applicationPath))).status, 200);
  await createBrevoDelivery({ origin: 'https://test.example', historySecret: 'test-secret', store: () => db, hash: s => s, client: { submit: async data => { delivered.push(data); return { contactId: 1, noteId: 'n', dealId: 'd' }; } } }).kick();
  assert.equal(delivered.length, 2);
  assert.equal(delivered[0].kind, 'contact');
  assert.equal(delivered[0].messaggio, contact.messaggio);
  assert.equal(delivered[1].kind, 'application');
  assert.equal(delivered[1].eta, 30);
  assert.equal(delivered[1].info_utili, 'Preferisco la sera.');
  assert.equal(delivered[1].tripSlug, 'bali');
  assert.equal((await db.findForms(contact.email)).length, 2);
});
