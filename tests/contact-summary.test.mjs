import test from 'node:test';
import assert from 'node:assert/strict';
import { contactSummary } from '../server/contact-summary.js';

test('summary distinguishes repeat applications, different trips, messages and failed retries', () => {
  const application = { kind: 'application', status: 'received', tripSlug: 'bali', viaggio: 'Bali' };
  const first = { ...application, requestId: 'a', at: '2026-09-20T10:00:00Z' };
  const records = [first, first,
    { ...application, requestId: 'b', at: '2026-09-21T10:00:00Z' },
    { ...application, requestId: 'c', tripSlug: 'thailandia', viaggio: 'Thailandia', at: '2026-09-22T10:00:00Z', status: 'queued' },
    { ...application, requestId: 'failed', at: '2026-09-24T10:00:00Z', status: 'failed' },
    { requestId: 'message', kind: 'contact', at: '2026-09-23T10:00:00Z', status: 'received' },
  ];
  assert.deepEqual(contactSummary(records), {
    application_count: '3', contact_count: '1', application_summary: 'Thailandia: 1 · Bali: 2',
    application_at: '22/09/26, 12:00', contact_at: '23/09/26, 12:00',
  });
});
test('empty and long summaries fit Reach without inventing applications', () => {
  assert.deepEqual(contactSummary([]), { application_count: '0', contact_count: '0', application_summary: 'Nessuna candidatura' });
  const rows = Array.from({ length: 40 }, (_, i) => ({ requestId: String(i), kind: 'application', status: 'received', tripSlug: 'trip-' + i, viaggio: 'Viaggio molto lungo ' + i, at: '2026-09-20T10:00:00Z' }));
  const result = contactSummary(rows);
  assert.equal(result.application_count, '40');
  assert.ok(Array.from(result.application_summary).length <= 255);
  assert.match(result.application_summary, /vedi storico completo/);
});
