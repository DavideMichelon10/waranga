import { ArrowUpRight } from "lucide-react";
import { httpsUrl } from "../lib/content";

// The official hosted form handles consent, subscription and confirmation.
// No API keys or subscriber records are exposed to the frontend or Sanity.
const formUrl = httpsUrl(import.meta.env.VITE_REACH_FORM_URL);

export default function ReachNewsletter({ copy }) {
  return (
    <div className="reach-newsletter">
      {formUrl ? <>
        <p>{copy.newsletterSignup}</p>
        <a className="wa-button" href={formUrl} target="_blank" rel="noopener noreferrer">
          {copy.newsletterButton} <ArrowUpRight size={18} aria-hidden="true" />
        </a>
        <p className="form-note">{copy.newsletterNewTab}</p>
      </> : <p>{copy.newsletterUnavailable}</p>}
    </div>
  );
}
