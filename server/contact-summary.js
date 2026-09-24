export function contactDate(value) {
  if (!value || !Number.isFinite(new Date(value).getTime())) return '';
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Rome',
  }).format(new Date(value));
}

export function contactSummary(records) {
  // Retries share an ID. Failed attempts are visible in history, but are not
  // counted as new applications accepted by the site.
  const unique = new Map(records.filter(record => record.requestId).map(record => [record.requestId, record]));
  const received = [...unique.values()].filter(record => ['queued', 'received'].includes(record.status))
    .sort((a, b) => b.at.localeCompare(a.at));
  const applications = received.filter(record => record.kind === 'application');
  const contacts = received.filter(record => record.kind === 'contact');
  const trips = new Map();
  for (const record of applications) {
    const key = record.tripSlug || record.viaggio;
    const trip = trips.get(key) || { title: record.viaggio || record.tripSlug || 'Viaggio', count: 0 };
    trip.count++;
    trips.set(key, trip);
  }
  const description = [...trips.values()].map(trip => `${trip.title}: ${trip.count}`).join(' · ') || 'Nessuna candidatura';
  const chars = Array.from(description);
  return {
    application_count: String(applications.length),
    contact_count: String(contacts.length),
    application_summary: chars.length <= 255 ? description : chars.slice(0, 220).join('') + '… (vedi storico completo)',
    ...(applications.length ? { application_at: contactDate(applications[0].at) } : {}),
    ...(contacts.length ? { contact_at: contactDate(contacts[0].at) } : {}),
  };
}
