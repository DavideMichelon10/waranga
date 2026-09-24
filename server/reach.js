import { createHash } from 'node:crypto';
import formFields from './reach-fields.json' with { type: 'json' };

export class ServiceError extends Error {
  constructor(code, status = 503) { super(code); this.code = code; this.status = status; }
}
export const audienceName = id => `wananga-wait-${createHash('sha256').update(id).digest('hex').slice(0, 24)}`;
export const NEWSLETTER_TAG = 'wananga-newsletter';

export function createReach({ token, profileId, fetcher = fetch, pause = ms => new Promise(resolve => setTimeout(resolve, ms)) }) {
  if (!token || !/^[a-zA-Z0-9-]+$/.test(profileId || '')) throw new ServiceError('not_configured');
  const base = `https://developers.hostinger.com/api/reach/v1/profiles/${profileId}`;
  const unwrap = value => value?.data ?? value;
  async function request(path, method = 'GET', body) {
    const response = await fetcher(base + path, {
      method, headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(12000), redirect: 'error',
    });
    if (!response.ok) throw new ServiceError(`reach_${response.status}`, response.status === 429 ? 429 : 503);
    if (response.status === 204) return null;
    return response.json();
  }
  async function findContact(email) {
    for (let page = 1; page <= 10; page++) {
      const response = await request(`/contacts?search=${encodeURIComponent(email)}&per_page=100&page=${page}`);
      const contacts = unwrap(response);
      if (!Array.isArray(contacts)) throw new ServiceError('invalid_reach_response');
      const contact = contacts.find(item => item.email?.toLowerCase() === email);
      if (contact) return contact;
      if (contacts.length < 100 || page >= response.meta?.last_page) return null;
    }
    throw new ServiceError('contact_search_limit');
  }
  async function waitForContact(email) {
    // Reach acknowledges creation before the contact is necessarily queryable.
    for (const delay of [0, 500, 1500, 3000]) {
      if (delay) await pause(delay);
      const contact = await findContact(email);
      if (contact) return contact;
    }
    return null;
  }
  async function ensureTags(names) {
    const tags = unwrap(await request('/tags', 'POST', { names }));
    if (!Array.isArray(tags) || names.some(name => !tags.find(tag => tag.value === name && tag.uuid))) throw new ServiceError('invalid_reach_tags');
    return names.map(name => tags.find(tag => tag.value === name));
  }
  async function subscribe(email, names) {
    let contact = await findContact(email);
    // Never revive an unsubscribed, bounced or otherwise suppressed contact.
    if (contact && !['subscribed', 'pending'].includes(contact.subscription_status)) throw new ServiceError('contact_not_subscribable', 409);
    const tags = await ensureTags(names);
    if (!contact) {
      try {
        await request('/contacts', 'POST', { email, tag_uuids: tags.map(tag => tag.uuid) });
      } catch (error) {
        // Another simultaneous request may have created the contact. Only recover
        // after verifying that exact contact; never overwrite their preferences.
        if (error.code !== 'reach_422' && error.code !== 'reach_409') throw error;
        contact = await findContact(email);
        if (!contact) throw error;
      }
      contact ||= await waitForContact(email);
      if (!contact) return { status: 'accepted' };
    }
    if (!['subscribed', 'pending'].includes(contact.subscription_status)) throw new ServiceError('contact_not_subscribable', 409);
    for (const tag of tags) await request(`/tags/${encodeURIComponent(tag.uuid)}/contacts/${encodeURIComponent(contact.uuid)}`, 'POST');
    // Tags are additive: opting out here never removes an earlier newsletter opt-in.
    return { status: contact.subscription_status === 'pending' ? 'pending_confirmation' : 'subscribed', contactUuid: contact.uuid };
  }
  async function submitForm(data) {
    let contact = await findContact(data.email);
    // Creating an API contact makes it mailable by default. Never create an
    // operational-only contact while an automation could send a welcome email.
    if (!contact && !data.consenso_newsletter) {
      const automations = unwrap(await request('/automations?per_page=100'));
      if (!Array.isArray(automations) || automations.some(a => a.status === 'active') || automations.length >= 100) throw new ServiceError('operational_contact_automation');
    }
    const names = [data.kind === 'contact' ? 'wananga-contatti' : 'wananga-candidature'];
    if (data.kind === 'application') names.push('wananga-viaggio-' + data.tripSlug);
    if (!contact) {
      try {
        await request('/contacts', 'POST', { email: data.email, name: data.nome, note: data.consenso_newsletter ? 'Richiesta dal sito Wānanga' : 'wananga-contact-only' });
      } catch (error) {
        if (!['reach_409', 'reach_422'].includes(error.code)) throw error;
        contact = await findContact(data.email);
        if (!contact) throw error;
      }
      contact ||= await waitForContact(data.email);
      if (!contact) throw new ServiceError('contact_not_ready');
    }
    const values = { request_kind: data.kind === 'contact' ? 'Contattaci' : 'Candidatura', request_at: data.at, newsletter_consent: data.consenso_newsletter ? 'Sì' : 'No' };
    if (data.historyUrl) values.history_url = data.historyUrl;
    if (data.kind === 'contact') values.message = data.messaggio;
    else Object.assign(values, { trip: data.viaggio, age: String(data.eta), people: data.numero_persone, contact_time: data.contatto_preferito, motivation: data.motivazione, experience: data.esperienza_gruppo, notes: data.info_utili, phone: data.telefono });
    const fields = Object.entries(values).flatMap(([key, value]) => {
      const ids = Array.isArray(formFields[key]) ? formFields[key] : [formFields[key]];
      const chars = Array.from(value);
      if (['message', 'motivation', 'notes'].includes(key) && chars.length > 255) {
        if (!data.historyUrl) throw new ServiceError('missing_form_history');
        chars.splice(210); chars.push(...Array.from('… (testo completo nella scheda richieste)'));
      }
      if (!ids[0] || chars.length > ids.length * 255) throw new ServiceError('form_field_capacity');
      return ids.map((uuid, i) => ({ uuid, value: chars.slice(i * 255, (i + 1) * 255).join('') || null }));
    });
    const details = unwrap(await request('/contacts/' + encodeURIComponent(contact.uuid)));
    if (!Array.isArray(details?.fields)) throw new ServiceError('invalid_reach_fields');
    const changed = new Set(fields.map(field => field.uuid));
    const preserved = details.fields.filter(field => !changed.has(field.uuid)).map(field => ({ uuid: field.uuid, ...(['single_choice', 'multi_choice'].includes(field.type) ? { selected_option_uuids: field.selected_option_uuids || [] } : { value: field.value }) }));
    const body = { name: data.nome, fields: [...preserved, ...fields] };
    // Never unsubscribe an existing newsletter member who leaves the box empty.
    // The marker also repairs an interrupted first submission on retry.
    if (!data.consenso_newsletter && contact.note === 'wananga-contact-only') {
      body.subscription_status = 'unsubscribed';
      body.note = 'Richiesta dal sito Wānanga (senza newsletter)';
    }
    if (data.telefono) {
      const phone = data.telefono.replace(/[\s().-]/g, '').replace(/^00/, '+');
      if (/^\+[1-9]\d{6,14}$/.test(phone)) body.phone = phone;
    }
    await request('/contacts/' + encodeURIComponent(contact.uuid), 'PATCH', body);
    for (const tag of await ensureTags(names)) await request(`/tags/${encodeURIComponent(tag.uuid)}/contacts/${encodeURIComponent(contact.uuid)}`, 'POST');
    let newsletter = 'not_requested';
    if (data.consenso_newsletter) {
      if (!['subscribed','pending','confirmed'].includes(contact.subscription_status)) newsletter = 'not_subscribed';
      else {
        try { newsletter = (await subscribe(data.email, [NEWSLETTER_TAG])).status; }
        catch { newsletter = 'failed'; }
      }
    }
    return { contactUuid: contact.uuid, newsletter };
  }
  return { subscribe, submitForm };
}
