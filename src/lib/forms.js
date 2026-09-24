export async function submitForm(kind, payload) {
  let response;
  try { response = await fetch(kind === 'application' ? '/api/application' : '/api/contact', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'omit', body: JSON.stringify(payload), signal: AbortSignal.timeout(15000),
  }); } catch {
    throw new Error('La connessione si è interrotta. I tuoi dati sono ancora qui: riprova a inviare.');
  }
  let result;
  try { result = await response.json(); } catch { throw new Error('Non siamo riusciti a inviare la richiesta. I dati sono ancora qui: riprova tra poco.'); }
  if (!response.ok || result.status !== 'received') {
    const messages = {
      not_configured: 'Gli invii non sono attivi in questo ambiente. La richiesta non è stata inviata.',
      invalid_fields: 'Controlla i campi del modulo e riprova.',
      invalid_email: 'Inserisci un indirizzo email valido.',
      invalid_phone: 'Inserisci un numero di telefono valido, preferibilmente con prefisso internazionale.',
      consent_required: 'Conferma di aver letto l’informativa privacy.',
      trips_unavailable: 'Non riusciamo a verificare il viaggio in questo momento. I tuoi dati sono ancora qui: riprova tra poco.',
      trip_closed: 'Questo viaggio non raccoglie più candidature. Ricarica la pagina per vedere le novità.',
      rate_limit: 'Attendi un minuto prima di riprovare. I dati sono ancora nel modulo.',
      request_in_progress: 'Il tuo invio è ancora in corso. Attendi qualche istante e riprova.',
    };
    throw new Error(messages[result.error] || 'Non siamo riusciti a inviare la richiesta. I dati sono ancora qui: riprova tra poco.');
  }
  return result;
}
