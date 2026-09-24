# Wānanga — Sanity e Hostinger Reach

## Sviluppo locale

Repository: https://github.com/DavideMichelon10/waranga

Con Node.js 22.12 o successivo:

    npm ci
    npm run dev

Per verificare la versione di produzione: `npm run build`.
Il frontend è in `src/`, il pannello Sanity in `studio/`.
Durante `npm run dev`, le letture pubbliche di Sanity passano dal proxy locale
Vite `/__sanity`: l'anteprima funziona anche senza autorizzare localhost in Sanity.
Il proxy non inoltra cookie o credenziali. La build di produzione continua a
leggere direttamente Sanity e richiede le origini pubbliche autorizzate.
Non caricare file `.env`, credenziali o database nel repository.

## Stato dell'integrazione

- Project ID Sanity: v6jdx1wm. Dataset pubblico: production.
- Il sito legge SOLO i documenti pubblicati, senza token e senza credenziali.
- Catalogo /viaggi e pagine /viaggi/:slug generati dai contenuti Sanity.
- Il pannello Studio locale e remoto include Viaggi, Liste d’attesa e Testi del sito, con campi in italiano. Studio remoto aggiornato il 23 settembre 2026; frontend e backend Node.js sono pubblicati su Hostinger; le Functions Netlify non sono in uso.
- Testi del sito include i testi delle pagine, i pulsanti, le etichette dei moduli e le domande frequenti con le risposte. I valori iniziali corrispondono ai testi già mostrati sul sito.
- La newsletter mostra un modulo con sola email in homepage e su /newsletter.
- Newsletter Reach attiva sul dominio di prova Hostinger; iscrizione online verificata il 24 settembre 2026. Configurazione e limiti in [HOSTINGER-NEWSLETTER.md](HOSTINGER-NEWSLETTER.md). `REACH_ENABLED=false` permette di disattivare la raccolta.
- Studio pubblicato: https://wananga-v6jdx1wm.sanity.studio/
- Dominio frontend autorizzato in Sanity: https://wananga.it (anche https://www.wananga.it)
- Bali (con fotografia) e Testi del sito sono già stati importati come bozze. Accedere al pannello con GitHub, rivederli e premere Publish.
- L'anteprima grafica affiancata (Visual Editing) non è inclusa: questo Studio è un editor a campi.

## Pubblicazione Hostinger attuale

Il sito https://darkblue-alligator-613930.hostingersite.com/ è collegato al branch `main`
di GitHub e usa il server Node.js per newsletter e waiting list. Seguire
[HOSTINGER-NEWSLETTER.md](HOSTINGER-NEWSLETTER.md): build `build`, tipo Express,
output vuoto ed entry file `app.js`. Le credenziali sono variabili server riservate.

## Caricare soltanto il frontend statico su Hostinger

Lo ZIP contiene package.json, src e index.html direttamente alla radice.
La cartella studio è indipendente e non va scelta come directory principale del sito.

- Framework: Vite
- Node: 22.x (almeno 22.12)
- Directory principale: .
- Gestore pacchetti: npm
- Build: npm run build
- Output: dist
- File di ingresso server: vuoto

Il Project ID è già configurato. Sono possibili override tramite le variabili
VITE_SANITY_PROJECT_ID e VITE_SANITY_DATASET. Cambiare le variabili richiede una nuova build.

Per GitHub si può usare il contenuto di questo ZIP come repository:
non contiene database PocketBase, credenziali, node_modules o dati dei contatti.

## Pubblicare su Netlify

Il sito definitivo è https://wananga.it e la lettura dei contenuti Sanity da
questo dominio (e da www.wananga.it) è già autorizzata.

La configurazione `netlify.toml` include frontend e funzioni server. Per una futura
pubblicazione completa usare un deploy che includa le Functions e Netlify Blobs
(ad esempio dal repository collegato). Il solo upload della cartella `dist`
contiene il sito statico e **non installa il backend della waiting list**.

Build: `npm run build`; output: `dist`; funzioni: `netlify/functions`.
Il frontend e il backend Node.js sono pubblicati su Hostinger tramite GitHub. Le Functions Netlify restano disponibili come alternativa e non sono state pubblicate.
Le funzioni server richiedono la configurazione descritta in [WAITING-LISTS.md](WAITING-LISTS.md).
Hostinger statico può ospitare il frontend, ma non esegue queste Netlify Functions:
per quel tipo di hosting occorre adattare il backend.

## Avviare il pannello

Per l'uso quotidiano basta https://wananga-v6jdx1wm.sanity.studio/:
accedere con GitHub, aprire Viaggi oppure Testi del sito. Non serve installare nulla.
Il secondo utente va invitato al progetto dal proprietario.

Nella cartella del progetto estratto:

    npm ci
    npm --prefix studio ci
    npm run cms:dev

Aprire http://localhost:3333 e accedere con l'account Sanity che possiede il progetto.
Invitare il secondo utente tramite https://www.sanity.io/manage.
Nel piano Free chi modifica i contenuti deve avere ruolo Administrator.

Per una URL pubblica del pannello, dalla cartella studio:

    npx sanity login
    npm run deploy

Il comando di deploy chiede il nome/indirizzo dello Studio e richiede accesso al progetto.
Non mettere token Sanity in variabili VITE_* o SANITY_STUDIO_*.

In Sanity Manage > progetto > API > CORS Origins configurare gli indirizzi effettivi:
- il dominio del sito e l'eventuale dominio di anteprima Hostinger;
- l'origine dello Studio con credenziali abilitate per l'accesso editoriale;
- gli indirizzi locali usati per lo sviluppo.

Aggiungere origini precise, non "*". Il sito pubblico usa richieste senza credenziali.

## Caricare la bozza iniziale di Bali

Le bozze iniziali sono già nel progetto. Non occorre importarle di nuovo.
Per ripristinare solo quelle eventualmente assenti, dalla cartella studio:

    npx sanity exec scripts/import-seed.mjs --with-user-token

Questo script non sovrascrive documenti esistenti e carica anche la fotografia.
Aprire Viaggi > Bali, verificare testi e informazioni e premere Publish.
Pubblicare anche Testi del sito.

Il sito non mostra bozze. Un dataset senza viaggi pubblicati mostra l'invito a
tornare per le prossime partenze. Rimuovere la pubblicazione elimina il viaggio
dall'elenco; non riappare una copia locale di Bali.
La pagina aggiorna i dati a ogni caricamento, al ritorno nella scheda e ogni minuto
mentre è visibile. Non occorre un commit o una nuova build per pubblicare un viaggio.

Per aggiungere una destinazione: Viaggi > Nuovo > compila i campi > genera lo slug >
aggiungi le tappe > Publish. Lo slug diventa /viaggi/nome-del-viaggio.
"Completo" e "Richieste chiuse" disabilitano l'invito a candidarsi.

## Waiting list e newsletter con Hostinger Reach

Implementati i moduli di iscrizione e le rotte server `/api/waitlist` e `/api/newsletter`. La connessione è attiva sul dominio Hostinger configurato. Negli altri ambienti resta disabilitata finché mancano le
credenziali e `REACH_ENABLED=true`: il modulo mostra l’indisponibilità solo dopo
il tentativo di invio e non simula un’iscrizione riuscita.

Da Sanity si possono creare e duplicare pagine `/waiting-list/:slug`, modificare
foto e testi e collegare il viaggio definitivo. La waiting list richiede email
e consenso per l’avviso; la newsletter generale ha un consenso separato,
facoltativo e inizialmente non selezionato.

Il backend aggiunge un tag Reach per ogni partenza e `wananga-newsletter` solo
su richiesta. I contatti restano in Reach; la prova dei consensi è conservata
su Hostinger in una directory privata persistente (su Netlify, in Blobs privato), mai nel dataset pubblico Sanity.

Il sito salva i contatti e le preferenze in Reach. Non crea campagne, bozze email,
né invia email. La pubblicazione o modifica di un viaggio non contatta gli iscritti.

Guida editoriale e configurazione: [WAITING-LISTS.md](WAITING-LISTS.md).
Lista Bali: http://localhost:4173/waiting-list/bali-prossima-partenza.
Le vecchie variabili `VITE_NEWSLETTER_ENDPOINT` e `VITE_REACH_FORM_URL` non sono usate.

## Moduli di contatto e candidature

I moduli pubblici inviano a `/api/contact` e `/api/application` sul server
Hostinger. Non dipendono più da PocketBase. Le richieste compaiono in Reach:

- `wananga-contatti`: richieste da Contattaci;
- `wananga-candidature`: candidature, con un tag `wananga-viaggio-<slug>`;
- `wananga-newsletter`: solo per il consenso newsletter, separato e facoltativo.

Aprire il contatto per leggere i campi **Wānanga · …**. Nome, email e telefono
internazionale usano anche i campi standard. Messaggi, motivazioni e note lunghe
sono divisi in campi numerati di 255 caratteri senza troncare il testo.
Reach ha una scheda per email: i nuovi invii aggiornano i campi dello stesso
modulo; il messaggio di contatto e le risposte della candidatura restano distinti.
Le copie integrali dei tentativi e dei consensi restano nel percorso privato
Hostinger per recupero tecnico. Non c’è un nuovo pannello da usare.

Il server convalida i campi, controlla che il viaggio pubblicato accetti richieste,
limita gli invii e protegge dai duplicati. In caso di errore conserva i dati nel
modulo e non dichiara la richiesta ricevuta finché Reach non l’ha salvata.
Una newsletter non completata viene segnalata separatamente dopo il salvataggio
della richiesta, senza riattivare contatti già disiscritti.

`/candidatura-bali` resta valido; gli altri viaggi pubblicati usano
`/candidatura/:slug`. Il campo età è indipendente dalle note. Non servono modifiche
allo schema PocketBase né valori di destinazione predefiniti.

Configurazione e limiti Reach: [HOSTINGER-NEWSLETTER.md](HOSTINGER-NEWSLETTER.md).
Le pagine privacy, cookie e termini restano da completare con testi del titolare;
questa integrazione non inventa condizioni di viaggio o documenti approvati.

## Dove intervenire nel codice

In questo repository:
- src/lib/content.js: query, dati iniziali e normalizzazione.
- src/contexts/ContentContext.jsx: caricamento contenuti pubblicati.
- src/redesign/Experience.jsx: pagine e catalogo.
- src/components/ReachNewsletter.jsx: modulo newsletter con sola email.
- src/lib/newsletter.js: chiamate ai moduli email sul backend.
- src/components/WaitingList.jsx e studio/waitlistSchema.js: pagine social e campi editoriali.
- server/ e netlify/functions/: raccolta contatti Reach e consensi.
- studio/schemaTypes.js: campi editoriali.

## Dati dell’agenzia nel footer

`src/components/AgencyFooter.jsx` riporta in forma compatta i dati essenziali di The Blue Wizards s.r.l. ·
Magical Journeys forniti dal proprietario del sito. Il proprietario ha confermato
che la società è l’organizzatore dei viaggi Wānanga, stipula i contratti e gestisce
i pagamenti. Nel footer sono mantenuti organizzatore, sede legale, P.IVA/C.F.,
Registro Imprese, capitale sociale e versato e PEC. Le descrizioni promozionali,
il codice attività e il REA sono stati rimossi per ridurre il blocco.

Prima della pubblicazione, far confermare all’agenzia: dati della visura e capitale
versato aggiornati, eventuale socio unico o liquidazione,
estremi autorizzativi applicabili, recapiti operativi,
assicurazione RC e protezione dall’insolvenza. Il footer non sostituisce le
condizioni di viaggio e le informative: privacy, cookie e termini nel progetto
sono ancora segnaposto. Va identificato anche il soggetto che gestisce il sito
e tratta i dati raccolti dai moduli. Non è stata svolta una verifica della visura.

## Compilare i campi editoriali già esistenti

I valori iniziali dello schema si applicano solo ai documenti nuovi. Per completare
un documento Testi del sito creato prima dell’aggiunta di FAQ e altri testi,
dalla cartella `studio` verificare prima i campi mancanti:

    npx sanity exec scripts/backfill-site-settings.mjs --with-user-token

Per applicare il riempimento:

    npx sanity exec scripts/backfill-site-settings.mjs --with-user-token -- --apply

Lo script usa gli stessi testi predefiniti del sito e aggiorna solo la bozza.
Conserva testi personalizzati, domande esistenti e un elenco FAQ svuotato
esplicitamente. Se esiste solo il documento pubblicato, ne crea una bozza
completa. Può essere ripetuto senza duplicare le domande; una modifica concorrente
alla bozza interrompe l’aggiornamento. Non pubblica automaticamente.
Aprire **Testi del sito** per modificare i testi già compilati e premere **Publish**
quando le modifiche devono apparire sul sito.
