import { randomUUID } from 'node:crypto';
import { ServiceError } from './errors.js';
import { json, configured, privateStore, privateKey, getWaitlist, limitRequests } from './services.js';
import { WAITLIST_CONSENT, NEWSLETTER_CONSENT, GENERAL_NEWSLETTER_CONSENT, WAITLIST_PRIVACY_VERSION } from '../src/lib/waitlists.js';

export function waitlistName(item) {
  const slug = typeof item.slug === 'string' ? item.slug : item.slug?.current;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) throw new ServiceError('invalid_waitlist');
  const label = slug.replaceAll('-', ' ');
  return 'Lista d’attesa · ' + label[0].toUpperCase() + label.slice(1);
}
export function createSubscribeHandler(overrides = {}) {
  const deps = { configured, store: privateStore, hash: privateKey, getWaitlist, limit: limitRequests, wake: () => {}, ...overrides };
  return async (request, context = {}) => {
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    if (request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'origin_not_allowed' }, 403);
    if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'invalid_request' }, 415);
    try {
      const raw = await request.text();
      if (Buffer.byteLength(raw) > 4096) return json({ error: 'invalid_request' }, 413);
      let input; try { input = JSON.parse(raw); } catch { return json({ error: 'invalid_request' }, 400); }
      if (!input || typeof input !== 'object' || Array.isArray(input) || input.website) return json({ error: 'invalid_request' }, 400);
      const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
      if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'invalid_email' }, 400);
      const waiting = new URL(request.url).pathname === '/api/waitlist';
      if (typeof input.newsletter !== 'boolean' || input.privacy !== true || (!waiting && input.newsletter !== true)) return json({ error: 'consent_required' }, 400);
      if (waiting && (typeof input.waitlistId !== 'string' || !/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,127}$/.test(input.waitlistId) || /^(drafts|versions)\./.test(input.waitlistId))) return json({ error: 'invalid_request' }, 400);
      if (!deps.configured()) return json({ error: 'not_configured' }, 503);
      const store = deps.store();
      await deps.limit(store, 'subscriptions:' + deps.hash(email), 5);
      await deps.limit(store, 'subscriptions-global', 30);
      const item = waiting ? await deps.getWaitlist(input.waitlistId) : null;
      if (waiting && (!item || item.status !== 'collecting')) return json({ error: 'list_closed' }, 409);
      // Older open tabs do not send an id; new tabs reuse their id on network retries.
      const requestId = input.requestId || randomUUID();
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) return json({ error: 'invalid_request' }, 400);
      const key = `subscriptions/${deps.hash(email)}/${requestId}`;
      await store.withLock(deps.hash(email), async () => {
        if (await store.getJSON(key)) return;
        await store.setJSON(key, {
          requestId, provider: 'brevo', kind: waiting ? 'waitlist' : 'newsletter', email, at: new Date().toISOString(),
          waitlistId: item?._id || null, waitlistSlug: typeof item?.slug === 'string' ? item.slug : item?.slug?.current,
          waitlistName: waiting ? waitlistName(item) : null, consenso_newsletter: input.newsletter,
          privacy_accepted: true, privacyVersion: WAITLIST_PRIVACY_VERSION,
          waitlistConsent: waiting ? WAITLIST_CONSENT : null,
          newsletterConsent: input.newsletter ? (waiting ? NEWSLETTER_CONSENT : GENERAL_NEWSLETTER_CONSENT) : null,
          status: 'queued',
        });
      });
      deps.wake();
      return json({ status: 'accepted' });
    } catch (error) {
      const code = error instanceof ServiceError ? error.code : 'storage_error';
      console.error('Subscription save failed:', code);
      return json({ error: error.code === 'rate_limit' ? 'rate_limit' : 'subscription_failed' }, error instanceof ServiceError ? error.status : 503);
    }
  };
}
export default createSubscribeHandler();
