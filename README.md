# Wānanga — Sanity e Hostinger Reach

## Sviluppo locale

Repository: https://github.com/DavideMichelon10/waranga

Con Node.js 22.12 o successivo:

    npm ci
    npm run dev

Per verificare la versione di produzione: `npm run build`.
Il frontend è in `src/`, il pannello Sanity in `studio/`.
Non caricare file `.env`, credenziali o database nel repository.

## Stato dell'integrazione

- Project ID Sanity: v6jdx1wm. Dataset pubblico: production.
- Il sito legge SOLO i documenti pubblicati, senza token e senza credenziali.
- Catalogo /viaggi e pagine /viaggi/:slug generati dai contenuti Sanity.
- Il pannello Studio include Viaggi e Testi del sito, con campi in italiano.
- I testi modificabili sono: titolo e introduzione home, titolo viaggi, presentazione fondatori in home, email di contatto e presentazione newsletter. Le altre pagine restano nel codice.
- La newsletter è predisposta per il link pubblico di un modulo Hostinger Reach.
- Il link Reach è da aggiungere più avanti, come concordato. Nel frattempo non vengono raccolte iscrizioni e non viene mostrato un successo fittizio.
- Studio pubblicato: https://wananga-v6jdx1wm.sanity.studio/
- Dominio frontend autorizzato in Sanity: https://gleeful-malabi-0cc11f.netlify.app
- Bali (con fotografia) e Testi del sito sono già stati importati come bozze. Accedere al pannello con GitHub, rivederli e premere Publish.
- L'anteprima grafica affiancata (Visual Editing) non è inclusa: questo Studio è un editor a campi.

## Caricare lo ZIP come Web App su Hostinger

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

Il sito indicato è https://gleeful-malabi-0cc11f.netlify.app e la lettura
dei contenuti Sanity da questo dominio è già autorizzata.

Per un aggiornamento manuale: estrarre wananga-netlify-pubblicazione.zip e
trascinare la cartella contenente index.html nella sezione Deploys del progetto
Netlify esistente. Non creare un nuovo sito: avrebbe un dominio diverso.

Per i deploy da GitHub: collegare DavideMichelon10/waranga al progetto Netlify
esistente, branch main. Directory principale: radice del repository.
Build npm run build, output dist. Il netlify.toml contiene già questi valori.
Il push su GitHub da solo non collega automaticamente il sito a Netlify.

Reach si attiva con VITE_REACH_FORM_URL nelle variabili di build Netlify
(oppure in .env.local per una build manuale), poi una nuova build.
Un archivio già compilato non legge le variabili impostate dopo la compilazione.

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

## Attivare Hostinger Reach quando sarà pronto

In Reach creare un modulo, verificare la lista e i testi di iscrizione e attivarlo.
Copiare il link pubblico dell'opzione Share/Condividi.

Impostare nelle variabili di build Hostinger:

    VITE_REACH_FORM_URL=https://LINK-PUBBLICO-DEL-VOSTRO-MODULO

Poi eseguire un nuovo deploy.
Il sito mostra un pulsante in homepage e su /newsletter che apre il modulo ufficiale.
Il modulo Reach gestisce l'iscrizione e la sua conferma: il sito non dichiara
l'utente iscritto al semplice clic. Il modulo non è ancora incorporato nella pagina.
I contatti e gli invii si gestiscono in Reach, non nel dataset pubblico Sanity.
Verificare un'iscrizione di prova nella lista reale prima di annunciare la newsletter.

## Moduli di contatto e candidature

Sono ancora collegati al backend PocketBase originale tramite /hcgi/platform.
Si può indicare un backend esistente differente con VITE_POCKETBASE_URL, verificandone
autorizzazioni e CORS. Questo ZIP non avvia PocketBase e non migra le richieste.

Il backend originale limita il campo candidature.viaggio a un elenco fisso.
Per questo:
- Bali mantiene /candidatura-bali e la collezione candidature;
- gli altri viaggi aprono /contattaci con il nome del viaggio nel messaggio e salvano
  nella collezione contatti, senza inventare valori non supportati dal backend.

La casella newsletter dei vecchi moduli è stata sostituita da un link al percorso Reach.
Inviare un contatto non iscrive automaticamente alla newsletter.

Finché il backend non è disponibile sul dominio pubblicato, questi due moduli
non possono inviare: mostrano l'errore e conservano il testo, senza simulare successo.
Le pagine privacy e termini già presenti nell'export sono ancora da completare.

## Dove intervenire nel codice

In questo repository:
- src/lib/content.js: query, dati iniziali e normalizzazione.
- src/contexts/ContentContext.jsx: caricamento contenuti pubblicati.
- src/redesign/Experience.jsx: pagine e catalogo.
- src/components/ReachNewsletter.jsx: accesso al modulo Reach.
- studio/schemaTypes.js: campi editoriali.
