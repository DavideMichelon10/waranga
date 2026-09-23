import { Readable } from 'node:stream';
import subscribe from './subscribe.js';

export function localApi() {
  return {
    name: 'wananga-local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0];
        if (!['/api/waitlist', '/api/newsletter'].includes(path)) return next();
        try {
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) if (value) headers.set(key, String(value));
          const request = new Request(`http://${req.headers.host}${req.url}`, { method: req.method, headers, ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body: Readable.toWeb(req), duplex: 'half' } : {}) });
          const response = await subscribe(request, { ip: req.socket.remoteAddress });
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(await response.text());
        } catch {
          res.statusCode = 503; res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'not_configured' }));
        }
      });
    },
  };
}
