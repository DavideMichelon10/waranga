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
- I 22 test automatici e la build frontend sono passati.
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
Le prove online coprono newsletter, lista d’attesa Bali, Contattaci e candidatura
Bali. Le liste richiedono un documento Sanity pubblicato con raccolta aperta.

## Contattaci e candidature direttamente in Reach

Gli endpoint `/api/contact` e `/api/application` salvano i campi in Reach e
assegnano i tag `wananga-contatti`, `wananga-candidature` e quello del viaggio.
Gli UUID dei campi in `server/reach-fields.json` appartengono al profilo Wānanga;
sono identificativi pubblicabili, non credenziali. Per un altro profilo occorre
creare i campi e aggiornare questa mappa. I campi testo Reach hanno un limite
verificato di 255 caratteri: si mostra un’anteprima, con il testo completo nella
scheda riservata collegata dal campo `Wānanga · Apri richieste complete`.

Un contatto nuovo senza consenso newsletter viene creato e subito marcato
`unsubscribed`; un contatto esistente conserva il suo stato e le iscrizioni
precedenti. Non attivare automazioni generiche «nuovo contatto» per queste
richieste: la creazione API Reach parte da uno stato mailable. Il backend verifica
le automazioni e rifiuta di creare un contatto operativo nuovo se ne trova una
attiva. Le campagne newsletter vanno indirizzate al tag `wananga-newsletter`.
Non è stata attivata alcuna automazione né alcun invio email.

Reach conserva un contatto per email e mostra gli ultimi valori di ogni modulo.
Ogni invio viene prima salvato integralmente sul server con ID casuale, esito e
consenso. La risposta HTTP conferma questo salvataggio, senza attendere Reach.
`server/form-delivery.js` elabora i record `queued` all’avvio, dopo gli invii e
ogni cinque secondi. Dopo un errore riprova con attese crescenti fino a cinque
minuti. La coda è nei record privati: nessun servizio aggiuntivo da configurare.
Le richieste dello stesso contatto sono elaborate in ordine e gli stessi ID non
creano copie aggiuntive. Un solo processo alla volta consegna a Reach; i lock
orfani scadono dopo 30 secondi e quelli attivi si rinnovano automaticamente.

La candidatura verifica un catalogo Sanity conservato sul server: viene caricato
all’avvio e aggiornato dopo 30 secondi al successivo utilizzo. Oltre cinque minuti
serve una nuova lettura riuscita prima di accettare candidature. Il limite degli
invii è quattro al minuto per email e trenta complessivi, così gli utenti dietro
lo stesso proxy Hostinger non si bloccano a vicenda.

I contatti già presenti con tutti i tag necessari richiedono tre chiamate Reach
(ricerca, dettagli, aggiornamento). Non viene ripetuto il flusso newsletter dentro
la candidatura e non vengono riassegnati i tag già presenti. Lo stato della
richiesta nella scheda privata indica quando Reach ha completato il salvataggio.
I log `Form Reach sync delayed` riportano solo il codice di errore: nessun token,
testo del modulo o indirizzo email. I vecchi record `failed` restano consultabili;
la coda automatica gestisce gli invii salvati con il nuovo stato `queued`.

Per la prova locale completa avviare `app.js` con variabili server, origine locale
e una directory privata di test esterna al progetto. Il server Vite di sviluppo
lascia i nuovi moduli in standby. I vecchi componenti dell’export non montati
dall’applicazione pubblica restano separati; il sito usa `src/redesign/Experience.jsx`.

## Dominio Hostinger e nuovi contatti

L’origine `https://darkblue-alligator-613930.hostingersite.com` è stata aggiunta
alle origini CORS di Sanity senza credenziali: viaggi e waiting list sono ora
leggibili nel browser pubblico. Questa impostazione è esterna al deploy Git.

Reach può accettare una creazione prima di rendere il nuovo contatto ricercabile.
Il backend effettua tentativi di lettura con attese brevi prima di aggiornare
campi e tag. Se il contatto non diventa disponibile, la richiesta resta nella
coda persistente per il nuovo tentativo. La conferma sul sito riguarda la ricezione;
la scheda riservata indica separatamente la sincronizzazione completata in Reach.

## Uso quotidiano e storico

1. Aprire Reach → Contatti, filtrando per `wananga-contatti` o `wananga-candidature`.
2. Aprire la persona e leggere riepilogo, viaggio e consenso newsletter.
3. Aprire (o copiare nel browser) il collegamento **Wānanga · Apri richieste complete**
   per leggere tutti gli invii, più recenti per primi. Espandere le richieste precedenti.
4. Il pulsante **Rispondi via email** apre il programma di posta; non invia nulla
   automaticamente. Le campagne restano in Reach.

Lo storico usa copie atomiche dei record privati già conservati sul server e
recupera anche le richieste precedenti di quella persona al primo aggiornamento.
Lo stesso ID di invio aggiorna il tentativo esistente; un invio nuovo crea una
voce distinta. I testi integrali non dipendono dai limiti dei campi Reach.

La scheda `/richieste/<chiave>` è di sola lettura: una chiave HMAC non indovinabile,
separata per email, autorizza l’accesso al solo storico della persona. Non esiste
un elenco pubblico. La chiave non viene restituita al visitatore che compila il
modulo; viene salvata solo nella scheda Reach. Chi riceve questo URL può leggere
lo storico: mantenerlo riservato. La pagina impedisce indicizzazione, embedding,
cache e invio del referrer; non carica script o risorse esterne. I dati sono
mostrati come testo, senza eseguire HTML inviato nei moduli.

`CONSENT_HASH_SECRET` mantiene validi questi collegamenti: conservarlo stabile e
privato. Cambiare dominio richiede aggiornare `PUBLIC_ORIGIN` e i collegamenti
salvati in Reach. Il percorso `PRIVATE_DATA_DIR` va mantenuto nei backup Hostinger;
la sopravvivenza ai deploy è verificata, un backup esterno non è configurato da
questa integrazione. La cancellazione di un contatto Reach non elimina da sola
le copie private: gestire entrambe secondo la conservazione definita dal titolare.
