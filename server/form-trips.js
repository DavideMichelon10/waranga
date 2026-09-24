import { sanityQuery } from './services.js';
import { ServiceError } from './errors.js';

// Warm and persist the small trip catalog; submitting a form usually needs no CMS call.
export function createFormTrips({ store, now = Date.now, query = () => sanityQuery('*[_type == "trip"]{title,status,"slug":slug.current}', {}, (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(3000) })) }) {
  let cache;
  let refreshing;
  async function refresh() {
    if (!refreshing) refreshing = (async () => {
      const trips = await query();
      if (!Array.isArray(trips)) throw new ServiceError('trips_unavailable');
      const value = { trips, at: now() };
      await store().setJSON('form-trip-catalog', value);
      cache = value;
    })().finally(() => { refreshing = null; });
    return refreshing;
  }
  return {
    refresh,
    async get(slug) {
      cache ||= await store().getJSON('form-trip-catalog');
      if (!cache || now() - cache.at > 300000) {
        try { await refresh(); } catch { throw new ServiceError('trips_unavailable'); }
      } else if (now() - cache.at > 30000) {
        void refresh().catch(() => {});
      }
      return cache.trips.find(trip => trip.slug === slug);
    },
  };
}
