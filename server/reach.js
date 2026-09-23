import { createHash } from 'node:crypto';

export class ServiceError extends Error {
  constructor(code, status = 503) { super(code); this.code = code; this.status = status; }
}
export const audienceName = id => `wananga-wait-${createHash('sha256').update(id).digest('hex').slice(0, 24)}`;
export const NEWSLETTER_TAG = 'wananga-newsletter';

export function createReach({ token, profileId, fetcher = fetch }) {
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
      contact ||= await findContact(email);
      if (!contact) return { status: 'accepted' };
    }
    if (!['subscribed', 'pending'].includes(contact.subscription_status)) throw new ServiceError('contact_not_subscribable', 409);
    for (const tag of tags) await request(`/tags/${encodeURIComponent(tag.uuid)}/contacts/${encodeURIComponent(contact.uuid)}`, 'POST');
    // Tags are additive: opting out here never removes an earlier newsletter opt-in.
    return { status: contact.subscription_status === 'pending' ? 'pending_confirmation' : 'subscribed', contactUuid: contact.uuid };
  }
  return { subscribe };
}
