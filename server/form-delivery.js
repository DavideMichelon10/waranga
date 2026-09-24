import { contactSummary } from './contact-summary.js';
import { saveFormRecord, historyToken } from './form-history.js';
import { privateKey, reachClient } from './services.js';
import { ServiceError } from './reach.js';

// The saved request is the queue: no in-memory-only jobs or second data store.
export function createFormDelivery({ store, origin, historySecret = process.env.CONSENT_HASH_SECRET, hash = privateKey, reach = reachClient, now = Date.now }) {
  let running;
  let timer;
  async function deliver() {
    const db = store();
    await db.withLock('form-delivery', async () => {
      const records = (await db.findPendingForms()).sort((a, b) => a.at.localeCompare(b.at));
      const blockedEmails = new Set();
      for (const record of records) {
        // Keep requests for a contact in order, including during provider outages.
        if (blockedEmails.has(record.email)) continue;
        if (record.nextAttemptAt > now()) { blockedEmails.add(record.email); continue; }
        const key = `forms/${hash(record.email)}/${record.requestId}`;
        const historyUrl = new URL('/richieste/' + historyToken(record.email, historySecret), origin).href;
        let update;
        try {
          const archive = await db.getJSON('form-history/' + historyToken(record.email, historySecret));
          const overview = contactSummary(archive?.records || [record]);
          const result = await reach().submitForm({ ...record, historyUrl, overview });
          update = { ...record, status: 'received', contactUuid: result.contactUuid, newsletterStatus: result.newsletter, nextAttemptAt: null, code: null };
        } catch (error) {
          const code = error instanceof ServiceError ? error.code : error.name === 'TimeoutError' ? 'reach_timeout' : 'reach_unavailable';
          const attempts = (record.attempts || 0) + 1;
          update = { ...record, attempts, code, nextAttemptAt: now() + Math.min(300000, 5000 * 2 ** Math.min(attempts - 1, 6)) };
          blockedEmails.add(record.email);
          console.error('Form Reach sync delayed:', code);
        }
        await db.withLock(hash(record.email), () => saveFormRecord(db, key, update, { secret: historySecret }));
      }
    });
  }
  function kick() {
    if (!running) {
      running = deliver().catch(error => {
        if (error.code !== 'request_in_progress') console.error('Form delivery unavailable:', error instanceof ServiceError ? error.code : 'storage_error');
      }).finally(() => { running = null; });
    }
    return running;
  }
  return {
    kick,
    start() { if (!timer) { timer = setInterval(kick, 5000); timer.unref(); void kick(); } },
    stop() { clearInterval(timer); timer = null; },
  };
}
