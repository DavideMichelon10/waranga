import { GENERAL_NEWSLETTER_CONSENT } from "../lib/waitlists";
import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { newsletterEnabled, subscribeToNewsletter } from "../lib/newsletter";

export default function ReachNewsletter({ copy }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const complete = status === "subscribed" || status === "pending_confirmation" || status === "accepted";

  async function submit(event) {
    event.preventDefault();
    if (status === "sending" || complete) return;
    if (!newsletterEnabled) {
      setStatus("unavailable");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      setStatus(await subscribeToNewsletter(email.trim()));
      setEmail("");
    } catch (error) {
      setError(error.message);
      setStatus("error");
    }
  }

  const message = {
    unavailable: copy.newsletterUnavailable,
    error: error || copy.newsletterError,
    subscribed: copy.newsletterSuccess,
    pending_confirmation: copy.newsletterConfirm,
    accepted: "Richiesta ricevuta. Controlla la tua email per eventuali istruzioni di conferma.",
  }[status];

  return (
    <div className="reach-newsletter">
      <form className="wa-form newsletter-form" onSubmit={submit} aria-busy={status === "sending"}>
        <label htmlFor={`${id}-email`}>
          {copy.newsletterEmailLabel}
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            placeholder={copy.newsletterEmailPlaceholder}
            maxLength={254}
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={status === "sending" || complete}
            aria-describedby={`${id}-privacy ${id}-status`}
          />
        </label>
        <button className="wa-button" type="submit" disabled={status === "sending" || complete}>
          {status === "sending" ? copy.newsletterSending : copy.newsletterButton}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
        <p className="form-note" id={`${id}-privacy`}>
          {GENERAL_NEWSLETTER_CONSENT} Consulta l’<Link className="text-link" to="/privacy-policy">{copy.formPrivacyLink}</Link>.
        </p>
        <div id={`${id}-status`} role="status" aria-live="polite">
          {message && <p className={status === "error" ? "form-error" : "form-note"}>{message}</p>}
        </div>
      </form>
    </div>
  );
}
