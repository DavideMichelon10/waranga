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

## Esito della prova del 24 settembre 2026

- Token e UUID del profilo verificati tramite API.
- Iscrizione reale dal backend locale: HTTP 200, stato `subscribed`.
- Test automatici: 13 superati; build frontend e pacchetto server riuscite.
- Le build server Hostinger risultano `completed`, ma il dominio restituisce
  HTTP 403 e gli endpoint API HTTP 404. Il file `.htaccess` atteso non risulta
  presente tramite l'API file e i log runtime non riportano avvii.
- Ultima build server esaminata: `01a0d069-4278-704e-86df-b485bafb648b`.
- È stato richiesto il ripristino della configurazione Vite e del sorgente Git
  originali. Non considerare la newsletter online attiva finché una richiesta
  effettuata al dominio Hostinger non riceve conferma e viene verificata in Reach.
