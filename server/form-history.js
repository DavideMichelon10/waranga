import { createHmac } from 'node:crypto';

export function historyToken(email, secret = process.env.CONSENT_HASH_SECRET) {
  if (!secret) throw new Error('Missing history secret');
  return createHmac('sha256', secret).update('wananga-form-history-v1\0' + email).digest('hex');
}
export async function saveFormRecord(store, key, record, { secret = process.env.CONSENT_HASH_SECRET } = {}) {
  // Save the independent record first, then the contact's read-only history.
  await store.setJSON(key, record);
  const token = historyToken(record.email, secret);
  const archiveKey = 'form-history/' + token;
  const archive = await store.getJSON(archiveKey);
  const records = archive?.records || await store.findForms(record.email);
  const byId = new Map(records.map(item => [item.requestId, item]));
  byId.set(record.requestId, record);
  await store.setJSON(archiveKey, { email: record.email, records: [...byId.values()].sort((a, b) => b.at.localeCompare(a.at)) });
  return token;
}
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const date = value => new Intl.DateTimeFormat('it-IT', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Rome' }).format(new Date(value));
const field = (label, value) => value !== undefined && value !== null && value !== '' ? `<div class="field"><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>` : '';
export function renderHistory(archive) {
  const latest = archive.records[0];
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Richieste · Wānanga</title><style>
  *{box-sizing:border-box}body{margin:0;background:#f6f2e9;color:#24362d;font:17px/1.6 system-ui,sans-serif}main{max-width:880px;margin:0 auto;padding:44px 24px}a{color:inherit;text-underline-offset:4px;overflow-wrap:anywhere}.brand{font-size:13px;letter-spacing:.16em;font-weight:700}h1{font-size:clamp(28px,5vw,42px);line-height:1.15;margin:20px 0 12px}.meta{color:#5c675d}.actions{display:flex;flex-wrap:wrap;gap:16px;margin:20px 0 32px}.actions a{border:1px solid #a3afa3;border-radius:5px;padding:8px 16px;text-decoration:none}details{background:#fffdf8;border:1px solid #d9ddd3;border-radius:10px;margin:18px 0;padding:20px}summary{cursor:pointer;font-weight:650}small{display:block;font-weight:400;color:#697369}dl{margin:16px 0 0}.field{padding:12px 0;border-top:1px solid #e7e8df}dt{font-size:13px;color:#63705f;text-transform:uppercase;letter-spacing:.04em}dd{margin:4px 0;white-space:pre-wrap;overflow-wrap:anywhere}.note{font-size:13px;line-height:1.6;border-top:1px solid #d9ddd3;padding-top:20px}@media print{body{background:white}.actions,.note{display:none}details{break-inside:avoid}}
  </style></head><body><main><div class="brand">WĀNANGA · RICHIESTE</div><h1>${escape(latest.nome)}</h1><p class="meta">${escape(archive.email)} · ${archive.records.length} ${archive.records.length === 1 ? 'richiesta' : 'richieste'}</p><nav class="actions"><a href="mailto:${escape(encodeURIComponent(archive.email))}">Rispondi via email</a><a href="https://app.brevo.com" target="_blank" rel="noreferrer">Apri Brevo</a></nav>
  ${archive.records.map((item, i) => `<details${i === 0 ? ' open' : ''}><summary>${item.kind === 'application' ? 'Candidatura · ' + escape(item.viaggio || item.tripSlug) : 'Messaggio da Contattaci'}<small>${escape(date(item.at))} · ${item.status === 'received' ? 'Salvata nel CRM' : ['sending', 'queued'].includes(item.status) ? 'Ricevuta · sincronizzazione con Brevo in corso' : 'Invio a Brevo da completare'}</small></summary><dl>${field('Nome', item.nome)}${field('Email', item.email)}${field('Telefono', item.telefono)}${field('Età', item.eta)}${field('Numero persone', item.numero_persone)}${field('Fascia oraria preferita', item.contatto_preferito)}${field('Messaggio', item.messaggio)}${field('Motivazione', item.motivazione)}${field('Esperienza di gruppo', item.esperienza_gruppo)}${field('Informazioni aggiuntive', item.info_utili)}${field('Newsletter richiesta in questo invio', item.consenso_newsletter ? 'Sì' : 'No')}${field('Consenso alla gestione della richiesta', item.privacy_accepted ? 'Fornito al momento dell’invio' : 'Non presente')}</dl></details>`).join('')}
  <p class="note">Scheda riservata. Chi possiede questo collegamento può leggere queste richieste: non condividerlo pubblicamente. Le iscrizioni e le campagne newsletter si gestiscono in Brevo.</p></main></body></html>`;
}
export async function handleHistory(request, { store }) {
  const headers = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'", 'Content-Type': 'text/html; charset=utf-8' };
  const token = new URL(request.url).pathname.match(/^\/richieste\/([a-f0-9]{64})$/)?.[1];
  const missing = () => new Response('Scheda non disponibile.', { status: 404, headers });
  if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405, headers: { ...headers, Allow: 'GET, HEAD' } });
  if (!token) return missing();
  const archive = await store().getJSON('form-history/' + token);
  if (!archive?.records?.length) return missing();
  return new Response(request.method === 'HEAD' ? null : renderHistory(archive), { status: 200, headers });
}
