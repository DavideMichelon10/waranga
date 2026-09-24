import { saveFormRecord } from './form-history.js';

// Private source records are retained. Copies have deterministic IDs so restarts
// can resume the migration without duplicating consent history or submissions.
export async function migrateStoredRecords(db, { hash, secret }) {
  if (await db.getJSON('brevo-migration/v1')) return;
  let forms = 0, subscriptions = 0;
  for (const { file, value: old } of await db.storedRecords()) {
    if (!old?.email || old.provider === 'brevo') continue;
    if (old.requestId && ['contact', 'application'].includes(old.kind)) {
      const record = { ...old, provider: 'brevo', originalStatus: old.status, imported: true, status: 'queued' };
      await db.withLock(hash(old.email), () => saveFormRecord(db, `forms/${hash(old.email)}/${old.requestId}`, record, { secret }));
      forms++;
    } else if (!old.requestId && old.at && old.privacyVersion && typeof old.newsletter === 'boolean') {
      const requestId = 'legacy-' + file.replace('.json', '');
      const key = `subscriptions/${hash(old.email)}/${requestId}`;
      if (await db.getJSON(key)) continue;
      await db.setJSON(key, {
        ...old, requestId, provider: 'brevo', kind: old.waitlistId ? 'waitlist' : 'newsletter',
        imported: true, originalStatus: old.status, status: 'queued', consenso_newsletter: old.newsletter,
        privacy_accepted: true,
      });
      subscriptions++;
    }
  }
  await db.setJSON('brevo-migration/v1', { at: new Date().toISOString(), forms, subscriptions });
  console.info('Brevo private history migration queued:', forms, 'forms,', subscriptions, 'subscriptions');
}
