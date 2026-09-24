import { createHmac } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { ServiceError } from './errors.js';
import { SANITY_PROJECT_ID, SANITY_DATASET } from '../src/lib/integrations.js';

export const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
export function privateStore() { return getStore({ name: 'wananga-private', consistency: 'strong' }); }
export function configured(env = process.env) {
  return env.BREVO_ENABLED === 'true' && Boolean(env.BREVO_API_KEY && env.CONSENT_HASH_SECRET);
}
export function privateKey(value, secret = process.env.CONSENT_HASH_SECRET) {
  if (!secret) throw new ServiceError('not_configured');
  return createHmac('sha256', secret).update(value).digest('hex');
}
export async function sanityQuery(query, params = {}, fetcher = fetch) {
  const project = process.env.SANITY_PROJECT_ID || SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET || SANITY_DATASET;
  if (!/^[a-z0-9]+$/.test(project) || !/^[a-z0-9_-]+$/.test(dataset)) throw new ServiceError('invalid_sanity_config');
  const url = new URL(`https://${project}.api.sanity.io/v2025-02-19/data/query/${dataset}`);
  url.searchParams.set('query', query); url.searchParams.set('perspective', 'published');
  for (const [key, value] of Object.entries(params)) url.searchParams.set(`$${key}`, JSON.stringify(value));
  const response = await fetcher(url, { signal: AbortSignal.timeout(10000), cache: 'no-store' });
  if (!response.ok) throw new ServiceError('sanity_unavailable');
  const body = await response.json();
  if (body.error) throw new ServiceError('sanity_unavailable');
  return body.result;
}
export const getWaitlist = id => sanityQuery('*[_type == "waitlist" && _id == $id][0]{..., "trip": trip->{_id,title,"slug":slug.current,status}}', { id });
export async function limitRequests(store, key, limit, now = Date.now()) {
  const bucket = `rate/${key}/${Math.floor(now / 60000)}`;
  for (let retry = 0; retry < 4; retry++) {
    const entry = await store.getWithMetadata(bucket, { type: 'json' });
    const count = entry?.data?.count || 0;
    if (count >= limit) throw new ServiceError('rate_limit', 429);
    const result = await store.setJSON(bucket, { count: count + 1 }, entry ? { onlyIfMatch: entry.etag } : { onlyIfNew: true });
    if (result.modified) return;
  }
  throw new ServiceError('rate_limit', 429);
}
