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

function Mark({ full = false, alt }) {
  return (
    <span className={`brand-art ${full ? "brand-art-full" : ""}`}>
      <img
        src="/images/wananga-logo-white.jpeg"
        alt={alt}
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
  const { settings } = useContent();
  const description = customDescription || settings.siteCopy.genericDescription;
  return (
    <Helmet>
      <title>{title} | {settings.siteCopy.brandName}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={window.location.origin + pathname} />
      <meta property="og:title" content={`${title} | ${settings.siteCopy.brandName}`} />
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
  const { settings } = useContent();
  const copy = settings.siteCopy;
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
        {copy.skipToContent}
      </a>
      <header className="wa-header">
        <div className="wa-container header-inner">
          <Link className="brand" to="/" aria-label={copy.brandLabel}>
            <Mark alt={copy.logoAlt} />
          </Link>
          <nav
            className={`wa-nav ${open ? "is-open" : ""}`}
            id="main-menu"
            aria-label={copy.menuLabel}
          >
            <NavLink to="/viaggi">{copy.navTrips}</NavLink>
            <NavLink to="/chi-siamo">{copy.navAbout}</NavLink>
            <NavLink to="/domande">{copy.navQuestions}</NavLink>
            <Button to="/viaggi">{copy.navCta}</Button>
          </nav>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="main-menu"
            aria-label={open ? copy.menuClose : copy.menuOpen}
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
            <Mark full alt={copy.logoAlt} />
            </Link>
          </div>
          <div>
            <p className="footer-heading">{copy.footerContactTitle}</p>
            <Link to="/contattaci">{copy.footerContact}</Link>
            <a
              href="https://instagram.com/wananga.travel"
              target="_blank"
              rel="noreferrer"
            >
              {copy.instagram} <Instagram size={15} />
            </a>
          </div>
          <div>
            <p className="footer-heading">{copy.footerAboutTitle}</p>
            <Link to="/chi-siamo">{copy.footerStory}</Link>
            <Link to="/domande">{copy.footerQuestions}</Link>
            <Link to="/newsletter">{copy.footerNewsletter}</Link>
          </div>
          <p className="footer-thought preserve-lines">{copy.footerMotto}</p>
        </div>
        <div className="wa-container footer-bottom">
          <span>© {new Date().getFullYear()} {copy.footerRights}</span>
          <div>
            <Link to="/privacy-policy">{copy.privacy}</Link>
            <Link to="/cookie-policy">{copy.cookies}</Link>
            <Link to="/termini">{copy.terms}</Link>
          </div>
          <span>{copy.footerByline}</span>
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
  const entries = settings.faq;
  return (
    <div className="faq-list">
      {entries.slice(0, all ? entries.length : 4).map(({ question, answer }) => (
        <FAQItem key={question} question={question} answer={answer} />
      ))}
    </div>
  );
}
function ContentState({ children }) {
  const { status, retry, settings } = useContent();
  const copy = settings.siteCopy;
  if (status === "loading") return <p className="cms-state" role="status">{copy.cmsLoading}</p>;
  if (status === "error") return (
    <div className="cms-state" role="alert">
      <p>{copy.cmsError}</p>
      <button className="wa-button" onClick={retry}>{copy.cmsRetry}</button>
    </div>
  );
  return children;
}
function TripCard({ trip, settings }) {
  return (
    <article className="trip-card">
      <div className="trip-photo">
        {trip.image ? <img src={trip.image} alt={trip.imageAlt || trip.title}
          loading="lazy" width="1400" height="788" /> : <div className="trip-image-placeholder">{settings.siteCopy.tripImagePlaceholder}</div>}
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
        : <p>{settings.siteCopy.tripEmpty} <Link className="text-link" to="/newsletter">{settings.siteCopy.tripEmptyCta}</Link>.</p>}
    </div>
  </ContentState>;
}
function Trips() {
  const { settings } = useContent();
  return <section className="wa-section wa-container">
    <Meta title={settings.siteCopy.tripsPageTitle} description={settings.siteCopy.tripsMetaDescription} />
    <div className="section-heading"><h1>{settings.siteCopy.tripsPageTitle}</h1></div>
    <TripList />
  </section>;
}
function Newsletter() {
  const { settings } = useContent();
  return <section className="wa-section wa-container application-grid">
    <Meta title={settings.siteCopy.newsletterMetaTitle} />
    <div>
      <h1 className="preserve-lines">{settings.newsletterTitle}</h1>
      <p className="lead-text">{settings.newsletterDescription}</p>
    </div>
    <div className="form-panel"><ReachNewsletter copy={settings.siteCopy} /></div>
  </section>;
}
function Home() {
  const { settings } = useContent();
  const copy = settings.siteCopy;
  return (
    <div className="home-revised">
      <Meta title={copy.homeMetaTitle} description={copy.homeMetaDescription} />
      <section className="coast-hero" aria-labelledby="home-title">
        <picture>
          <source media="(max-width: 760px)" srcSet={media.coastMobile} />
          <img
            src={media.coast}
            srcSet="/images/bali-coast-1200-v2.webp 1200w, /images/bali-coast-2000-v2.webp 2000w"
            sizes="calc(100vw - 48px)"
            alt={copy.homeHeroAlt}
            width="2000"
            height="1499"
            fetchPriority="high"
            loading="eager"
          />
        </picture>
        <div className="wa-container coast-hero-content">
          <h1 id="home-title" className="preserve-lines">{settings.homeTitle}</h1>
          <p className="preserve-lines">{settings.homeIntro}</p>
          <Button to="/viaggi/bali">{settings.homePrimaryCta}</Button>
        </div>
      </section>
      <section className="wa-container home-vision">
        <h2 className="preserve-lines">{copy.homeVisionTitle}</h2>
        <div>
          <p>{copy.homeVisionText}</p>
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
              alt={copy.homeFoundersAlt}
              loading="lazy"
            />
          </div>
          <div className="founders-copy">
            <h2 className="preserve-lines">{copy.homeFoundersTitle}</h2>
            <p className="preserve-lines">{settings.foundersText}</p>
            <Button to="/chi-siamo" secondary>{settings.storyCta}</Button>
          </div>
        </div>
      </section>
      <section className="wa-container home-questions">
        <h2>{copy.homeQuestionsTitle}</h2>
        <FAQ />
        <Link to="/domande" className="text-link">
          {copy.homeAllQuestions}
        </Link>
      </section>
      <section className="home-newsletter" id="aggiornamenti">
        <div className="wa-container newsletter-grid">
          <div>
            <h2 className="preserve-lines">{settings.newsletterTitle}</h2>
            <p>{settings.newsletterDescription}</p>
          </div>
          <ReachNewsletter copy={copy} />
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
  const { trips, settings, status } = useContent();
  const copy = settings.siteCopy;
  const trip = trips.find((item) => item.slug === slug);
  if (status !== "ready") return <section className="wa-section wa-container"><ContentState /></section>;
  if (!trip) return <NotFound />;
  const labels = { interest: copy.tripStatusInterest, open: copy.tripStatusOpen, full: copy.tripStatusFull, closed: copy.tripStatusClosed };
  return (
    <>
      <Meta title={trip.headline || trip.title} description={trip.summary} image={trip.image} />
      <section className="wa-container wa-section trip-intro">
        <Link to="/viaggi" className="quiet-link">{copy.tripBreadcrumb}</Link>
        <div className="section-heading">
          <div><p className="section-kicker">{trip.destination}</p><h1>{trip.headline || trip.title}</h1></div>
          <p>{trip.summary}</p>
        </div>
        <div className="trip-banner">
          {trip.image ? <img src={trip.image} alt={trip.imageAlt || trip.title} /> : <div className="trip-image-placeholder">{copy.tripImagePlaceholder}</div>}
          <span className="photo-badge">{trip.dateLabel}</span>
        </div>
        <div className="trip-overview">
          <div><small>{copy.tripDuration}</small><strong>{trip.duration || copy.tripConfirm}</strong></div>
          <div><small>{copy.tripGroup}</small><strong>{trip.group || copy.tripConfirm}</strong></div>
          <div><small>{copy.tripPrice}</small><strong>{trip.price || copy.tripConfirm}</strong></div>
          <div><small>{copy.tripFlight}</small><strong>{trip.flight || copy.tripConfirm}</strong></div>
        </div>
      </section>
      <section className="wa-container trip-detail-grid">
        <div>
          <h2>{copy.tripSectionTitle}</h2>
          <Paragraphs text={trip.description} />
          {trip.itinerary.length > 0 && <div className="route-list">
            {trip.itinerary.map((step, i) => <div key={step._key || i}>
              <span className="route-number">{String(i + 1).padStart(2, "0")}</span>
              <div><h3>{step.title}</h3><p className="preserve-lines">{step.description}</p></div>
            </div>)}
          </div>}
          {trip.beforeBooking && <><h2>{copy.tripBeforeTitle}</h2><Paragraphs text={trip.beforeBooking} /></>}
        </div>
        <aside className="trip-aside">
          <span className="trip-status"><span /> {labels[trip.status]}</span>
          <h3>{copy.tripCtaTitle}</h3>
          {acceptsRequests(trip) ? <>
            <p>{copy.tripInterestText}</p>
            <Button to={tripRequestPath(trip)}>{settings.tripInterestCta}</Button>
            <small>{copy.tripNoPayment}</small>
          </> : <>
            <p>{copy.tripUnavailableText}</p>
            <Button to="/newsletter">{settings.tripClosedCta}</Button>
          </>}
          <hr /><Link className="text-link" to="/contattaci">{copy.tripContact} <ArrowUpRight size={17} /></Link>
        </aside>
      </section>
    </>
  );
}
function Philosophy() {
  const { settings } = useContent();
  const copy = settings.siteCopy;
  return (
    <>
      <Meta title={copy.aboutMetaTitle} description={copy.aboutMetaDescription} />
      <section className="wa-section wa-container story-opening">
        <p className="section-kicker">{settings.aboutIntro}</p>
        <h1 className="preserve-lines">{copy.aboutTitle}</h1>
        <div className="lead-text"><Paragraphs text={settings.aboutText} /></div>
        <img src={media.people} alt={copy.aboutImageAlt} />
      </section>
      <section className="wa-container story-body">
        <h2>{copy.aboutStoryTitle}</h2>
        <p>{copy.aboutStory1}</p>
        <p>{copy.aboutStory2}</p>
        <blockquote className="preserve-lines">{copy.aboutQuote}</blockquote>
        <p>{copy.aboutStory3}</p>
      </section>
      <section className="wa-section wa-container">
        <div className="section-heading">
          <h2>{copy.aboutPeopleTitle}</h2>
        </div>
        <div className="founder-cards">
          {[
            [
              media.riccardo,
              copy.aboutRiccardoName,
              copy.aboutRiccardoRole,
              copy.aboutRiccardoText,
            ],
            [
              media.ftima,
              copy.aboutFtimaName,
              copy.aboutFtimaRole,
              copy.aboutFtimaText,
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
          <h2>{copy.aboutClosingTitle}</h2>
          <Button to="/viaggi">{settings.closingCta}</Button>
        </div>
      </section>
    </>
  );
}

function SubmissionForm({ kind = "application", defaultMessage = "" }) {
  const { settings } = useContent();
  const copy = settings.siteCopy;
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
      setError(
        Object.keys(err?.response?.data || {}).length
          ? copy.formValidationError
          : copy.formSaveError,
      );
      setStatus("error");
    }
  };
  if (status === "success")
    return (
      <div className="form-success" role="status">
        <Check size={32} />
        <h3>{copy.formSuccessTitle}</h3>
        <p>{copy.formSuccessText}</p>
        {application && <p>{copy.formSuccessApplication}</p>}
      </div>
    );
  return (
    <form className="wa-form" onSubmit={submit}>
      <div className="form-row">
        <label>
          {copy.formName}{application && ` ${copy.formFullName}`}
          <input
            name="nome"
            autoComplete="name"
            required
            maxLength={120}
            placeholder={application ? copy.formNameApplicationPlaceholder : copy.formNamePlaceholder}
          />
        </label>
        <label>
          {copy.formEmail}
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder={copy.formEmailPlaceholder}
          />
        </label>
      </div>
      {application && (
        <>
          <label>
            {copy.formPhone}
            <input
              name="telefono"
              type="tel"
              autoComplete="tel"
              required
              maxLength={40}
              placeholder={copy.formPhonePlaceholder}
            />
          </label>
          <div className="form-row">
            <label>
            {copy.formPeople}
              <select name="numero_persone" required defaultValue="">
                <option value="" disabled>
                  {copy.formSelect}
                </option>
                {["1", "2", "3", "4", "5+"].map((n) => (
                  <option key={n} value={n}>
                    {n === "1" ? copy.formSolo : `${n} ${copy.formPeopleSuffix}`}
                  </option>
                ))}
              </select>
            </label>
            <label>
            {copy.formContactTime}
              <select name="contatto_preferito" required defaultValue="">
                <option value="" disabled>
                  {copy.formSelect}
                </option>
                <option value="mattino">{copy.formMorning}</option>
                <option value="pomeriggio">{copy.formAfternoon}</option>
                <option value="sera">{copy.formEvening}</option>
              </select>
            </label>
          </div>
          <label>
            {copy.formMotivation}
            <textarea
              name="motivazione"
              rows={3}
              maxLength={2000}
              required
              placeholder={copy.formMotivationPlaceholder}
            />
          </label>
        </>
      )}
      {!application && (
        <label>
          {copy.formMessage}
          <textarea
            name="messaggio"
            defaultValue={defaultMessage}
            rows={5}
            maxLength={5000}
            required
            placeholder={copy.formMessagePlaceholder}
          />
        </label>
      )}
      <label className="check-label">
        <input name="privacy" type="checkbox" required />
        <span>
          {copy.formPrivacyLead}
          <Link to="/privacy-policy" target="_blank">
            {copy.formPrivacyLink}
          </Link>{" "}
          {copy.formPrivacyTail}
        </span>
      </label>
      <p className="form-note">{copy.formNewsletterNote} <Link className="text-link" to="/newsletter">{copy.formNewsletterLink}</Link>.</p>
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
            {copy.formSending}
          </>
        ) : (
          <>
            {application ? copy.formApplicationSubmit : copy.formContactSubmit}
            <ArrowUpRight size={18} />
          </>
        )}
      </button>
      {application && (
        <p className="form-note">
          {copy.formApplicationNote}
        </p>
      )}
      {import.meta.env.MODE === "local" && (
        <p className="local-note">
          {copy.formLocalNote}
        </p>
      )}
    </form>
  );
}
function Application() {
  const { trips, settings, status } = useContent();
  const copy = settings.siteCopy;
  const trip = trips.find((item) => item.slug === "bali");
  if (status !== "ready") return <section className="wa-section wa-container"><ContentState /></section>;
  if (!trip) return <NotFound />;
  if (!acceptsRequests(trip)) return <Navigate to="/viaggi/bali" replace />;
  return (
    <>
      <Meta title={copy.applicationMetaTitle} description={copy.applicationMetaDescription} />
      <section className="wa-section wa-container application-grid">
        <div>
          <p className="section-kicker">{copy.applicationKicker}</p>
          <h1 className="preserve-lines">{copy.applicationTitle}</h1>
          <p className="lead-text">{copy.applicationIntro}</p>
          <p>{copy.applicationDescription}</p>
          <div className="application-trip">
            {trip.image && <img src={trip.image} alt={trip.imageAlt || trip.title} />}
            <div>
              <strong>{trip.title}, {trip.destination}</strong>
              <small>{trip.dateLabel}</small>
              <Link to="/viaggi/bali">{copy.applicationReview}</Link>
            </div>
          </div>
          <ol className="next-steps">
            <li>{copy.applicationStep1}</li>
            <li>{copy.applicationStep2}</li>
            <li>{copy.applicationStep3}</li>
          </ol>
        </div>
        <div className="form-panel">
          <h2>{copy.applicationFormTitle}</h2>
          <p>{copy.applicationFormNote}</p>
          <SubmissionForm />
        </div>
      </section>
    </>
  );
}
function Contact() {
  const { settings } = useContent();
  const copy = settings.siteCopy;
  const { search } = useLocation();
  const requestedTrip = new URLSearchParams(search).get("viaggio")?.slice(0, 200);
  return (
    <>
      <Meta title={copy.contactMetaTitle} description={copy.contactMetaDescription} />
      <section className="wa-section wa-container application-grid">
        <div>
          <p className="section-kicker">{copy.contactKicker}</p>
          <h1 className="preserve-lines">{copy.contactTitle}</h1>
          <p className="lead-text">{copy.contactIntro}</p>
          <a className="text-link" href={"mailto:" + settings.contactEmail}>
            {settings.contactEmail} <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="form-panel">
          <h2>{copy.contactFormTitle}</h2>
          <SubmissionForm key={requestedTrip || "contact"} kind="contact" defaultMessage={requestedTrip ? copy.contactMessageDefault + requestedTrip + "." : ""} />
        </div>
      </section>
    </>
  );
}
function Questions() {
  const { settings } = useContent();
  const copy = settings.siteCopy;
  return (
    <>
      <Meta title={copy.questionsMetaTitle} description={copy.questionsMetaDescription} />
      <section className="wa-section wa-container faq-page">
        <p className="section-kicker">{copy.questionsKicker}</p>
        <h1>{copy.questionsTitle}</h1>
        <p className="lead-text">{copy.questionsIntro}</p>
        <FAQ all />
        <div className="closing-call">
          <h2>{copy.questionsClosingTitle}</h2>
          <Button to="/contattaci">{copy.questionsContact}</Button>
        </div>
      </section>
    </>
  );
}
function Legal() {
  const { settings } = useContent();
  const copy = settings.siteCopy;
  return (
    <>
      <Meta title={copy.legalMetaTitle} />
      <section className="wa-section wa-container story-body">
        <h1>{copy.legalTitle}</h1>
        <p>{copy.legalText1}</p>
        <p>{copy.legalText2}</p>
        <Button to="/">{copy.returnHome}</Button>
      </section>
    </>
  );
}
function NotFound() {
  const { settings } = useContent();
  const copy = settings.siteCopy;
  return (
    <section className="wa-section wa-container story-body">
      <Meta title={copy.notFoundMetaTitle} />
      <p className="section-kicker">{copy.notFoundKicker}</p>
      <h1 className="preserve-lines">{copy.notFoundTitle}</h1>
      <p>{copy.notFoundText}</p>
      <Button to="/">{copy.returnHome}</Button>
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
          {["/il-nostro-modo-di-viaggiare", "/filosofia"].map((path) => (
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
