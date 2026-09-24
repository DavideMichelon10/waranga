import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createBrevoApi, createBrevoTrialClient, BrevoError, submissionNote, submissionReference, trialAttributes, trialEligible } from '../server/brevo.js';
import { createBrevoDelivery } from '../server/brevo-delivery.js';
import { createHostingerStore } from '../server/hostinger-store.js';
import { createFormHandler } from '../server/forms.js';

const record = overrides => ({ requestId: randomUUID(), email: 'test@example.com', nome: 'Test', kind: 'application', tripSlug: 'bali', viaggio: 'Bali', at: '2026-09-24T10:00:00Z', status: 'queued', privacy_accepted: true, consenso_newsletter: false, motivazione: 'Motivazione completa', brevoTrial: true, ...overrides });
function remote() {
  const contacts = [], deals = [], notes = [], calls = [];
  let loseDealReply = false, hideDeal = false, loseNoteReply = false;
  async function api(path, method = 'GET', body) {
    calls.push({ path, method, body });
    const url = new URL(path, 'https://test.example');
    if (path === '/contacts/attributes') return { attributes: [{ name: 'NOME', field_key: 'firstname' }] };
    if (path === '/crm/pipeline/details/all') return [{ pipeline: 'p', stages: [{ id: 's', name: 'New' }] }];
    if (path === '/crm/attributes/deals') return Object.entries(trialAttributes).map(([internalName, label]) => ({ internalName, label, attributeTypeName: 'text' }));
    if (path.startsWith('/contacts/') && method === 'GET') {
      const c = contacts.find(c => c.email === decodeURIComponent(path.split('/').at(-1)));
      if (!c) throw new BrevoError('brevo_http_404', 404);
      return c;
    }
    if (path === '/contacts' && method === 'POST') {
      const c = { ...body, id: contacts.length + 1 }; contacts.push(c); return c;
    }
    if (url.pathname === '/crm/deals' && method === 'GET') {
      const contactId = Number(url.searchParams.get('filters[linkedContactsIds]'));
      return { items: hideDeal ? [] : deals.filter(d => d.linkedContactsIds.includes(contactId)) };
    }
    if (path === '/crm/deals' && method === 'POST') {
      const d = { ...body, id: 'd' + deals.length }; deals.push(d);
      if (loseDealReply) throw new BrevoError('brevo_network_error');
      return d;
    }
    if (url.pathname === '/crm/notes' && method === 'GET') return notes.filter(n => n.dealIds.includes(url.searchParams.get('entityIds')));
    if (path === '/crm/notes' && method === 'POST') {
      const n = { ...body, id: 'n' + notes.length }; notes.push(n);
      if (loseNoteReply) throw new BrevoError('brevo_network_error');
      return n;
    }
    throw Error('Unexpected call: ' + method + ' ' + path);
  }
  return { api, contacts, deals, notes, calls, loseDeal() { loseDealReply = true; }, hideDeal() { hideDeal = true; }, loseNote() { loseNoteReply = true; } };
}
async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'wananga-brevo-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return createHostingerStore(dir);
}
test('two applications and a contact message remain separate on one person with full escaped text', async () => {
  const r = remote(), client = createBrevoTrialClient({ api: r.api });
  const first = record({ motivazione: '<script>alert(1)</script>' + 'a'.repeat(1950) });
  const second = record({ viaggio: 'Thailandia', info_utili: 'b'.repeat(1900) });
  for (const item of [first, second, record({ kind: 'contact', messaggio: 'c'.repeat(5000), viaggio: undefined })]) await client.submit(item, {}, async () => {});
  assert.equal(r.contacts.length, 1); assert.equal(r.deals.length, 3); assert.equal(r.notes.length, 3);
  assert.equal(r.contacts[0].emailBlacklisted, true);
  assert.equal(r.contacts[0].attributes.NOME, 'Test');
  assert.ok(r.notes[0].text.includes('&lt;script&gt;')); assert.ok(!r.notes[0].text.includes('<script>'));
  assert.ok(r.notes[1].text.includes(second.info_utili)); assert.ok(r.notes[2].text.includes('c'.repeat(5000)));
  assert.deepEqual(r.deals.map(d => d.attributes.trip), ['Bali', 'Thailandia', 'Richiesta generale']);
  assert.ok(r.notes.every(n => n.contactIds[0] === 1 && n.dealIds.length === 1));
  assert.ok(r.deals.every(d => !('pipeline' in d.attributes) && !('deal_stage' in d.attributes)), 'default placement must be left to Brevo on accounts rejecting explicit default IDs');
});
test('existing marketing suppression is not changed even when a form requests newsletter', async () => {
  for (const emailBlacklisted of [false, true]) {
    const r = remote(); r.contacts.push({ id: 8, email: 'test@example.com', emailBlacklisted });
    await createBrevoTrialClient({ api: r.api }).submit(record({ consenso_newsletter: true }), {}, async () => {});
    assert.equal(r.contacts[0].emailBlacklisted, emailBlacklisted);
    assert.ok(!r.calls.some(c => c.path.startsWith('/contacts') && c.method !== 'GET'));
  }
});
test('lost deal response is recovered after restart without a second deal', async () => {
  const r = remote(); r.loseDeal(); let receipt = {}; const item = record();
  const checkpoint = async state => { receipt = state; };
  await assert.rejects(createBrevoTrialClient({ api: r.api }).submit(item, receipt, checkpoint), { code: 'brevo_network_error' });
  assert.equal(receipt.dealIntent, true);
  await createBrevoTrialClient({ api: r.api }).submit(item, receipt, checkpoint);
  assert.equal(r.deals.length, 1); assert.equal(r.notes.length, 1);
  await createBrevoTrialClient({ api: r.api }).submit(item, receipt, checkpoint);
  assert.equal(r.deals.length, 1); assert.equal(r.notes.length, 1);
});
test('ambiguous create never retries a POST when reconciliation cannot find the remote deal', async () => {
  const r = remote(); r.loseDeal(); let receipt = {}; const item = record();
  const checkpoint = async state => { receipt = state; };
  await assert.rejects(createBrevoTrialClient({ api: r.api }).submit(item, receipt, checkpoint)); r.hideDeal();
  await assert.rejects(createBrevoTrialClient({ api: r.api }).submit(item, receipt, checkpoint), { code: 'brevo_deal_reconcile_required' });
  assert.equal(r.deals.length, 1);
});
test('lost note response is reconciled without duplicating answers', async () => {
  const r = remote(); r.loseNote(); let receipt = {}; const item = record();
  const checkpoint = async state => { receipt = state; };
  await assert.rejects(createBrevoTrialClient({ api: r.api }).submit(item, receipt, checkpoint));
  await createBrevoTrialClient({ api: r.api }).submit(item, receipt, checkpoint);
  assert.equal(r.notes.length, 1);
});
test('trial is disabled by default and requires an exact allowed email', () => {
  assert.equal(trialEligible('test@example.com', {}), false);
  const env = { BREVO_TRIAL_ENABLED: 'true', BREVO_API_KEY: 'test', BREVO_TRIAL_EMAILS: ' Test@example.com ' };
  assert.equal(trialEligible('test@example.com', env), true);
  assert.equal(trialEligible('test+alias@example.com', env), false);
});
test('Brevo retry receipts survive restart and cannot alter Reach form status or import older forms', async t => {
  const db = await fixture(t); const r = remote(); let now = 1000; let offline = true;
  const item = record({ status: 'received' });
  await db.setJSON('form1', item); await db.setJSON('old', record({ brevoTrial: undefined })); await db.setJSON('other', record({ email: 'other@example.com' }));
  const client = createBrevoTrialClient({ api: (...args) => { if (offline) throw new BrevoError('brevo_http_503', 503); return r.api(...args); } });
  const opts = { store: () => db, eligible: email => email === item.email, client, now: () => now };
  await createBrevoDelivery(opts).kick(); offline = false;
  await createBrevoDelivery(opts).kick(); assert.equal(r.deals.length, 0);
  now += 5000; await createBrevoDelivery(opts).kick(); await createBrevoDelivery(opts).kick();
  assert.equal(r.deals.length, 1); assert.equal((await db.getJSON('form1')).status, 'received');
  assert.equal((await db.getJSON('brevo-trial/' + submissionReference(item))).status, 'received');
});
test('only server eligibility can enroll a form in the trial', async t => {
  const db = await fixture(t);
  const handler = createFormHandler({ store: () => db, hash: s => s, historySecret: 'test', enabled: () => true, brevoEligible: email => email === 'allowed@example.com' });
  for (const email of ['allowed@example.com', 'other@example.com']) {
    const input = record({ email, kind: 'contact', messaggio: 'Message', brevoTrial: true });
    const result = await handler(new Request('https://test.example/api/contact', { method: 'POST', headers: { origin: 'https://test.example', 'content-type': 'application/json' }, body: JSON.stringify(input) }));
    assert.equal(result.status, 200);
    assert.equal((await db.findForms(email))[0].brevoTrial === true, email === 'allowed@example.com');
  }
});
test('API refuses redirects and redacts remote error bodies', async () => {
  const api = createBrevoApi({ token: 'private-test', fetcher: async (url, options) => {
    assert.equal(options.redirect, 'error'); return new Response('sensitive-data', { status: 401 });
  } });
  await assert.rejects(api('/account'), e => e.message === 'brevo_http_401' && !e.message.includes('sensitive'));
});

test('unauthorized IPv4 and IPv6 are exposed without logging the rest of the response', async () => {
  for (const ip of ['203.0.113.10', '2001:db8::1234']) {
    const api = createBrevoApi({ token: 'test', fetcher: async () => Response.json({ message: `Unrecognised IP address ${ip}. Secret body must not be logged.` }, { status: 401 }) });
    await assert.rejects(api('/account'), e => e.unauthorizedIp === ip && e.message === 'brevo_http_401');
  }
});
