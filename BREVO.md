# Wānanga · Brevo

Tutti i nuovi moduli usano Brevo per qualunque email, senza elenco di indirizzi
abilitati alla prova. Il backend non legge né scrive più Hostinger Reach.

- Contattaci: un contatto e una trattativa distinta per ogni messaggio, con nota completa.
- Candidatura: una trattativa per invio, collegata al contatto, con viaggio, data,
  telefono, partecipanti e tutte le risposte nella nota.
- Newsletter: lista `Newsletter` e una nota con data e testo del consenso.
- Lista d’attesa: una lista leggibile per partenza; `Newsletter` viene aggiunta solo
  se il visitatore seleziona anche quel consenso. Ogni invio ha una nota separata.

Le liste sono nella cartella `Wānanga`. Contatti e candidature sono anche suddivisi
nelle liste `Contatti dal sito`, `Candidature` e `Viaggio · Bali` (o altro viaggio).
Le newsletter si inviano alla lista Newsletter; gli avvisi sulla partenza alla
relativa lista d’attesa. La sola presenza di un contatto non è consenso newsletter.

## Consensi e messaggi

I nuovi contatti senza richiesta newsletter/lista d’attesa vengono esclusi dal
marketing. Non si riattivano automaticamente contatti già bloccati o disiscritti
in Brevo, neppure con un nuovo modulo. In questo caso l'invio e il consenso richiesto
sono salvati per la gestione manuale della reiscrizione. Il sito conferma la
ricezione della richiesta, senza dichiarare una nuova iscrizione già completata.

Non sono configurate campagne, email automatiche o notifiche dei moduli in
Conversations. I messaggi del modulo sono note CRM; Conversations e Meetings
sono strumenti separati. Gli appuntamenti rimangono gestiti in Brevo, senza
integrazione della prenotazione nel sito.

## Configurazione server

`BREVO_ENABLED=true`, `BREVO_API_KEY`, `CONSENT_HASH_SECRET`, `PUBLIC_ORIGIN` e
`PRIVATE_DATA_DIR` sono obbligatori. I segreti non vanno nelle variabili VITE né in Git.
La directory privata deve essere persistente, fuori dall'applicazione e da public_html.
Gli IP di uscita di Hostinger devono essere autorizzati in Brevo.
Eseguire `node --env-file=.env.hostinger scripts/setup-brevo.mjs` per creare i campi.
Lasciare pipeline e stato non specificati per usare i valori predefiniti dell'account.

Ogni richiesta è salvata prima di rispondere al browser. Un worker locale la
consegna a Brevo; le ricevute persistenti conservano ID contatto, trattativa e nota.
Un'interruzione riprende dopo il riavvio. Le creazioni con esito ambiguo vengono
ricercate tramite riferimento univoco prima di essere ripetute; se l'esito resta
ambiguo serve una verifica manuale della ricevuta, mai la sua cancellazione cieca.
I log riportano conteggi e codici, senza testi o chiavi. Il salvataggio non dipende
dalla velocità di Brevo. Il limite del piano gratuito di 50 trattative aperte può
bloccare la sincronizzazione di nuove trattative: i dati restano nella coda privata.

`BREVO_MIGRATE_LEGACY=true` converte una volta lo storico privato precedente,
conservando originali, date e consensi. Gli invii importati non riattivano il marketing.
La migrazione dei contatti conserva gli stati di disiscrizione e i campi originali
in note. Non cancella automaticamente dati su servizi esterni.

I vecchi URL dei moduli restano supportati per le schede del browser già aperte.
Il sito richiede il server Node.js (`node app.js`); Vite e il vecchio endpoint Netlify
restituiscono indisponibilità invece di confermare invii senza worker persistente.

Per rimuovere i dati di una persona occorre eliminare sia il contatto e i record
Brevo sia i record nel deposito privato e nelle copie di sicurezza secondo la
politica concordata. I backup esterni e la conservazione automatica non sono configurati.
