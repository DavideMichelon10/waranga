# Newsletter su Hostinger Business

Il frontend può usare gli endpoint relativi `/api/newsletter` e `/api/waitlist`.
Il server `server/hostinger.js` serve la build Vite e gestisce gli endpoint con
lo stesso codice Reach usato su Netlify. Netlify continua a usare le sue Functions.

## Build e avvio

- Node.js 22 (almeno 22.12).
- Script build: `build` (comando completo: `npm run build`).
- Output: vuoto (`null` nelle API). Hostinger distribuisce tutta la radice per Express.
- Entry file: `app.js`, relativo alla radice del repository.
- Tipo di applicazione server Node.js: Express nel pannello Hostinger; il server
  usa direttamente HTTP di Node, senza dipendere dal framework Express.
- Avvio locale dalla radice dei sorgenti: `npm run start:hostinger`.
- Avvio dal pacchetto compilato: `npm start`. Il pacchetto `hostinger-build`
  resta disponibile per esportazioni manuali, ma non serve al deploy Git.

Il deploy Git deve includere `app.js`, `server/`, `src/lib/` e la build `dist/`.
La configurazione Vite con output `dist` pubblica soltanto le pagine e non avvia
gli endpoint newsletter. Per Express non usare `hostinger-build` come output:
l’entry file viene risolto dalla radice del repository.
Riferimento: https://docs.hostinger.com/node.js/build-settings

## Variabili server

Configurare nel pannello Node.js, senza prefisso VITE_:

- `PUBLIC_ORIGIN`: origine HTTPS del sito, senza slash finale.
- `REACH_API_TOKEN`: token dell'account proprietario di Reach.
- `REACH_PROFILE_ID`: UUID del profilo Reach.
- `REACH_ENABLED=true`: attiva la raccolta.
- `CONSENT_HASH_SECRET`: segreto casuale stabile; generare con `openssl rand -hex 32`.
- `PRIVATE_DATA_DIR`: percorso assoluto persistente, fuori da public_html e da
  tutte le directory di build/applicazione, scrivibile dall'utente Node.js.

Nel test il dominio è darkblue-alligator-613930.hostingersite.com e il profilo
Reach è 352af90c-90ab-46e4-a0d2-001347072692. Il percorso privato configurato è
`/home/u439382729/wananga-private`. Non riutilizzare questi riferimenti quando
si passa a un account cliente diverso.

Le credenziali non sono incluse negli archivi né nel repository. Un `.env`
caricato nella cartella pubblica non è il metodo di configurazione previsto.

## Consensi e limiti

I consensi sono file JSON privati (permessi 0600) in PRIVATE_DATA_DIR/consent,
con email, data, testo/versione del consenso ed esito. I nomi dei file non
contengono email. Le scritture sono atomiche. La directory deve essere inclusa
nei backup e nei processi di cancellazione/retention prima della produzione.

I contatori persistenti in PRIVATE_DATA_DIR/rate usano creazione esclusiva
per rispettare i limiti anche tra processi; i contatori vecchi vengono rimossi
al successivo accesso. Il limite è 5 richieste/minuto per indirizzo di rete e
10/minuto complessive. Dietro il proxy Hostinger il primo limite può essere
condiviso tra visitatori: gli header IP inoltrati non vengono considerati
attendibili automaticamente. Valutare la configurazione del proxy prima di
aprire la raccolta a traffico reale.

Il backend non riattiva contatti disiscritti e aggiunge il tag
`wananga-newsletter` alle iscrizioni alla newsletter. Le eventuali email di
conferma/benvenuto dipendono dalle impostazioni e automazioni del profilo Reach.

## Verifica

`node --test tests/*.test.mjs` verifica isolamento dei file privati, routing,
validazione, controllo origine, dimensione del payload, rate limit concorrente
e comportamento dell'integrazione Reach. `npm run build:hostinger` prepara
l'output server e frontend. Verificare poi il modulo online e il contatto nel
pannello Reach: i test automatici non sostituiscono questa verifica.

Un deploy da archivio non pubblica le modifiche su GitHub. Prima di riattivare
il flusso Git automatico, pubblicare questi sorgenti e configurare nel pannello
lo script `build`, output vuoto ed entry file `app.js`: una build del vecchio branch
Vite può rimuovere il backend.

## Verifica online del 24 settembre 2026

- Sito: https://darkblue-alligator-613930.hostingersite.com/.
- Deploy collegato a `DavideMichelon10/waranga`, branch `main`.
- Configurazione funzionante: Express, Node 22, build `build`, output vuoto,
  entry file `app.js`. Homepage HTTP 200; GET `/api/newsletter` HTTP 405,
  perché l’endpoint accetta solo POST.
- Iscrizione dal dominio pubblico con un indirizzo autorizzato dal proprietario:
  HTTP 200, stato `subscribed`. Contatto verificato anche tramite API Reach.
- I 13 test automatici e la build frontend sono passati.
- Il primo tentativo online restituiva `reach_401`: le variabili runtime sono
  state aggiornate con il token verificato. Non inserire mai `********` come
  credenziale: l’API di lettura Hostinger restituisce soltanto valori mascherati.
- L’API di aggiornamento delle variabili sostituisce l’intero insieme. Una copia
  privata `.env.hostinger`, esclusa da Git e con permessi 0600, permette di
  conservarne i valori in futuri aggiornamenti; non includerla negli archivi.
- In questa configurazione è stato generato un nuovo segreto dei consensi.
  I tentativi precedenti dal sito erano falliti; i loro record privati restano
  sul server. Conservare stabile il nuovo segreto nelle pubblicazioni successive.
- I log riportano solo codici di errore noti, senza indirizzi email o token.

Le campagne e le eventuali automazioni email si gestiscono nel pannello Reach.
La prova online riguarda la newsletter; le liste d’attesa condividono il backend
ma richiedono anche un documento Sanity pubblicato con stato di raccolta aperto.
