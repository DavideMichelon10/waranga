import { createHash } from 'node:crypto';

export class BrevoError extends Error {
  constructor(code, status = 0) { super(code); this.code = code; this.status = status; }
}
export function createBrevoApi({ token = process.env.BREVO_API_KEY, fetcher = fetch } = {}) {
  return async (path, method = 'GET', body) => {
    if (!token) throw new BrevoError('brevo_not_configured');
    let response;
    try {
      response = await fetcher('https://api.brevo.com/v3' + path, {
        method, redirect: 'error', signal: AbortSignal.timeout(12000),
        headers: { 'api-key': token, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch { throw new BrevoError('brevo_network_error'); }
    // Never log response bodies: they may contain contact data or credentials.
    if (!response.ok) throw new BrevoError(`brevo_http_${response.status}`, response.status);
    if (response.status === 204) return null;
    try { return await response.json(); } catch { throw new BrevoError('brevo_invalid_response'); }
  };
}
export const trialAttributes = {
  request: 'Wananga ID invio', form: 'Modulo di provenienza', trip: 'Viaggio richiesto',
  date: 'Data invio candidatura', phone: 'Telefono candidato', people: 'Numero partecipanti',
};
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const submissionReference = record => createHash('sha256').update(record.email.toLowerCase() + '\0' + record.requestId).digest('hex');
export function submissionNote(record) {
  const rows = [
    ['Modulo', record.kind === 'application' ? 'Candidatura viaggio' : 'Contattaci'],
    ['Pagina del modulo', record.kind === 'application' ? '/candidatura/' + record.tripSlug : '/contattaci'],
    ['Viaggio', record.viaggio], ['Data invio', record.at], ['Nome', record.nome], ['Email', record.email],
    ['Telefono', record.telefono], ['Età', record.eta], ['Numero persone', record.numero_persone],
    ['Fascia oraria preferita', record.contatto_preferito], ['Messaggio', record.messaggio],
    ['Motivazione', record.motivazione], ['Esperienza di gruppo', record.esperienza_gruppo], ['Informazioni aggiuntive', record.info_utili],
    ['Privacy accettata', record.privacy_accepted ? 'Sì' : 'No'], ['Versione privacy', record.privacyVersion],
    ['Newsletter richiesta in questo invio', record.consenso_newsletter ? 'Sì' : 'No'],
  ];
  return '<p><strong>Prova Wānanga · invio completo dal sito</strong></p>' + rows.filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `<p><strong>${escape(k)}</strong><br />${escape(v).replace(/\n/g, '<br />')}</p>`).join('') + `<p>Riferimento invio: ${submissionReference(record)}</p>`;
}
export function trialEligible(email, env = process.env) {
  return env.BREVO_TRIAL_ENABLED === 'true' && Boolean(env.BREVO_API_KEY) &&
    (env.BREVO_TRIAL_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());
}
export function createBrevoTrialClient({ api = createBrevoApi(), pipelineId = process.env.BREVO_TRIAL_PIPELINE_ID, stageId = process.env.BREVO_TRIAL_STAGE_ID } = {}) {
  let config;
  async function configuration() {
    if (config) return config;
    const [pipelines, attributes] = await Promise.all([api('/crm/pipeline/details/all'), api('/crm/attributes/deals')]);
    const pipeline = pipelineId ? pipelines.find(p => p.pipeline === pipelineId) : pipelines.length === 1 ? pipelines[0] : null;
    const stage = pipeline?.stages?.find(s => s.id === stageId) || (!stageId && pipeline?.stages?.[0]);
    const fields = Object.fromEntries(Object.entries(trialAttributes).map(([key, label]) => [key, attributes.find(a => a.label === label && a.attributeTypeName === 'text')?.internalName]));
    if (!pipeline || !stage || Object.values(fields).some(v => !v)) throw new BrevoError('brevo_trial_setup_required');
    return (config = { pipeline: pipeline.pipeline, stage: stage.id, fields });
  }
  async function findPaged(path, select, match) {
    for (let page = 0; page < 100; page++) {
      const data = await api(path + (path.includes('?') ? '&' : '?') + `limit=50&offset=${page * 50}`);
      const items = select(data);
      if (!Array.isArray(items)) throw new BrevoError('brevo_invalid_response');
      const found = items.find(match);
      if (found) return found;
      if (items.length < 50) return null;
    }
    throw new BrevoError('brevo_search_limit');
  }
  return { async submit(record, receipt, checkpoint) {
    const c = await configuration();
    const state = { ...receipt };
    const save = async patch => { Object.assign(state, patch); await checkpoint({ ...state }); };
    const ref = submissionReference(record);
    if (!state.contactId) {
      let contact;
      try { contact = await api('/contacts/' + encodeURIComponent(record.email)); }
      catch (error) { if (error.status !== 404) throw error; }
      if (!contact) {
        // Trial contacts are not subscribed to marketing. Existing preferences are untouched.
        contact = await api('/contacts', 'POST', { email: record.email, attributes: { FIRSTNAME: record.nome }, emailBlacklisted: true, smsBlacklisted: true, updateEnabled: false });
      }
      if (!Number.isInteger(contact?.id)) throw new BrevoError('brevo_missing_contact_id');
      await save({ contactId: contact.id });
    }
    if (!state.dealId) {
      const existing = await findPaged('/crm/deals?' + new URLSearchParams({ 'filters[linkedContactsIds]': String(state.contactId) }), d => d.items, d => d.attributes?.[c.fields.request] === ref && d.linkedContactsIds?.includes(state.contactId));
      if (existing) await save({ dealId: existing.id, dealIntent: false });
      else {
        // An interrupted POST can have succeeded remotely. Never blindly create again.
        if (state.dealIntent) throw new BrevoError('brevo_deal_reconcile_required');
        await save({ dealIntent: true });
        let deal;
        try {
          deal = await api('/crm/deals', 'POST', {
            name: `[PROVA] ${record.kind === 'application' ? 'Candidatura · ' + record.viaggio : 'Contattaci'} · ${record.nome} · ${record.at.slice(0, 10)}`.slice(0, 200),
            linkedContactsIds: [state.contactId], attributes: {
              pipeline: c.pipeline, deal_stage: c.stage, [c.fields.request]: ref,
              [c.fields.form]: record.kind === 'application' ? 'Candidatura viaggio' : 'Contattaci',
              [c.fields.trip]: record.viaggio || 'Richiesta generale', [c.fields.date]: record.at,
              [c.fields.phone]: record.telefono || '', [c.fields.people]: record.numero_persone || '',
            },
          });
        } catch (error) {
          if (error.status >= 400 && error.status < 500) await save({ dealIntent: false });
          throw error;
        }
        if (!deal?.id) throw new BrevoError('brevo_missing_deal_id');
        await save({ dealId: deal.id, dealIntent: false });
      }
    }
    if (!state.noteId) {
      const marker = `Riferimento invio: ${ref}`;
      const existing = await findPaged('/crm/notes?' + new URLSearchParams({ entity: 'deals', entityIds: state.dealId }), d => d, n => n.text?.includes(marker) && n.dealIds?.includes(state.dealId));
      if (existing) await save({ noteId: existing.id, noteIntent: false });
      else {
        if (state.noteIntent) throw new BrevoError('brevo_note_reconcile_required');
        await save({ noteIntent: true });
        let note;
        try { note = await api('/crm/notes', 'POST', { text: submissionNote(record), contactIds: [state.contactId], dealIds: [state.dealId] }); }
        catch (error) {
          if (error.status >= 400 && error.status < 500) await save({ noteIntent: false });
          throw error;
        }
        if (!note?.id) throw new BrevoError('brevo_missing_note_id');
        await save({ noteId: note.id, noteIntent: false });
      }
    }
    return state;
  } };
}
