# Prova Brevo

La prova copia soltanto i nuovi invii di Contattaci e Candidatura degli indirizzi
configurati sul server. Reach continua a ricevere i moduli e a gestire newsletter
 e liste d'attesa. Nessuna campagna viene inviata da questa integrazione.

## Configurazione

1. Salvare `BREVO_API_KEY` nell'ambiente server, mai in variabili `VITE_`.
2. Autorizzare in Brevo gli IP in uscita della macchina di configurazione e di
   Hostinger. L'IP della macchina locale non è necessariamente quello di Hostinger.
3. Eseguire `node --env-file=.env.hostinger scripts/setup-brevo-trial.mjs`.
   Lo script verifica l'accesso e crea soltanto sei attributi delle trattative
   (ID invio, modulo, viaggio, data, telefono, partecipanti).
4. Selezionare `BREVO_TRIAL_PIPELINE_ID` e `BREVO_TRIAL_STAGE_ID` dagli ID restituiti.
   Con una sola pipeline si può ometterli: viene usato il primo stato.
   I nomi degli stati e l'aspetto delle schede vanno configurati nel pannello Brevo;
   questo script non li modifica.
5. Impostare `BREVO_TRIAL_EMAILS` con email esatte separate da virgole e
   `BREVO_TRIAL_ENABLED=true`. Senza elenco non viene copiato nessun invio.
6. Inviare due candidature della stessa persona, quindi un messaggio Contattaci.
   Verificare in Brevo il contatto, tre trattative e tre note con risposte complete.
   Provare anche un invio ripetuto con lo stesso requestId: non deve duplicarsi.

## Organizzazione dei dati

Una persona corrisponde a un contatto Brevo identificato dalla sua email.
Ogni invio corrisponde a una trattativa `[PROVA]`, associata a quel contatto.
Le candidature contengono viaggio, provenienza, data, telefono e partecipanti;
la nota collegata sia al contatto sia alla trattativa conserva tutte le risposte,
anche testi lunghi, senza troncarli. I messaggi Contattaci usano lo stesso schema
nella prova per rendere evidente la separazione fra invii.

I nuovi contatti della prova vengono esclusi dal marketing Brevo. Le preferenze
di contatti Brevo già esistenti non vengono modificate. Il consenso richiesto
nel modulo viene conservato nella nota; newsletter e liste d'attesa rimangono
in Reach fino a una migrazione specifica dei consensi e delle disiscrizioni.

## Consegna e recupero

Il modulo salva il record privato prima di confermare. `brevoTrial` è deciso
solo sul server al momento dell'invio. L'attivazione non importa lo storico.
La coda Brevo è indipendente da Reach: un guasto Brevo non rallenta la risposta
al visitatore e non blocca la consegna a Reach.

Le ricevute `brevo-trial/<sha256(email + NUL + requestId)>` sono nel deposito
privato persistente e registrano contactId, dealId, noteId, tentativi ed errori
sanificati. Un solo worker alla volta opera anche con più processi Node.
I tentativi riprendono dopo un riavvio con attesa crescente da 5 secondi a 5 minuti.

Prima di creare una trattativa o nota il worker salva l'intenzione e cerca
l'eventuale copia remota. Se una risposta si perde, cerca il riferimento dell'invio
in Brevo prima di proseguire. Se la creazione resta ambigua, conserva l'errore
`brevo_deal_reconcile_required` o `brevo_note_reconcile_required` e non ripete il POST.
Un operatore deve verificare l'assenza effettiva della copia remota prima di azzerare
il relativo intent nella ricevuta privata. Non cancellare ricevute per ritentare.

Questa prova non comprende avvisi operativi via email o importazione dello storico.
Disattivare `BREVO_TRIAL_ENABLED` arresta la copia senza eliminare i dati già salvati.

## Conversations e Meetings

La nota CRM non è una conversazione email. Per la prova di risposta occorrono
una casella collegata a Conversations e un messaggio inviato da un indirizzo di test.
L'inoltro di moduli alla casella e il riconoscimento del mittente vanno verificati
prima di attivare quel percorso per i clienti.

Per Meetings occorrono l'autenticazione del titolare del calendario, disponibilità,
durata e collegamento di prenotazione. La chiave API non sostituisce il collegamento
della casella o del calendario. Questi passaggi restano separati dalla prova CRM.
