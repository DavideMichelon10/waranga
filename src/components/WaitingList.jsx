import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { useContent } from "../contexts/ContentContext";
import { waitlistPhase, NEWSLETTER_CONSENT } from "../lib/waitlists";
import { subscribeToWaitlist } from "../lib/newsletter";

function WaitingListForm({ item }) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  async function submit(event) {
    event.preventDefault();
    if (status === "sending" || !event.currentTarget.reportValidity()) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setStatus("sending"); setMessage("");
    try {
      const result = await subscribeToWaitlist({
        email: values.email.trim(), waitlistId: item._id,
        privacy: values.privacy === "on", newsletter: values.newsletter === "on", website: values.website,
      });
      setStatus(result);
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }
  if (["subscribed", "pending_confirmation", "accepted"].includes(status)) return (
    <div className="waiting-success" role="status">
      <Check aria-hidden="true" /><h2>{status === "subscribed" ? "Sei nella lista." : "Richiesta ricevuta."}</h2>
      <p>{status === "pending_confirmation" ? "Controlla la tua email e conferma l’iscrizione per ricevere l’avviso." : status === "accepted" ? "La tua richiesta è stata ricevuta e salvata." : "Ti avviseremo via email quando il viaggio sarà disponibile."}</p>
    </div>
  );
  return <form className="wa-form" onSubmit={submit} aria-busy={status === "sending"}>
    <h2>Ci sei anche tu?</h2>
    <p className="form-note">Un’email quando il viaggio sarà pronto. Nessun posto prenotato, nessun impegno.</p>
    <label><span>La tua email <span aria-hidden="true">*</span></span>
      <input name="email" type="email" autoComplete="email" placeholder="nome@esempio.it" maxLength={254} required disabled={status === "sending"} />
    </label>
    <label className="form-trap" aria-hidden="true">Sito web<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label className="check-label"><input name="privacy" type="checkbox" required disabled={status === "sending"} />
      <span>Chiedo di ricevere via email l’avviso di apertura di questo viaggio e ho letto l’<Link to="/privacy-policy" target="_blank" rel="noopener noreferrer">informativa privacy</Link>. <span aria-hidden="true">*</span></span>
    </label>
    <label className="check-label"><input name="newsletter" type="checkbox" disabled={status === "sending"} /><span>{NEWSLETTER_CONSENT}</span></label>
    <button type="submit" className="wa-button" disabled={status === "sending"}>
      {status === "sending" ? <><Loader2 className="spin" size={18} /> Iscrizione in corso…</> : <>{item.buttonLabel || "Avvisami quando si parte"} <ArrowUpRight size={18} /></>}
    </button>
    <div role="status" aria-live="polite">{message && <p className={status === "error" ? "form-error" : "form-note"}>{message}</p>}</div>
  </form>;
}

export default function WaitingList() {
  const { slug } = useParams();
  const { waitlists, status, retry } = useContent();
  const item = waitlists.find((entry) => entry.slug === slug);
  if (status !== "ready") return <section className="wa-container wa-section" role="status">
    <p>{status === "error" ? "Non riusciamo a caricare questa pagina. Riprova tra poco." : "Stiamo preparando la pagina…"}</p>
    {status === "error" && <button className="wa-button" onClick={retry}>Riprova</button>}
  </section>;
  if (!item) return <section className="wa-container wa-section"><Helmet><title>Pagina non trovata | Wānanga</title><meta name="robots" content="noindex" /></Helmet><h1>Questa lista d’attesa non è disponibile.</h1><Link className="text-link" to="/viaggi">Scopri i viaggi</Link></section>;
  const phase = waitlistPhase(item);
  return <section className="waiting-page wa-container wa-section">
    <Helmet>
      <title>{item.title} — Lista d’attesa | Wānanga</title>
      <meta name="description" content={item.description?.slice(0, 160) || `Ricevi l’avviso di apertura del viaggio ${item.title}.`} />
      <meta property="og:title" content={`${item.title} — Il prossimo viaggio Wānanga`} />
      <meta property="og:description" content={item.description?.slice(0, 160)} />
      {item.image && <meta property="og:image" content={new URL(item.image, window.location.origin).href} />}
    </Helmet>
    <div className="waiting-layout">
      <div className="waiting-story">
        <p className="section-kicker">{item.title} · {phase === "collecting" ? "Il viaggio che verrà" : "Partiamo insieme"}</p>
        <h1>{item.headline || item.title}</h1>
        {item.period && <p className="waiting-period">{item.period}</p>}
        {item.image && <img className="waiting-photo" src={item.image} alt={item.imageAlt || item.title} width="1000" height="750" />}
        <div className="waiting-description">{(item.description || "").split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
      </div>
      <div className="form-panel waiting-panel">
        {phase === "collecting" ? <WaitingListForm key={item._id} item={item} /> : phase === "available" ? <>
          <h2>Il viaggio è pronto.</h2><p>Scopri il programma, le date e tutte le informazioni per partire con noi.</p>
          <Link className="wa-button" to={`/viaggi/${item.trip.slug}`}>Scopri il viaggio <ArrowUpRight size={18} /></Link>
        </> : <><h2>{phase === "closed" ? "Questa lista è chiusa." : "Il viaggio sta per arrivare."}</h2><p>Puoi seguire le altre partenze e ricevere le novità Wānanga.</p><Link className="wa-button" to="/newsletter">Scopri la newsletter</Link></>}
      </div>
    </div>
  </section>;
}
