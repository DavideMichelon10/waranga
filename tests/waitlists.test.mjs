import test from 'node:test';
import assert from 'node:assert/strict';
import { createSubscribeHandler } from '../server/subscribe.js';
import { createReach, audienceName, NEWSLETTER_TAG } from '../server/reach.js';
import { limitRequests } from '../server/services.js';
import { normalizeContent } from '../src/lib/content.js';
import { waitlistPhase } from '../src/lib/waitlists.js';

function store() {
  const entries = new Map(); let revision = 0;
  return {
    entries,
    async get(key) { return entries.get(key)?.data || null; },
    async getWithMetadata(key) { return entries.get(key) || null; },
    async setJSON(key, data, options = {}) {
      if ((options.onlyIfNew && entries.has(key)) || (options.onlyIfMatch && options.onlyIfMatch !== entries.get(key)?.etag)) return { modified: false };
      entries.set(key, { data: structuredClone(data), etag: String(++revision) }); return { modified: true };
    },
  };
}
const request = (body, path = '/api/waitlist') => new Request(`https://wananga.it${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://wananga.it' }, body: JSON.stringify(body) });
const signup = { email: 'hello@example.com', waitlistId: 'waiting-bali-2027', privacy: true, newsletter: false };
const list = { _id: signup.waitlistId, title: 'Bali', status: 'collecting' };

test('standby never writes contacts or consent; validation precedes all side effects', async () => {
  let writes = 0;
  const handle = createSubscribeHandler({ configured: () => false, store: () => { writes++; throw Error(); } });
  assert.equal((await handle(request(signup))).status, 503);
  for (const input of [{ ...signup, privacy: false }, { ...signup, email: 'bad' }, { ...signup, waitlistId: 'drafts.hidden' }, { ...signup, newsletter: 'true' }]) assert.equal((await handle(request(input))).status, 400);
  assert.equal(writes, 0);
});

test('waiting list and newsletter choices are independent and consent is stored privately', async () => {
  const db = store(); const calls = [];
  const handle = createSubscribeHandler({ configured: () => true, store: () => db, hash: () => 'email-hash', limit: async () => {}, getWaitlist: async () => list, reach: () => ({ subscribe: async (email, names) => { calls.push(names); return { status: 'pending_confirmation' }; } }) });
  assert.equal((await handle(request(signup))).status, 200);
  assert.deepEqual(calls[0], [audienceName(list._id)]);
  await handle(request({ ...signup, newsletter: true }));
  assert.deepEqual(calls[1], [audienceName(list._id), NEWSLETTER_TAG]);
  assert.equal(db.entries.size, 2);
  assert.deepEqual([...db.entries.values()].map(entry => entry.data.newsletter), [false, true]);
});

test('nonexistent and closed lists never reach Reach', async () => {
  for (const item of [null, { ...list, status: 'closed' }, { ...list, status: 'available' }]) {
    const handle = createSubscribeHandler({ configured: () => true, store, hash: () => 'hash', limit: async () => {}, getWaitlist: async () => item, reach: () => { throw Error('Must not call'); } });
    assert.equal((await handle(request(signup))).status, 409);
  }
});

test('newsletter-only requires an explicit choice and no waiting list', async () => {
  const calls = [];
  const handle = createSubscribeHandler({ configured: () => true, store, hash: () => 'hash', limit: async () => {}, reach: () => ({ subscribe: async (_, names) => { calls.push(names); return { status: 'subscribed' }; } }) });
  assert.equal((await handle(request({ email: signup.email, privacy: true, newsletter: false }))).status, 400);
  assert.equal((await handle(request({ email: signup.email, privacy: true, newsletter: true }))).status, 200);
  assert.deepEqual(calls, [[NEWSLETTER_TAG]]);
});

test('existing contacts get additive tags; unsubscribed contacts are never reactivated', async () => {
  for (const status of ['subscribed', 'unsubscribed']) {
    const calls = [];
    const reach = createReach({ token: 'test', profileId: 'profile', fetcher: async (url, options) => {
      calls.push({ url, ...options });
      if (url.includes('/contacts?')) return Response.json({ data: [{ uuid: 'contact', email: signup.email, subscription_status: status }] });
      if (url.endsWith('/tags')) return Response.json({ data: [{ value: 'new-trip', uuid: 'tag' }] });
      return new Response(null, { status: 204 });
    } });
    if (status === 'unsubscribed') { await assert.rejects(() => reach.subscribe(signup.email, ['new-trip'])); assert.equal(calls.length, 1); }
    else { assert.equal((await reach.subscribe(signup.email, ['new-trip'])).status, 'subscribed'); assert.ok(calls.some(call => call.url.endsWith('/tags/tag/contacts/contact'))); assert.ok(calls.every(call => !['PATCH', 'DELETE'].includes(call.method))); }
  }
});

test('new pending contacts receive separate tags and require confirmation', async () => {
  let searches = 0; let created;
  const reach = createReach({ token: 'test', profileId: 'profile', fetcher: async (url, options) => {
    if (url.includes('/contacts?')) return Response.json({ data: ++searches === 1 ? [] : [{ uuid: 'contact', email: signup.email, subscription_status: 'pending' }] });
    if (url.endsWith('/tags')) return Response.json({ data: [{ value: 'trip', uuid: 'tag-trip' }, { value: NEWSLETTER_TAG, uuid: 'tag-news' }] });
    if (url.endsWith('/contacts')) { created = JSON.parse(options.body); return Response.json({ success: true }); }
    return new Response(null, { status: 204 });
  } });
  assert.equal((await reach.subscribe(signup.email, ['trip', NEWSLETTER_TAG])).status, 'pending_confirmation');
  assert.deepEqual(created.tag_uuids, ['tag-trip', 'tag-news']);
});

test('rate limit remains bounded under concurrent submissions', async () => {
  const db = store();
  const results = await Promise.allSettled(Array.from({ length: 10 }, () => limitRequests(db, 'ip', 3, 100000)));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 3);
});

test('catalog remains independent from waiting lists, missing trips never create broken launch links', () => {
  const content = normalizeContent({ trips: [{ title: 'Bali', slug: 'bali' }], waitlists: [{ ...list, slug: 'bali-2027' }, { ...list, slug: 'bali-2027' }] });
  assert.equal(content.trips.length, 1); assert.equal(content.waitlists.length, 1);
  assert.equal(waitlistPhase({ status: 'available', trip: null }), 'unavailable');
  assert.equal(waitlistPhase({ status: 'available', trip: { slug: 'bali' } }), 'available');
});
