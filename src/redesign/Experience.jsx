import { useEffect, useId, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  ArrowUpRight,
  Menu,
  X,
  Plus,
  Users,
  Sunrise,
  Check,
  Instagram,
  Loader2,
} from "lucide-react";
import pb from "../lib/pocketbaseClient";
import { ContentProvider, useContent } from "../contexts/ContentContext";
import { acceptsRequests, tripRequestPath } from "../lib/content";
import ReachNewsletter from "../components/ReachNewsletter";
import pages from "./pages.json";
import "./design.css";

const media = {
  coast: "/images/bali-coast-2000-v2.webp",
  coastMobile: "/images/bali-coast-mobile-v2.webp",
  penida: "/images/nusa-penida.webp",
  people:
    "https://horizons-cdn.hostinger.com/356254a3-e909-4e6e-be23-5f7439e796ec/3x8a9240-2-pv6kY.JPG",
  riccardo:
    "https://horizons-cdn.hostinger.com/356254a3-e909-4e6e-be23-5f7439e796ec/img_8194-OZSjS.jpeg",
  ftima:
    "https://horizons-cdn.hostinger.com/356254a3-e909-4e6e-be23-5f7439e796ec/img_8280-FPdPv.jpeg",
};

const questions = [
  [
    "Posso partire anche da solo o da sola?",
    "Sì. Puoi partire senza conoscere nessuno. Il piccolo gruppo lascia spazio per conoscersi, condividere le giornate e trovare anche i propri momenti di autonomia.",
  ],
  [
    "Che cosa rende diverso un viaggio Wānanga?",
    "Il tempo che scegliamo di dedicare ai luoghi e alle persone. Il progetto nasce dal modo di viaggiare di Riccardo e Ftima: esplorare, conoscere e lasciare spazio anche a sé stessi. Il programma di ogni partenza racconta come questo si traduce nelle giornate.",
  ],
  [
    "Il volo è incluso?",
    "Il volo internazionale non è incluso. Prima di confermare la partecipazione riceverai i dettagli del punto di incontro e delle date, per organizzare il viaggio dalla città che preferisci.",
  ],
  [
    "Sono già disponibili date e prezzi?",
    "Stiamo definendo la prossima partenza per Bali. Puoi lasciarci una richiesta di interesse: ti ricontatteremo con date, quota, sistemazioni e condizioni prima di qualsiasi conferma.",
  ],
  [
    "La richiesta mi impegna a prenotare?",
    "No. È il primo passo per conoscerci e ricevere le informazioni. Inviare il modulo non riserva un posto e non richiede alcun pagamento.",
  ],
  [
    "Come sono organizzate le camere?",
    "Le sistemazioni e le modalità di condivisione saranno indicate nel programma definitivo. Raccontaci eventuali preferenze quando ci sentiamo, così potremo verificarle insieme.",
  ],
];
function Mark({ full = false }) {
  return (
    <span className={`brand-art ${full ? "brand-art-full" : ""}`}>
      <img
        src="/images/wananga-logo-white.jpeg"
        alt="Wānanga — viaggi, persone, vita"
        width="1600"
        height="900"
      />
    </span>
  );
}
function Button({ to, children, secondary = false }) {
  return (
    <Link
      className={`wa-button ${secondary ? "wa-button-secondary" : ""}`}
      to={to}
    >
      {children}
    </Link>
  );
}
function Meta({ title, description: customDescription, image }) {
  const { pathname } = useLocation();
  const description = customDescription ||
    pages.find((page) => page.url === pathname)?.description ||
    "Viaggi in piccoli gruppi con Riccardo e Ftima. Tempo per i luoghi, per gli altri e per te.";
  return (
    <Helmet>
      <title>{title} | WĀNANGA</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={window.location.origin + pathname} />
      <meta property="og:title" content={`${title} | WĀNANGA`} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta
        property="og:image"
        content={image || window.location.origin + media.coast}
      />
    </Helmet>
  );
}
function Scroll() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const frame = requestAnimationFrame(() =>
        document.getElementById(hash.slice(1))?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        }),
      );
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
}
function Shell({ children }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <div className="wananga">
      <a className="skip-link" href="#contenuto">
        Vai al contenuto
      </a>
      <header className="wa-header">
        <div className="wa-container header-inner">
          <Link className="brand" to="/" aria-label="Wānanga, homepage">
            <Mark />
          </Link>
          <nav
            className={`wa-nav ${open ? "is-open" : ""}`}
            id="main-menu"
            aria-label="Menu principale"
          >
            <NavLink to="/viaggi">I viaggi</NavLink>
            <NavLink to="/chi-siamo">Chi siamo</NavLink>
            <NavLink to="/domande">Domande</NavLink>
            <Button to="/viaggi">Parti con noi</Button>
          </nav>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="main-menu"
            aria-label={open ? "Chiudi menu" : "Apri menu"}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="contenuto">
        <div key={pathname} className="page-enter">
          {children}
        </div>
      </main>
      <footer className="wa-footer">
        <div className="wa-container footer-main">
          <div>
            <Link className="brand" to="/">
              <Mark full />
            </Link>
          </div>
          <div>
            <p className="footer-heading">Ci trovi qui</p>
            <Link to="/contattaci">Scrivici</Link>
            <a
              href="https://instagram.com/wananga.travel"
              target="_blank"
              rel="noreferrer"
            >
              Instagram <Instagram size={15} />
            </a>
          </div>
          <div>
            <p className="footer-heading">Conosciamoci meglio</p>
            <Link to="/chi-siamo">La nostra storia</Link>
            <Link to="/domande">Le tue domande</Link>
            <Link to="/newsletter">Newsletter</Link>
          </div>
          <p className="footer-thought">
            Il mondo è grande.
            <br />
            Facciamogli spazio.
          </p>
        </div>
        <div className="wa-container footer-bottom">
          <span>© {new Date().getFullYear()} Wānanga</span>
          <div>
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/cookie-policy">Cookie</Link>
            <Link to="/termini">Termini e condizioni</Link>
          </div>
          <span>Con Riccardo e Ftima</span>
        </div>
      </footer>
    </div>
  );
}
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="faq-item">
      <button
        type="button"
        className="faq-question"
        id={`${id}-question`}
        aria-expanded={open}
        aria-controls={`${id}-answer`}
        onClick={() => setOpen((value) => !value)}
      >
        {question}
        <Plus size={20} aria-hidden="true" />
      </button>
      <div
        className={`faq-answer ${open ? "is-open" : ""}`}
        id={`${id}-answer`}
        role="region"
        aria-labelledby={`${id}-question`}
        aria-hidden={!open}
      >
        <div>
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
}
function FAQ({ all = false }) {
  const { settings } = useContent();
  const entries = settings.faq.length ? settings.faq : questions.map(([question, answer]) => ({ question, answer }));
  return (
    <div className="faq-list">
      {entries.slice(0, all ? entries.length : 4).map(({ question, answer }) => (
        <FAQItem key={question} question={question} answer={answer} />
      ))}
    </div>
  );
}
function ContentState({ children }) {
  const { status, retry } = useContent();
  if (status === "loading") return <p className="cms-state" role="status">Stiamo caricando i viaggi…</p>;
  if (status === "error") return (
    <div className="cms-state" role="alert">
      <p>Non riusciamo a mostrare i viaggi in questo momento.</p>
      <button className="wa-button" onClick={retry}>Riprova</button>
    </div>
  );
  return children;
}
function TripCard({ trip, settings }) {
  return (
    <article className="trip-card">
      <div className="trip-photo">
        {trip.image ? <img src={trip.image} alt={trip.imageAlt || trip.title}
          loading="lazy" width="1400" height="788" /> : <div className="trip-image-placeholder">Wānanga</div>}
      </div>
      <div className="trip-card-body">
        <h3>{trip.title}</h3>
        <p>{trip.summary}</p>
        <p className="departure-info">{trip.dateLabel}<br />{trip.price}</p>
        <Button to={"/viaggi/" + trip.slug}>{settings.tripCardCta}</Button>
      </div>
    </article>
  );
}
function TripList() {
  const { trips, settings } = useContent();
  return <ContentState>
    <div className="trip-catalog">
      {trips.length ? trips.map((trip) => <TripCard key={trip.slug} trip={trip} settings={settings} />)
        : <p>Stiamo preparando i prossimi viaggi. <Link className="text-link" to="/newsletter">Ricevi le novità</Link>.</p>}
    </div>
  </ContentState>;
}
function Trips() {
  return <section className="wa-section wa-container">
    <Meta title="I nostri viaggi" description="Scopri i viaggi Wānanga: luoghi, programmi e prossime partenze." />
    <div className="section-heading"><h1>I nostri viaggi.</h1></div>
    <TripList />
  </section>;
}
function Newsletter() {
  const { settings } = useContent();
  return <section className="wa-section wa-container application-grid">
    <Meta title="Newsletter" />
    <div>
      <h1 className="preserve-lines">{settings.newsletterTitle}</h1>
      <p className="lead-text">{settings.newsletterDescription}</p>
    </div>
    <div className="form-panel"><ReachNewsletter /></div>
  </section>;
}
function Home() {
  const { settings } = useContent();
  return (
    <div className="home-revised">
      <Meta title="Il mondo, con calma" />
      <section className="coast-hero" aria-labelledby="home-title">
        <picture>
          <source media="(max-width: 760px)" srcSet={media.coastMobile} />
          <img
            src={media.coast}
            srcSet="/images/bali-coast-1200-v2.webp 1200w, /images/bali-coast-2000-v2.webp 2000w"
            sizes="calc(100vw - 48px)"
            alt="Le onde dell’oceano incontrano la costa verde di Kelingking, a Bali"
            width="2000"
            height="1499"
            fetchPriority="high"
            loading="eager"
          />
        </picture>
        <div className="wa-container coast-hero-content">
          <h1 id="home-title" className="preserve-lines">{settings.homeTitle}</h1>
          <p className="preserve-lines">{settings.homeIntro}</p>
          <Button to="/viaggi">{settings.homePrimaryCta}</Button>
        </div>
      </section>
      <section className="wa-container home-vision">
        <h2>
          Un viaggio è anche <br />
          tempo per te.
        </h2>
        <div>
          <p>
            Ci piace conoscere un luogo senza correre da una tappa all’altra.
            Stare insieme, ma lasciare spazio anche a una passeggiata da soli. È
            così che immaginiamo ogni Wānanga.
          </p>
          <Button to="/chi-siamo" secondary>{settings.visionCta}</Button>
        </div>
      </section>
      <section className="wa-container home-departure">
        <h2>{settings.tripsTitle}</h2>
        <TripList />
      </section>
      <section className="home-founders">
        <div className="wa-container founders-grid">
          <div className="founders-photo">
            <img
              src={media.people}
              alt="Riccardo e Ftima sulla spiaggia al tramonto"
              loading="lazy"
            />
          </div>
          <div className="founders-copy">
            <h2>
              Siamo Riccardo
              <br />e Ftima.
            </h2>
            <p className="preserve-lines">{settings.foundersText}</p>
            <Button to="/chi-siamo" secondary>{settings.storyCta}</Button>
          </div>
        </div>
      </section>
      <section className="wa-container home-questions">
        <h2>Ti stai chiedendo…</h2>
        <FAQ />
        <Link to="/domande" className="text-link">
          Leggi tutte le risposte
        </Link>
      </section>
      <section className="home-newsletter" id="aggiornamenti">
        <div className="wa-container newsletter-grid">
          <div>
            <h2 className="preserve-lines">{settings.newsletterTitle}</h2>
            <p>{settings.newsletterDescription}</p>
          </div>
          <ReachNewsletter />
        </div>
      </section>
    </div>
  );
}
function Paragraphs({ text }) {
  return String(text || "").split(/\n\s*\n/).filter(Boolean).map((p, i) =>
    <p className="preserve-lines" key={i}>{p}</p>);
}
function Trip() {
  const { slug } = useParams();
  const { trips, status } = useContent();
  const trip = trips.find((item) => item.slug === slug);
  if (status !== "ready") return <section className="wa-section wa-container"><ContentState /></section>;
  if (!trip) return <NotFound />;
  const labels = { interest: "Stiamo preparando la partenza", open: "Richieste aperte", full: "Gruppo al completo", closed: "Richieste chiuse" };
  return (
    <>
      <Meta title={trip.headline || trip.title} description={trip.summary} image={trip.image} />
      <section className="wa-container wa-section trip-intro">
        <Link to="/viaggi" className="quiet-link">Wānanga / I viaggi</Link>
        <div className="section-heading">
          <div><p className="section-kicker">{trip.destination}</p><h1>{trip.headline || trip.title}</h1></div>
          <p>{trip.summary}</p>
        </div>
        <div className="trip-banner">
          {trip.image ? <img src={trip.image} alt={trip.imageAlt || trip.title} /> : <div className="trip-image-placeholder">Wānanga</div>}
          <span className="photo-badge">{trip.dateLabel}</span>
        </div>
        <div className="trip-overview">
          <div><small>Durata</small><strong>{trip.duration || "Da confermare"}</strong></div>
          <div><small>Il gruppo</small><strong>{trip.group || "Da confermare"}</strong></div>
          <div><small>La quota</small><strong>{trip.price || "Da confermare"}</strong></div>
          <div><small>Il volo</small><strong>{trip.flight || "Da confermare"}</strong></div>
        </div>
      </section>
      <section className="wa-container trip-detail-grid">
        <div>
          <h2>Il viaggio.</h2>
          <Paragraphs text={trip.description} />
          {trip.itinerary.length > 0 && <div className="route-list">
            {trip.itinerary.map((step, i) => <div key={step._key || i}>
              <span className="route-number">{String(i + 1).padStart(2, "0")}</span>
              <div><h3>{step.title}</h3><p className="preserve-lines">{step.description}</p></div>
            </div>)}
          </div>}
          {trip.beforeBooking && <><h2>Prima di scegliere.</h2><Paragraphs text={trip.beforeBooking} /></>}
        </div>
        <aside className="trip-aside">
          <span className="trip-status"><span /> {labels[trip.status]}</span>
          <h3>Partiamo insieme?</h3>
          {acceptsRequests(trip) ? <>
            <p>Lascia una richiesta di interesse. Ti ricontatteremo per conoscerci e raccontarti i prossimi passi.</p>
            <Button to={tripRequestPath(trip)}>{settings.tripInterestCta}</Button>
            <small>Nessun pagamento. Nessun posto prenotato.</small>
          </> : <>
            <p>Al momento non raccogliamo richieste per questo viaggio.</p>
            <Button to="/newsletter">{settings.tripClosedCta}</Button>
          </>}
          <hr /><Link className="text-link" to="/contattaci">Hai una domanda? Scrivici <ArrowUpRight size={17} /></Link>
        </aside>
      </section>
    </>
  );
}
function Philosophy() {
  const { settings } = useContent();
  return (
    <>
      <Meta title="Chi siamo" />
      <section className="wa-section wa-container story-opening">
        <p className="section-kicker">{settings.aboutIntro}</p>
        <h1>
          Chi siamo.
          <br />
          Wananga nasce da qui.
        </h1>
        <div className="lead-text"><Paragraphs text={settings.aboutText} /></div>
        <img src={media.people} alt="Riccardo e Ftima davanti al mare" />
      </section>
      <section className="wa-container story-body">
        <h2>Partire è solo l’inizio.</h2>
        <p>
          Abbiamo scelto una vita fatta di parole e di partenze. Viaggiando,
          abbiamo imparato che i ricordi più belli spesso arrivano quando
          smettiamo di riempire ogni momento.
        </p>
        <p>
          Per questo pensiamo a piccoli gruppi, a luoghi da conoscere con
          rispetto e a giornate che lascino respiro. Si può stare insieme senza
          dover fare tutto insieme. Si può partire da soli e trovare persone con
          cui sentirsi a proprio agio.
        </p>
        <blockquote>
          Il tempo per un luogo.
          <br />
          Il tempo per gli altri.
          <br />
          Il tempo per te.
        </blockquote>
        <p>
          La nostra idea di viaggio prende forma nel programma: nelle soste,
          negli incontri, nei momenti liberi. Ogni proposta deve raccontarti
          chiaramente che cosa aspettarti, prima di partire.
        </p>
      </section>
      <section className="wa-section wa-container">
        <div className="section-heading">
          <h2>Le persone dietro Wānanga.</h2>
        </div>
        <div className="founder-cards">
          {[
            [
              media.riccardo,
              "Riccardo Bertoldi",
              "Scrittore e viaggiatore",
              "Le storie mi accompagnano ovunque. Nei viaggi cerco prospettive nuove, persone da ascoltare e il tempo per farmi domande.",
            ],
            [
              media.ftima,
              "Ftima",
              "Scrittrice e viaggiatrice",
              "Mi piacciono le parole che avvicinano e i luoghi in cui ci si sente accolti. Vorrei portare questo stesso spazio di ascolto in ogni viaggio.",
            ],
          ].map(([src, name, role, text]) => (
            <article key={name}>
              <img src={src} alt={name} loading="lazy" />
              <div>
                <h3>{name}</h3>
                <p className="founder-role">{role}</p>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="closing-call">
          <h2>Partiamo insieme.</h2>
          <Button to="/viaggi">{settings.closingCta}</Button>
        </div>
      </section>
    </>
  );
}

function SubmissionForm({ kind = "application", defaultMessage = "" }) {
  const application = kind === "application";
  const [status, setStatus] = useState("idle"),
    [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity() || status === "sending") return;
    const values = Object.fromEntries(new FormData(form));
    setStatus("sending");
    setError("");
    const payload = {
      nome: values.nome.trim(),
      email: values.email.trim(),
      privacy_accepted: values.privacy === "on",
      consenso_newsletter: false,
    };
    if (application)
      Object.assign(payload, {
        viaggio: "Bali",
        telefono: values.telefono.trim(),
        numero_persone: values.numero_persone,
        contatto_preferito: values.contatto_preferito,
        motivazione: values.motivazione.trim(),
        aspettative: "",
        esperienza_gruppo: "",
        info_utili: "",
      });
    else payload.messaggio = values.messaggio.trim();
    try {
      await pb
        .collection(
          application ? "candidature" : "contatti",
        )
        .create(payload);
      setStatus("success");
      form.reset();
    } catch (err) {
      const fields = Object.keys(err?.response?.data || {});
      setError(
        fields.length
          ? `Controlla questi campi e riprova: ${fields.join(", ")}.`
          : "Non siamo riusciti a salvare la richiesta. I tuoi dati sono ancora qui: riprova tra poco.",
      );
      setStatus("error");
    }
  };
  if (status === "success")
    return (
      <div className="form-success" role="status">
        <Check size={32} />
        <h3>
          La tua richiesta è arrivata.
        </h3>
        <p>
          Grazie per averci scritto. Ti ricontatteremo ai recapiti che hai lasciato.
        </p>
        {application && (
          <p>Non è una prenotazione: definiremo insieme i prossimi passi.</p>
        )}
      </div>
    );
  return (
    <form className="wa-form" onSubmit={submit}>
      <div className="form-row">
        <label>
          Nome {application && "e cognome"}
          <input
            name="nome"
            autoComplete="name"
            required
            maxLength={120}
            placeholder={application ? "Come ti chiami?" : "Il tuo nome"}
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="La tua email"
          />
        </label>
      </div>
      {application && (
        <>
          <label>
            Telefono
            <input
              name="telefono"
              type="tel"
              autoComplete="tel"
              required
              maxLength={40}
              placeholder="Per conoscerci con una telefonata"
            />
          </label>
          <div className="form-row">
            <label>
              Quante persone?
              <select name="numero_persone" required defaultValue="">
                <option value="" disabled>
                  Seleziona
                </option>
                {["1", "2", "3", "4", "5+"].map((n) => (
                  <option key={n} value={n}>
                    {n === "1" ? "Parto da solo/a" : `${n} persone`}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quando possiamo sentirci?
              <select name="contatto_preferito" required defaultValue="">
                <option value="" disabled>
                  Seleziona
                </option>
                <option value="mattino">Al mattino</option>
                <option value="pomeriggio">Nel pomeriggio</option>
                <option value="sera">La sera</option>
              </select>
            </label>
          </div>
          <label>
            Che cosa cerchi in questo viaggio?
            <textarea
              name="motivazione"
              rows={3}
              maxLength={2000}
              required
              placeholder="Bastano poche parole. Ci aiutano a conoscerti."
            />
          </label>
        </>
      )}
      {!application && (
        <label>
          Il tuo messaggio
          <textarea
            name="messaggio"
            defaultValue={defaultMessage}
            rows={5}
            maxLength={5000}
            required
            placeholder="Come possiamo aiutarti?"
          />
        </label>
      )}
      <label className="check-label">
        <input name="privacy" type="checkbox" required />
        <span>
          Ho letto l’
          <Link to="/privacy-policy" target="_blank">
            informativa privacy
          </Link>{" "}
          e acconsento al trattamento dei dati per questa richiesta.
        </span>
      </label>
      <p className="form-note">Vuoi ricevere anche le novità? <Link className="text-link" to="/newsletter">Iscriviti alla newsletter</Link>.</p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="wa-button"
        disabled={status === "sending"}
      >
        {status === "sending" ? (
          <>
            <Loader2 className="spin" size={18} />
            Invio in corso
          </>
        ) : (
          <>
            {application ? "Invia la richiesta" : "Invia il messaggio"}
            <ArrowUpRight size={18} />
          </>
        )}
      </button>
      {application && (
        <p className="form-note">
          Invii una richiesta di interesse per Bali. Non prenoti un posto e non
          è richiesto un pagamento.
        </p>
      )}
      {import.meta.env.MODE === "local" && (
        <p className="local-note">
          Anteprima locale: usa dati di prova. Gli invii restano nel database di
          test su questo computer.
        </p>
      )}
    </form>
  );
}
function Application() {
  const { trips, status } = useContent();
  const trip = trips.find((item) => item.slug === "bali");
  if (status !== "ready") return <section className="wa-section wa-container"><ContentState /></section>;
  if (!trip) return <NotFound />;
  if (!acceptsRequests(trip)) return <Navigate to="/viaggi/bali" replace />;
  return (
    <>
      <Meta title="Parti con noi" />
      <section className="wa-section wa-container application-grid">
        <div>
          <p className="section-kicker">Il primo passo è conoscerci</p>
          <h1>
            Il tuo viaggio
            <br />
            inizia da qui.
          </h1>
          <p className="lead-text">
            Ti incuriosisce Bali? Raccontaci qualcosa di te.
          </p>
          <p>
            Ti ricontatteremo per parlare del viaggio, delle prossime date e
            delle tue domande. Senza impegno.
          </p>
          <div className="application-trip">
            {trip.image && <img src={trip.image} alt={trip.imageAlt || trip.title} />}
            <div>
              <strong>{trip.title}, {trip.destination}</strong>
              <small>{trip.dateLabel}</small>
              <Link to="/viaggi/bali">Rivedi il viaggio</Link>
            </div>
          </div>
          <ol className="next-steps">
            <li>Ci lasci la tua richiesta.</li>
            <li>Ci sentiamo per conoscerci.</li>
            <li>Decidi con tutte le informazioni.</li>
          </ol>
        </div>
        <div className="form-panel">
          <h2>Piacere di conoscerti.</h2>
          <p>
            I campi del modulo sono richiesti.
          </p>
          <SubmissionForm />
        </div>
      </section>
    </>
  );
}
function Contact() {
  const { settings } = useContent();
  const { search } = useLocation();
  const requestedTrip = new URLSearchParams(search).get("viaggio")?.slice(0, 200);
  return (
    <>
      <Meta title="Scrivici" />
      <section className="wa-section wa-container application-grid">
        <div>
          <p className="section-kicker">Parliamone</p>
          <h1>
            Ogni viaggio parte
            <br />
            da una domanda.
          </h1>
          <p className="lead-text">Siamo qui per la tua.</p>
          <a className="text-link" href={"mailto:" + settings.contactEmail}>
            {settings.contactEmail} <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="form-panel">
          <h2>Scrivi a Wānanga.</h2>
          <SubmissionForm key={requestedTrip || "contact"} kind="contact" defaultMessage={requestedTrip ? "Vorrei informazioni sul viaggio " + requestedTrip + "." : ""} />
        </div>
      </section>
    </>
  );
}
function Questions() {
  return (
    <>
      <Meta title="Le tue domande" />
      <section className="wa-section wa-container faq-page">
        <p className="section-kicker">Facciamo chiarezza</p>
        <h1>Prima di partire.</h1>
        <p className="lead-text">
          Le informazioni utili per capire se questo viaggio fa per te.
        </p>
        <FAQ all />
        <div className="closing-call">
          <h2>Ti è rimasto un dubbio?</h2>
          <Button to="/contattaci">Scrivici</Button>
        </div>
      </section>
    </>
  );
}
function Legal() {
  return (
    <>
      <Meta title="Informazioni del sito" />
      <section className="wa-section wa-container story-body">
        <h1>Informazioni del sito.</h1>
        <p>
          I documenti privacy, cookie e le condizioni di viaggio non erano
          presenti nell’export. Devono essere inseriti e verificati prima di
          pubblicare questa versione e raccogliere dati reali.
        </p>
        <p>
          Questa anteprima serve a valutare il sito. Per informazioni puoi
          scrivere a ciao@wananga.travel.
        </p>
        <Button to="/">Torna alla home</Button>
      </section>
    </>
  );
}
function NotFound() {
  return (
    <section className="wa-section wa-container story-body">
      <Meta title="Pagina non trovata" />
      <p className="section-kicker">Fuori itinerario</p>
      <h1>
        Qui il sentiero
        <br />
        si interrompe.
      </h1>
      <p>La pagina che cerchi non esiste o ha cambiato indirizzo.</p>
      <Button to="/">Torna alla home</Button>
    </section>
  );
}
export default function Experience() {
  return (
    <ContentProvider>
    <BrowserRouter>
      <Scroll />
      <Shell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/viaggi" element={<Trips />} />
          <Route path="/viaggi/:slug" element={<Trip />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/chi-siamo" element={<Philosophy />} />
          <Route path="/domande" element={<Questions />} />
          <Route path="/candidatura-bali" element={<Application />} />
          <Route path="/contattaci" element={<Contact />} />
          {["/chi-siamo", "/filosofia"].map((path) => (
            <Route
              key={path}
              path={path}
              element={<Navigate to="/chi-siamo" replace />}
            />
          ))}
          {["/bali"].map((path) => (
            <Route
              key={path}
              path={path}
              element={<Navigate to="/viaggi/bali" replace />}
            />
          ))}
          <Route path="/faq" element={<Navigate to="/domande" replace />} />
          <Route
            path="/community"
            element={<Navigate to="/#aggiornamenti" replace />}
          />
          {["/privacy-policy", "/cookie-policy", "/termini"].map((path) => (
            <Route key={path} path={path} element={<Legal />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Shell>
    </BrowserRouter>
    </ContentProvider>
  );
}
