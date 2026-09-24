import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleHistory } from './form-history.js';
import { createFormHandler } from './forms.js';
import { createSubscribeHandler } from './subscribe.js';
import { createHostingerStore } from './hostinger-store.js';

const projectDirectory = fileURLToPath(new URL('../', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.mp4': 'video/mp4' };

export function createHostingerServer({ origin = process.env.PUBLIC_ORIGIN, directory = process.env.PRIVATE_DATA_DIR, dist = resolve(projectDirectory, 'dist'), handler } = {}) {
  const publicUrl = new URL(origin);
  if (!['http:', 'https:'].includes(publicUrl.protocol) || publicUrl.origin !== origin) throw new Error('PUBLIC_ORIGIN must be a complete origin without a trailing slash');
  const staticRoot = resolve(dist);
  if (directory) {
    const privateRoot = resolve(directory);
    if (privateRoot === staticRoot || privateRoot.startsWith(staticRoot + sep) || privateRoot === resolve(projectDirectory) || privateRoot.startsWith(resolve(projectDirectory) + sep)) throw new Error('PRIVATE_DATA_DIR must be outside the application and public directory');
  }
  let store;
  const subscribe = handler || createSubscribeHandler({
    store: () => (store ||= createHostingerStore(directory)),
    limit: (storage, key, limit) => storage.limit(key, limit),
  });
  const forms = createFormHandler({ store: () => (store ||= createHostingerStore(directory)) });
  return createServer(async (req, res) => {
    const sendJson = (status, error) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify({ error })); };
    try {
      // Use the configured public origin, never untrusted Host/forwarded headers.
      const url = new URL(req.url, origin);
      if (url.origin !== origin) return sendJson(400, 'invalid_request');
      if (url.pathname === '/richieste' || url.pathname.startsWith('/richieste/')) {
        const response = await handleHistory(new Request(url, { method: req.method }), { store: () => (store ||= createHostingerStore(directory)) });
        res.writeHead(response.status, Object.fromEntries(response.headers));
        return res.end(await response.text());
      }
      const formPaths = ['/api/contact', '/api/application', '/hcgi/platform/api/collections/contatti/records', '/hcgi/platform/api/collections/candidature/records'];
      if (['/api/newsletter', '/api/waitlist', ...formPaths].includes(url.pathname)) {
        const isForm = formPaths.includes(url.pathname);
        if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return sendJson(405, 'method_not_allowed'); }
        const chunks = []; let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > (isForm ? 24000 : 4096)) return sendJson(413, 'invalid_request');
          chunks.push(chunk);
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) if (value) headers.set(key, String(value));
        const request = new Request(url, { method: 'POST', headers, body: Buffer.concat(chunks) });
        // Behind a proxy the per-address cap is shared. Do not trust user-supplied X-Forwarded-For.
        const response = await (isForm ? forms : subscribe)(request, { ip: req.socket.remoteAddress });
        res.writeHead(response.status, Object.fromEntries(response.headers));
        return res.end(await response.text());
      }
      if (url.pathname.startsWith('/api/')) return sendJson(404, 'not_found');
      if (!['GET', 'HEAD'].includes(req.method)) return sendJson(405, 'method_not_allowed');
      let pathname;
      try { pathname = decodeURIComponent(url.pathname); } catch { return sendJson(400, 'invalid_request'); }
      if (pathname.includes('\0') || pathname.includes('\\') || pathname.split('/').some(part => part.startsWith('.'))) return sendJson(404, 'not_found');
      const root = await realpath(staticRoot);
      const candidate = resolve(root, '.' + pathname);
      if (candidate !== root && !candidate.startsWith(root + sep)) return sendJson(404, 'not_found');
      let filename;
      try { filename = await realpath(pathname === '/' ? resolve(root, 'index.html') : candidate); }
      catch (error) {
        if (error.code !== 'ENOENT' || extname(pathname) || !req.headers.accept?.includes('text/html')) return sendJson(404, 'not_found');
        filename = await realpath(resolve(root, 'index.html'));
      }
      if (!filename.startsWith(root + sep)) return sendJson(404, 'not_found');
      const body = await readFile(filename);
      res.writeHead(200, { 'Content-Type': mime[extname(filename)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': extname(filename) === '.html' ? 'no-store' : 'public, max-age=3600' });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch { sendJson(503, 'service_unavailable'); }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createHostingerServer();
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('Wananga server ready'));
}
