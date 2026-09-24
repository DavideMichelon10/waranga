import { BrevoError, createBrevoClient, submissionReference } from './brevo.js';
import { saveFormRecord } from './form-history.js';
import { privateKey, getWaitlist } from './services.js';
import { waitlistName } from './subscribe.js';
import { migrateStoredRecords } from './brevo-migration.js';

export function createBrevoDelivery({ store, client = createBrevoClient(), hash = privateKey, historySecret = process.env.CONSENT_HASH_SECRET, now = Date.now, migrate = process.env.BREVO_MIGRATE_LEGACY === 'true', waitlist = getWaitlist }) {
  let running, timer, lastSummary;
  async function deliver() {
    const db = store();
    await db.withLock('brevo-delivery', async () => {
      if (migrate) await migrateStoredRecords(db, { hash, secret: historySecret });
      const records = (await db.findDeliverableRecords()).filter(r => r.status === 'queued').sort((a, b) => a.at.localeCompare(b.at));
      let delivered = 0;
      for (let record of records) {
        const key = 'brevo-delivery/' + submissionReference(record);
        let receipt = await db.getJSON(key) || {};
        if (receipt.nextAttemptAt > now()) continue;
        const checkpoint = async value => { await db.setJSON(key, value); receipt = value; };
        try {
          if (record.kind === 'waitlist' && !record.waitlistName && record.waitlistId) {
            const item = await waitlist(record.waitlistId);
            record = { ...record, waitlistName: item ? waitlistName(item) : 'Lista d’attesa archiviata · ' + record.waitlistId };
          }
          const result = receipt.status === 'received' ? receipt : await client.submit(record, receipt, checkpoint);
          await checkpoint({ ...result, status: 'received', deliveredAt: new Date(now()).toISOString(), nextAttemptAt: null, code: null });
          const saved = { ...record, status: 'received', brevoContactId: result.contactId, brevoDealId: result.dealId || null, brevoNoteId: result.noteId };
          const isForm = ['contact', 'application'].includes(record.kind);
          const storageKey = `${isForm ? 'forms' : 'subscriptions'}/${hash(record.email)}/${record.requestId}`;
          await db.withLock(hash(record.email), () => isForm ? saveFormRecord(db, storageKey, saved, { secret: historySecret }) : db.setJSON(storageKey, saved));
          delivered++;
        } catch (error) {
          const attempts = (receipt.attempts || 0) + 1;
          const code = error instanceof BrevoError ? error.code : 'brevo_delivery_error';
          await checkpoint({ ...receipt, attempts, code, nextAttemptAt: now() + Math.min(300000, 5000 * 2 ** Math.min(attempts - 1, 6)) });
          console.error('Brevo delivery delayed:', code);
          if (error instanceof BrevoError && error.unauthorizedIp) console.error('Brevo requires authorized server IP:', error.unauthorizedIp);
        }
      }
      if (delivered) console.info('Brevo delivery completed:', delivered, 'records');
      const all = await db.findDeliverableRecords();
      const summary = JSON.stringify({ total: all.length, completed: all.filter(r => r.status === 'received').length, queued: all.filter(r => r.status === 'queued').length });
      if (summary !== lastSummary) { console.info('Brevo delivery status:', summary); lastSummary = summary; }
    });
  }
  function kick() {
    if (!running) running = deliver().catch(error => {
      if (error.code !== 'request_in_progress') console.error('Brevo storage unavailable');
    }).finally(() => { running = null; });
    return running;
  }
  return { kick, start() { if (!timer) { timer = setInterval(kick, 5000); timer.unref(); void kick(); } }, stop() { clearInterval(timer); timer = null; } };
}
