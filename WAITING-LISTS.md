# Waiting list Wānanga

## Funzionamento

Ogni partenza ha una pagina `/waiting-list/:slug` modificabile in Sanity.
Il visitatore inserisce email e consenso privacy obbligatorio; può scegliere
se iscriversi anche alla newsletter generale, con una casella separata.
Il server salva il contatto in Reach con un tag specifico per la lista e,
solo se richiesto, il tag `wananga-newsletter`.

Il sito non prepara bozze email, non crea campagne e non invia email.
Sanity gestisce esclusivamente i contenuti delle pagine. Non servono webhook,
mittenti o token Sanity server. Eventuali comunicazioni future si gestiscono in Reach.

## Gestione da Sanity

1. Apri **Liste d’attesa** e crea una lista, oppure usa **Duplica per un nuovo viaggio**.
2. Compila nome, slug, titolo, presentazione, periodo, foto e pulsante.
3. Mantieni **Raccogli iscrizioni** e pubblica. Condividi il link della pagina
   dopo aver pubblicato il frontend e attivato Reach.
4. Quando vuoi sostituire il modulo con il programma, collega il viaggio pubblicato,
   scegli **Viaggio disponibile: mostra il programma** e pubblica la modifica.
5. Puoi anche impostare **Lista chiusa** per interrompere le iscrizioni.

Per ogni nuova partenza crea una nuova lista: rinominare una lista esistente
conserva i suoi iscritti. La duplicazione copia foto e testi, azzera slug e
viaggio collegato e crea una nuova lista. Mantieni lo slug dopo averlo condiviso.
La pubblicazione di un viaggio non modifica automaticamente lo stato della lista.

La lista Bali è `Bali · prossima partenza`, indirizzo `/waiting-list/bali-prossima-partenza`.
Studio: https://wananga-v6jdx1wm.sanity.studio/.
Sito locale: http://localhost:4173/waiting-list/bali-prossima-partenza.

## Deploy Hostinger attuale

Il sito è pubblicato su Hostinger da GitHub con il backend Node.js. La newsletter
è stata verificata online il 24 settembre 2026. Per impostazioni e credenziali
seguire [HOSTINGER-NEWSLETTER.md](HOSTINGER-NEWSLETTER.md). I consensi sono
conservati in una directory privata persistente del server, fuori dal sito.

## Deploy Netlify alternativo

Il progetto è configurato per Netlify: comando `npm run build`, cartella di output
`dist`, funzioni in `netlify/functions`. Il deploy deve includere le Functions
ed eseguire Netlify Blobs: il solo trascinamento di `dist` pubblica soltanto il
frontend e non abilita il salvataggio dei contatti.

Questa alternativa Netlify non è stata pubblicata. Lo Studio remoto viene
aggiornato separatamente. In un nuovo ambiente le iscrizioni restano disabilitate
finché non vengono configurate le variabili server.

## Attivare Reach in seguito

In Netlify configurare queste variabili server, poi effettuare un nuovo deploy:

| Variabile | Valore |
| --- | --- |
| `REACH_API_TOKEN` | Token dell’account Hostinger autorizzato |
| `REACH_PROFILE_ID` | ID del profilo Reach di Wānanga |
| `CONSENT_HASH_SECRET` | Segreto casuale stabile, generabile con `openssl rand -hex 32` |
| `REACH_ENABLED` | `true` quando la configurazione è completa; altrimenti `false` |

I segreti non devono avere prefissi `VITE_` o `SANITY_STUDIO_` e non vanno inseriti
nel repository. L’account Reach è collegato al backend Hostinger; configurare separatamente un eventuale backend Netlify.
L’assenza delle credenziali non impedisce la compilazione e il deploy del sito.

Gli identificativi Sanity hanno valori predefiniti per il progetto Wānanga.
Gli override `VITE_SANITY_PROJECT_ID` / `VITE_SANITY_DATASET` del frontend e
`SANITY_PROJECT_ID` / `SANITY_DATASET` del server devono riferirsi allo stesso dataset.
Per lo Studio usare `SANITY_STUDIO_SITE_URL=https://wananga.it` in pubblicazione;
`http://localhost:4173` nell’ambiente locale.

`npm run dev` offre le pagine e gli endpoint in standby; per sviluppare il backend
con storage usare Netlify Dev. Vite non carica i segreti server dai file `.env`.

## Contatti e consensi

Il tag `wananga-wait-…` identifica stabilmente il documento Sanity della lista.
La stessa email può iscriversi a più viaggi. La newsletter generale aggiunge il tag
`wananga-newsletter` solo quando richiesta; non selezionarla non revoca eventuali
iscrizioni precedenti. I contatti già disiscritti o soppressi non vengono riattivati.

Il server chiama soltanto le API contatti e tag. Eventuali automazioni di benvenuto
o conferma configurate nell’account Reach vanno gestite dentro Reach: il sito non
le configura. Lo stato di un contatto eventualmente in attesa di conferma viene
riportato correttamente nel modulo, senza dichiararlo già iscritto.

Lo store privato Netlify `wananga-private` conserva la prova dei consensi in
`consent/`: email, istante, finalità, versione/testo del consenso ed esito.
Gli indirizzi non sono salvati nel dataset pubblico Sanity. I contatori `rate/`
contengono chiavi HMAC, senza IP in chiaro, e limitano gli invii ripetuti.
Definire la conservazione dei consensi e la cancellazione in Reach e Blobs prima
dell’attivazione. La retention non è automatizzata; i contatori più vecchi di un
giorno possono essere eliminati. La privacy del sito resta da completare con le
informazioni del titolare. Non ruotare il segreto HMAC senza pianificare la gestione
dei record esistenti.

## Altri limiti già presenti

I moduli candidatura e contatto sono ora collegati direttamente a Reach dal backend
Hostinger. La loro iscrizione newsletter resta facoltativa e separata.
I metadati delle pagine sono aggiornati nel browser; alcuni social potranno usare
l’anteprima generica del sito finché non viene introdotto il rendering lato server.
