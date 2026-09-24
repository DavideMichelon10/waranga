import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readdir, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHostingerStore } from '../server/hostinger-store.js';
import { createHostingerServer } from '../server/hostinger.js';
import { createSubscribeHandler } from '../server/subscribe.js';

async function fixture(t) {
  const path = await mkdtemp(join(tmpdir(), 'wananga-hostinger-'));
  t.after(() => rm(path, { recursive: true, force: true }));
  return path;
}

test('Hostinger consent survives a new store and concurrent rate limits stay bounded', async t => {
  const path = await fixture(t);
  const a = createHostingerStore(path), b = createHostingerStore(path);
  await a.setJSON('consent/example/unique', { status: 'requested' });
  await b.setJSON('consent/example/unique', { status: 'subscribed' });
  const files = await readdir(join(path, 'consent'));
  assert.equal(files.length, 1);
  assert.equal(JSON.parse(await readFile(join(path, 'consent', files[0]))).status, 'subscribed');
  const results = await Promise.allSettled(Array.from({ length: 12 }, (_, i) => (i % 2 ? a : b).limit('ip', 5)));
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 5);
});

test('Hostinger serves SPA and validates newsletter requests before reaching provider', async t => {
  const path = await fixture(t);
  await writeFile(join(path, 'index.html'), '<html>Wananga</html>');
  await writeFile(join(path, '.env'), 'PRIVATE');
  await symlink('/etc/passwd', join(path, 'escape.txt'));
  let calls = 0;
  const handler = createSubscribeHandler({ configured: () => true, store: () => ({ setJSON: async () => {} }), hash: () => 'hashed', limit: async () => {}, reach: () => ({ subscribe: async () => { calls++; return { status: 'pending_confirmation' }; } }) });
  const server = createHostingerServer({ origin: 'https://test.example', dist: path, handler });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(base + '/newsletter', { headers: { Accept: 'text/html' } });
  assert.equal(page.headers.get('cache-control'), 'no-store');
  assert.match(await page.text(), /Wananga/);
  for (const route of ['/hcgi/platform/api/collections/contatti/records', '/hcgi/platform/api/collections/candidature/records']) {
    assert.equal((await fetch(base + route)).status, 405);
    assert.equal((await fetch(base + route, { method: 'POST', headers: { Origin: 'https://other.example', 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
  }
  for (const route of ['/.env', '/escape.txt', '/api/unknown', '/missing.js']) assert.equal((await fetch(base + route)).status, 404);
  assert.equal((await fetch(base + '/api/newsletter')).status, 405);
  const send = (body, origin = 'https://test.example') => fetch(base + '/api/newsletter', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const input = { email: 'test@example.com', privacy: true, newsletter: true };
  assert.equal((await send(input, 'https://evil.example')).status, 403);
  assert.equal((await send({ ...input, privacy: false })).status, 400);
  assert.equal((await send({ ...input, padding: 'x'.repeat(5000) })).status, 413);
  assert.equal(calls, 0);
  const result = await send(input);
  assert.equal(result.status, 200);
  assert.equal((await result.json()).status, 'pending_confirmation');
  assert.equal(calls, 1);
});
