import { randomUUID } from 'node:crypto';
import { audienceName, NEWSLETTER_TAG, ServiceError } from './reach.js';
import { json, configured, privateStore, privateKey, reachClient, getWaitlist, limitRequests } from './services.js';
import { WAITLIST_CONSENT, NEWSLETTER_CONSENT, GENERAL_NEWSLETTER_CONSENT, WAITLIST_PRIVACY_VERSION } from '../src/lib/waitlists.js';

export function createSubscribeHandler(overrides = {}) {
  const deps = { configured, store: privateStore, hash: privateKey, reach: reachClient, getWaitlist, limit: limitRequests, ...overrides };
  return async (request, context = {}) => {
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return json({ error: 'origin_not_allowed' }, 403);
    if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'invalid_request' }, 415);
    try {
      const raw = await request.text();
      if (raw.length > 4096) return json({ error: 'invalid_request' }, 413);
      let input; try { input = JSON.parse(raw); } catch { return json({ error: 'invalid_request' }, 400); }
      if (!input || typeof input !== 'object' || input.website) return json({ error: 'invalid_request' }, 400);
      const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
      if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'invalid_email' }, 400);
      const waiting = typeof input.waitlistId === 'string';
      if (typeof input.newsletter !== 'boolean' || input.privacy !== true || (!waiting && input.newsletter !== true)) return json({ error: 'consent_required' }, 400);
      if (waiting && (!/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,127}$/.test(input.waitlistId) || input.waitlistId.startsWith('drafts.') || input.waitlistId.startsWith('versions.'))) return json({ error: 'invalid_request' }, 400);
      if (!deps.configured()) return json({ error: 'not_configured' }, 503);
      const store = deps.store();
      // A shared cap also protects the Reach profile's API budget.
      await deps.limit(store, deps.hash(context.ip || 'unknown'), 5);
      await deps.limit(store, 'reach-subscriptions', 10);
      const item = waiting ? await deps.getWaitlist(input.waitlistId) : null;
      if (waiting && (!item || item.status !== 'collecting')) return json({ error: 'list_closed' }, 409);
      const names = [...(waiting ? [audienceName(item._id)] : []), ...(input.newsletter ? [NEWSLETTER_TAG] : [])];
      const key = `consent/${deps.hash(email)}/${randomUUID()}`;
      const consent = { email, at: new Date().toISOString(), waitlistId: item?._id || null, newsletter: input.newsletter, privacyVersion: WAITLIST_PRIVACY_VERSION, waitlistConsent: waiting ? WAITLIST_CONSENT : null, newsletterConsent: input.newsletter ? (waiting ? NEWSLETTER_CONSENT : GENERAL_NEWSLETTER_CONSENT) : null, status: 'requested' };
      await store.setJSON(key, consent);
      try {
        const result = await deps.reach().subscribe(email, names);
        await store.setJSON(key, { ...consent, status: result.status, contactUuid: result.contactUuid || null });
        return json({ status: result.status });
      } catch (error) {
        await store.setJSON(key, { ...consent, status: 'failed', code: error instanceof ServiceError ? error.code : 'service_error' });
        throw error;
      }
    } catch (error) {
      // Log only known error codes; never log payloads, upstream bodies or credentials.
      const code = error instanceof ServiceError ? error.code : ['EACCES', 'EPERM', 'EROFS', 'ENOENT', 'ENOSPC'].includes(error.code) ? error.code : 'service_error';
      console.error('Reach subscription failed:', code);
      return json({ error: error.code === 'rate_limit' || error.status === 429 ? 'rate_limit' : 'subscription_failed' }, error.status || 503);
    }
  };
}
export default createSubscribeHandler();
