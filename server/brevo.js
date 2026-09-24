import { createHash } from 'node:crypto';
import { isIP } from 'node:net';

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
    if (!response.ok) {
      const error = new BrevoError(`brevo_http_${response.status}`, response.status);
      if (response.status === 401) {
        const data = await response.json().catch(() => ({}));
        const ip = /IP address\s+([a-f0-9:.]+)/i.exec(data.message || '')?.[1]?.replace(/\.$/, '');
        if (ip && isIP(ip)) error.unauthorizedIp = ip;
      }
      throw error;
    }
    if (response.status === 204) return null;
    try { return await response.json(); } catch { throw new BrevoError('brevo_invalid_response'); }
  };
}
export const dealAttributes = {
  request: 'Wananga ID invio', form: 'Modulo di provenienza', trip: 'Viaggio richiesto',
  date: 'Data invio candidatura', phone: 'Telefono candidato', people: 'Numero partecipanti',
};
export const formLabel = r => ({ contact: 'Contattaci', application: 'Candidatura viaggio', newsletter: 'Newsletter', waitlist: 'Lista d’attesa' }[r.kind] || 'Importazione contatto');
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const submissionReference = record => createHash('sha256').update(record.email.toLowerCase() + '\0' + record.requestId).digest('hex');
export function submissionNote(record) {
  const rows = [
    ['Modulo', formLabel(record)],
    ['Pagina del modulo', record.kind === 'application' ? '/candidatura/' + record.tripSlug : record.kind === 'contact' ? '/contattaci' : record.kind === 'newsletter' ? '/newsletter' : 'Lista d’attesa: ' + (record.waitlistSlug || record.waitlistId || '')],
    ['Viaggio', record.viaggio], ['Data invio', record.at], ['Nome', record.nome], ['Email', record.email],
    ['Telefono', record.telefono], ['Età', record.eta], ['Numero persone', record.numero_persone],
    ['Fascia oraria preferita', record.contatto_preferito], ['Messaggio', record.messaggio],
    ['Motivazione', record.motivazione], ['Esperienza di gruppo', record.esperienza_gruppo], ['Informazioni aggiuntive', record.info_utili],
    ['Privacy accettata', record.privacy_accepted ? 'Sì' : 'No'], ['Versione privacy', record.privacyVersion],
    ['Newsletter richiesta in questo invio', record.consenso_newsletter ? 'Sì' : 'No'],
    ['Lista d’attesa', record.waitlistName], ['Testo consenso lista', record.waitlistConsent], ['Testo consenso newsletter', record.newsletterConsent],
    ['Stato originale', record.originalStatus], ['Dati importati', record.importedDetails],
  ];
  return '<p><strong>Wānanga · invio completo dal sito</strong></p>' + rows.filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `<p><strong>${escape(k)}</strong><br />${escape(v).replace(/\n/g, '<br />')}</p>`).join('') + `<p>Riferimento invio: ${submissionReference(record)}</p>`;
}
export function createBrevoClient({ api = createBrevoApi(), pipelineId = process.env.BREVO_PIPELINE_ID, stageId = process.env.BREVO_STAGE_ID } = {}) {
  let config;
  async function configuration() {
    if (config) return config;
    const [pipelines, attributes, contactAttributes] = await Promise.all([api('/crm/pipeline/details/all'), api('/crm/attributes/deals'), api('/contacts/attributes')]);
    const pipeline = pipelineId ? pipelines.find(p => p.pipeline === pipelineId) : pipelines.length === 1 ? pipelines[0] : null;
    const stage = pipeline?.stages?.find(s => s.id === stageId) || (!stageId && pipeline?.stages?.[0]);
    const fields = Object.fromEntries(Object.entries(dealAttributes).map(([key, label]) => [key, attributes.find(a => a.label === label && a.attributeTypeName === 'text')?.internalName]));
    if (!pipeline || !stage || Object.values(fields).some(v => !v)) throw new BrevoError('brevo_setup_required');
    const nameField = contactAttributes.attributes?.find(a => a.field_key === 'firstname')?.name || contactAttributes.attributes?.find(a => ['FIRSTNAME', 'NOME', 'PRENOM'].includes(a.name))?.name;
    if (!nameField) throw new BrevoError('brevo_contact_name_field_missing');
    return (config = { pipeline: pipeline.pipeline, stage: stage.id, fields, nameField, placement: pipelineId || stageId ? { pipeline: pipeline.pipeline, deal_stage: stage.id } : {} });
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
  let folderId;
  const lists = new Map();
  async function ensureList(name) {
    if (lists.has(name)) return lists.get(name);
    if (!folderId) {
      const folder = await findPaged('/contacts/folders', d => d.folders, f => f.name === 'Wānanga');
      folderId = folder?.id || (await api('/contacts/folders', 'POST', { name: 'Wānanga' })).id;
      if (!folderId) throw new BrevoError('brevo_missing_folder');
    }
    const existing = await findPaged(`/contacts/folders/${folderId}/lists`, d => d.lists, l => l.name === name);
    const id = existing?.id || (await api('/contacts/lists', 'POST', { name, folderId })).id;
    if (!id) throw new BrevoError('brevo_missing_list');
    lists.set(name, id); return id;
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
        const marketingAllowed = record.allowMarketing === true || (!record.imported && (record.consenso_newsletter || record.kind === 'waitlist'));
        try {
          contact = await api('/contacts', 'POST', { email: record.email, attributes: record.nome ? { [c.nameField]: record.nome } : {}, emailBlacklisted: !marketingAllowed, smsBlacklisted: true, updateEnabled: false });
        } catch (error) {
          if (error.status !== 400) throw error;
          // Recover an email creation race only after finding the exact contact.
          contact = await api('/contacts/' + encodeURIComponent(record.email));
        }
      }
      if (!Number.isInteger(contact?.id)) throw new BrevoError('brevo_missing_contact_id');
      // Never clear an existing Brevo suppression. An imported opt-out can only tighten it.
      if (record.suppressMarketing === true && contact.emailBlacklisted !== true) await api('/contacts/' + contact.id, 'PUT', { emailBlacklisted: true });
      await save({ contactId: contact.id });
    }
    if (!state.audiencesSaved) {
      const names = [...(record.audiences || [])];
      if (record.kind === 'contact') names.push('Contatti dal sito');
      if (record.kind === 'application') names.push('Candidature', 'Viaggio · ' + record.viaggio);
      if (record.kind === 'waitlist') names.push(record.waitlistName || 'Liste d’attesa');
      if (record.consenso_newsletter) names.push(record.imported && ['failed', 'requested'].includes(record.originalStatus) ? 'Richieste newsletter da verificare' : 'Newsletter');
      for (const name of new Set(names)) {
        const listId = await ensureList(name.slice(0, 200));
        // Read membership so retries are safe even if the add response was lost.
        const contact = await api('/contacts/' + state.contactId);
        if (!contact.listIds?.includes(listId)) await api(`/contacts/lists/${listId}/contacts/add`, 'POST', { ids: [state.contactId] });
      }
      await save({ audiencesSaved: true });
    }
    const isForm = ['contact', 'application'].includes(record.kind);
    if (isForm && !state.dealId) {
      const existing = await findPaged('/crm/deals', d => d.items, d => d.attributes?.[c.fields.request] === ref);
      if (existing) {
        if (!existing.linkedContactsIds?.includes(state.contactId)) await api('/crm/deals/' + existing.id, 'PATCH', { linkedContactsIds: [...new Set([...(existing.linkedContactsIds || []), state.contactId])] });
        await save({ dealId: existing.id, dealIntent: false });
      }
      else {
        // An interrupted POST can have succeeded remotely. Never blindly create again.
        if (state.dealIntent) throw new BrevoError('brevo_deal_reconcile_required');
        await save({ dealIntent: true });
        let deal;
        try {
          deal = await api('/crm/deals', 'POST', {
            name: `${record.kind === 'application' ? 'Candidatura · ' + record.viaggio : 'Contattaci'} · ${record.nome} · ${record.at.slice(0, 10)}`.slice(0, 200),
            linkedContactsIds: [state.contactId], attributes: {
              ...c.placement, [c.fields.request]: ref,
              [c.fields.form]: formLabel(record),
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
      const existing = await findPaged('/crm/notes?' + new URLSearchParams({ entity: isForm ? 'deals' : 'contacts', entityIds: String(isForm ? state.dealId : state.contactId) }), d => d, n => n.text?.includes(marker));
      if (existing) {
        if (!existing.contactIds?.includes(state.contactId)) await api('/crm/notes/' + existing.id, 'PATCH', { text: existing.text, contactIds: [...new Set([...(existing.contactIds || []), state.contactId])], ...(isForm ? { dealIds: existing.dealIds } : {}) });
        await save({ noteId: existing.id, noteIntent: false });
      }
      else {
        if (state.noteIntent) throw new BrevoError('brevo_note_reconcile_required');
        await save({ noteIntent: true });
        let note;
        try { note = await api('/crm/notes', 'POST', { text: submissionNote(record), contactIds: [state.contactId], ...(isForm ? { dealIds: [state.dealId] } : {}) }); }
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
