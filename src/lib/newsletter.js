import { WAITLIST_PRIVACY_VERSION } from './waitlists.js';

const pending = new Map();
async function subscribe(payload, path) {
  const key = path + ':' + JSON.stringify(payload);
  if (!pending.has(key)) pending.set(key, crypto.randomUUID());
  const response = await fetch(path, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'omit', body: JSON.stringify({ ...payload, requestId: pending.get(key), privacyVersion: WAITLIST_PRIVACY_VERSION }),
    signal: AbortSignal.timeout(30000),
  });
  let result;
  try { result = await response.json(); } catch { throw new Error('Le iscrizioni non sono disponibili in questo momento. Riprova più tardi.'); }
  if (!response.ok || !['subscribed', 'pending_confirmation', 'accepted'].includes(result.status)) {
    const messages = {
      not_configured: 'Le iscrizioni non sono ancora attive. La tua email non è stata salvata.',
      list_closed: 'Questa lista non raccoglie più iscrizioni. Ricarica la pagina per scoprire le novità.',
      rate_limit: 'Hai effettuato diversi tentativi. Attendi un minuto e riprova.',
      consent_required: 'Conferma di aver letto l’informativa privacy.', invalid_email: 'Inserisci un indirizzo email valido.',
    };
    throw new Error(messages[result.error] || 'Non siamo riusciti a completare l’iscrizione. Riprova tra poco.');
  }
  pending.delete(key);
  return result.status;
}
export const newsletterEnabled = true;
export const subscribeToNewsletter = email => subscribe({ email, privacy: true, newsletter: true }, '/api/newsletter');
export const subscribeToWaitlist = payload => subscribe(payload, '/api/waitlist');
