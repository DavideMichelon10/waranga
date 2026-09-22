import { ArrowUpRight } from "lucide-react";
import { httpsUrl } from "../lib/content";

// The official hosted form handles consent, subscription and confirmation.
// No API keys or subscriber records are exposed to the frontend or Sanity.
const formUrl = httpsUrl(import.meta.env.VITE_REACH_FORM_URL);

export default function ReachNewsletter() {
  return (
    <div className="reach-newsletter">
      {formUrl ? <>
        <p>Iscriviti alla newsletter Wānanga. Puoi cancellare l’iscrizione in qualsiasi momento.</p>
        <a className="wa-button" href={formUrl} target="_blank" rel="noopener noreferrer">
          Iscriviti alla newsletter <ArrowUpRight size={18} aria-hidden="true" />
        </a>
        <p className="form-note">Si apre il nostro modulo di iscrizione in una nuova scheda.</p>
      </> : <p>Le iscrizioni alla newsletter apriranno presto. Torna a trovarci per le prossime novità.</p>}
    </div>
  );
}
