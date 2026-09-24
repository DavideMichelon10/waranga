import { configured, json, privateKey, reachClient, sanityQuery } from './services.js';
import { ServiceError } from './reach.js';

export const FORM_PRIVACY_VERSION = 'forms-v1';
const text = (value, maximum, optional = false) => {
  if (optional && (value === undefined || value === '')) return '';
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maximum || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new ServiceError('invalid_fields', 400);
  return value.trim();
};
export function validateForm(input, kind) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || input.website) throw new ServiceError('invalid_fields', 400);
  if (input.privacy_accepted !== true || typeof input.consenso_newsletter !== 'boolean') throw new ServiceError('consent_required', 400);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.requestId || '')) throw new ServiceError('invalid_fields', 400);
  const data = { requestId: input.requestId, kind, nome: text(input.nome, 120), email: text(input.email, 254).toLowerCase(), privacy_accepted: true, consenso_newsletter: input.consenso_newsletter };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new ServiceError('invalid_email', 400);
  if (kind === 'contact') data.messaggio = text(input.messaggio, 5000);
  else {
    data.tripSlug = text(input.tripSlug, 120);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.tripSlug)) throw new ServiceError('invalid_fields', 400);
    data.telefono = text(input.telefono, 40);
    if (!/^[+\d\s().-]{7,40}$/.test(data.telefono) || data.telefono.replace(/\D/g, '').length < 7) throw new ServiceError('invalid_phone', 400);
    data.eta = Number(input.eta);
    if (!Number.isInteger(data.eta) || data.eta < 1 || data.eta > 120) throw new ServiceError('invalid_fields', 400);
    if (!['1','2','3','4','5+'].includes(input.numero_persone) || !['mattino','pomeriggio','sera'].includes(input.contatto_preferito) || !['Sì','No'].includes(input.esperienza_gruppo)) throw new ServiceError('invalid_fields', 400);
    for (const key of ['numero_persone','contatto_preferito','esperienza_gruppo']) data[key] = input[key];
    data.motivazione = text(input.motivazione, 2000);
    data.info_utili = text(input.info_utili, 1900, true);
  }
  return data;
}
export function createFormHandler({ store, reach = reachClient, enabled = configured, hash = privateKey, getTrip = slug => sanityQuery('*[_type == "trip" && slug.current == $slug][0]{_id,title,status}', { slug }) }) {
  return async (request, context = {}) => {
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    if (request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'origin_not_allowed' }, 403);
    if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'invalid_request' }, 415);
    try {
      const raw = await request.text();
      if (Buffer.byteLength(raw) > 24000) throw new ServiceError('invalid_fields', 413);
      let input; try { input = JSON.parse(raw); } catch { throw new ServiceError('invalid_fields', 400); }
      const kind = new URL(request.url).pathname === '/api/contact' ? 'contact' : 'application';
      const data = validateForm(input, kind);
      if (!enabled()) return json({ error: 'not_configured' }, 503);
      const db = store();
      const key = `forms/${hash(data.email)}/${data.requestId}`;
      return await db.withLock(hash(data.email), async () => {
        const previous = await db.getJSON(key);
        if (previous?.status === 'received') return json({ status: 'received', newsletter: previous.newsletterStatus });
        await db.limit('forms:' + hash(context.ip || 'unknown'), 4);
        await db.limit('reach-subscriptions', 10);
        if (kind === 'application') {
          const trip = await getTrip(data.tripSlug);
          if (!trip || !['interest','open'].includes(trip.status)) throw new ServiceError('trip_closed', 409);
          data.viaggio = trip.title;
        }
        const record = { ...data, at: previous?.at || new Date().toISOString(), privacyVersion: FORM_PRIVACY_VERSION, status: 'sending' };
        await db.setJSON(key, record);
        try {
          const result = await reach().submitForm(record);
          await db.setJSON(key, { ...record, status: 'received', contactUuid: result.contactUuid, newsletterStatus: result.newsletter });
          return json({ status: 'received', newsletter: result.newsletter });
        } catch (error) {
          await db.setJSON(key, { ...record, status: 'failed', code: error instanceof ServiceError ? error.code : 'service_error' });
          throw error;
        }
      });
    } catch (error) {
      const code = error instanceof ServiceError ? error.code : 'service_error';
      console.error('Form submission failed:', code);
      return json({ error: ['invalid_fields','invalid_email','invalid_phone','consent_required','trip_closed','rate_limit','request_in_progress'].includes(code) ? code : 'submission_failed' }, error instanceof ServiceError ? error.status : 503);
    }
  };
}
