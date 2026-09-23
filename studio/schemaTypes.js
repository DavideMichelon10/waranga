import { waitlistSchema } from "./waitlistSchema.js";
import { defineArrayMember, defineField, defineType } from "sanity";
import { defaultSettings } from "../src/lib/content.js";
import { initialSiteSettings } from "./siteSettingsDefaults.js";

const textField = (name, title, required = false, rows = 4) => defineField({
  name, title, type: "text", rows,
  validation: (Rule) => required ? Rule.required() : Rule,
});
const stringField = (name, title, required = false) => defineField({
  name, title, type: "string",
  validation: (Rule) => required ? Rule.required() : Rule,
});
const copySections = [
  ["nav", "Menu"], ["footer", "Piè di pagina"], ["cms", "Messaggi di caricamento"],
  ["trips", "Pagina viaggi"], ["trip", "Pagina viaggio"], ["home", "Homepage"],
  ["about", "Chi siamo"], ["newsletter", "Newsletter"], ["form", "Moduli"],
  ["application", "Richiesta per Bali"], ["contact", "Contatti"], ["questions", "Domande"],
  ["legal", "Pagine legali"], ["notFound", "Pagina non trovata"],
];
const copyWords = {
  meta: "SEO", title: "titolo", description: "descrizione", text: "testo", alt: "testo alternativo",
  cta: "pulsante", button: "pulsante", trips: "viaggi", trip: "viaggio", story: "storia",
  form: "modulo", name: "nome", questions: "domande", newsletter: "newsletter", rights: "copyright",
  contact: "contatti", kicker: "sottotitolo", vision: "visione", intro: "introduzione", empty: "nessun risultato",
  error: "errore", loading: "caricamento", footer: "footer", about: "chi siamo", people: "persone",
  privacy: "privacy", cookies: "cookie", terms: "termini", sending: "invio", success: "conferma",
  close: "chiudi", open: "apri", menu: "menu", home: "homepage", image: "immagine", placeholder: "segnaposto",
  group: "gruppo", duration: "durata", price: "quota", flight: "volo", status: "stato", unavailable: "non disponibile",
  confirm: "conferma", interest: "interesse", application: "richiesta", review: "rivedi", step: "passaggio",
  solo: "da solo", select: "selezione", morning: "mattino", afternoon: "pomeriggio", evening: "sera",
  message: "messaggio", privacy: "privacy", email: "email", phone: "telefono", validation: "validazione",
  save: "salvataggio", local: "anteprima locale", generic: "generale", image: "immagine",
  all: "tutte", skip: "salta", to: "a", content: "contenuto", brand: "marchio", label: "etichetta",
  nav: "menu", retry: "riprova", motto: "frase", byline: "firma", instagram: "Instagram", logo: "logo",
  founders: "fondatori", hero: "copertina", answer: "risposta",
  breadcrumb: "percorso", confirm: "da confermare", section: "sezione", before: "prima", cta: "pulsante",
  full: "completo", closed: "chiuso", open: "aperto", no: "nessun", payment: "pagamento",
  unavailable: "non disponibile", riccardo: "Riccardo", ftima: "Ftima",
  quote: "citazione", closing: "chiusura", signup: "iscrizione", new: "nuova", tab: "scheda", return: "ritorno",
  page: "pagina", cookie: "cookie", not: "non", found: "trovata", faq: "FAQ",
  sent: "inviata", tail: "conclusione", lead: "inizio", list: "elenco",
};
const siteCopy = defineField({
  name: "siteCopy", title: "Altri testi del sito", type: "object",
  description: "Qui puoi modificare le etichette e i testi rimasti nelle pagine e nei moduli.",
  fieldsets: [
    ...copySections.map(([name, title]) => ({ name, title, options: { collapsible: true, collapsed: true } })),
    { name: "site", title: "Altri testi", options: { collapsible: true, collapsed: true } },
  ],
  fields: Object.keys(defaultSettings.siteCopy).map((name) => {
    const section = copySections.find(([prefix]) => name.startsWith(prefix));
    const prefix = section?.[0] || "";
    const rest = prefix ? name.slice(prefix.length) : name;
    const words = rest.replace(/([A-Z])/g, " $1").trim().split(/\s+/)
      .map((word) => copyWords[word.toLowerCase()] || word).join(" ");
    const title = (section ? section[1] + " — " : "Sito — ") + words;
    return defineField({ name, title, type: "text", rows: 2, fieldset: prefix || "site" });
  }),
});

const trip = defineType({
  name: "trip", title: "Viaggio", type: "document",
  description: "Solo contenuti pubblici del viaggio. Non inserire dati dei partecipanti.",
  groups: [
    { name: "intro", title: "Presentazione", default: true },
    { name: "details", title: "Informazioni pratiche" },
    { name: "program", title: "Programma" },
  ],
  initialValue: { status: "interest", order: 10, dateLabel: "Prossime date in arrivo", price: "Quota in definizione" },
  fields: [
    { ...stringField("title", "Nome del viaggio", true), group: "intro" },
    defineField({
      name: "slug", title: "Indirizzo della pagina", type: "slug", group: "intro",
      description: "Premi Generate. Evita di cambiarlo dopo la pubblicazione: è il link del viaggio.",
      options: { source: "title", maxLength: 80 },
      validation: (Rule) => Rule.required().custom((value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current)
        ? true : "Usa lettere minuscole, numeri e trattini."),
    }),
    { ...stringField("destination", "Paese / destinazione", true), group: "intro" },
    { ...stringField("headline", "Titolo della pagina"), group: "intro" },
    { ...textField("summary", "Breve presentazione nella scheda", true, 3), group: "intro" },
    defineField({
      name: "cover", title: "Fotografia di copertina", type: "image", group: "intro",
      options: { hotspot: true },
      fields: [stringField("alt", "Descrivi la fotografia per chi non può vederla", true)],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order", title: "Ordine nell’elenco", type: "number", group: "intro",
      description: "I numeri più piccoli vengono mostrati prima.",
      validation: (Rule) => Rule.integer().min(0),
    }),
    { ...stringField("dateLabel", "Date del viaggio", true), group: "details" },
    { ...stringField("duration", "Durata (es. 15 giorni)", true), group: "details" },
    { ...stringField("group", "Dimensione del gruppo", true), group: "details" },
    { ...stringField("price", "Quota (es. Da 1.900 €)", true), group: "details" },
    { ...stringField("flight", "Volo incluso o escluso", true), group: "details" },
    defineField({
      name: "status", title: "Richieste di partecipazione", type: "string", group: "details",
      options: { list: [
        { title: "Raccogli interesse — date in preparazione", value: "interest" },
        { title: "Richieste aperte", value: "open" },
        { title: "Gruppo completo", value: "full" },
        { title: "Richieste chiuse", value: "closed" },
      ] },
      validation: (Rule) => Rule.required(),
    }),
    { ...textField("description", "Racconto del viaggio", true, 10), group: "program" },
    defineField({
      name: "itinerary", title: "Tappe del programma", type: "array", group: "program",
      of: [defineArrayMember({
        name: "itineraryStep", title: "Tappa", type: "object",
        fields: [stringField("title", "Nome della tappa", true), textField("description", "Cosa faremo", true)],
        preview: { select: { title: "title", subtitle: "description" } },
      })],
    }),
    { ...textField("beforeBooking", "Informazioni prima di scegliere", false, 6), group: "program" },
  ],
  preview: {
    select: { title: "title", subtitle: "dateLabel", media: "cover" },
  },
});
const siteSettings = defineType({
  name: "siteSettings", title: "Testi del sito", type: "document",
  initialValue: initialSiteSettings,
  fields: [
    textField("homeTitle", "Titolo principale della homepage", false, 2),
    textField("homeIntro", "Presentazione della homepage", false, 3),
    stringField("homePrimaryCta", "Pulsante principale della homepage"),
    stringField("tripsTitle", "Titolo della sezione viaggi"),
    textField("foundersText", "Presentazione dei fondatori nella homepage", false, 6),
    defineField({ name: "contactEmail", title: "Email pubblica di contatto", type: "string", validation: (Rule) => Rule.email() }),
    textField("newsletterTitle", "Titolo della sezione newsletter", false, 2),
    textField("newsletterDescription", "Presentazione della newsletter", false, 3),
    stringField("visionCta", "Pulsante: modo di viaggiare"),
    stringField("storyCta", "Pulsante: chi siamo"),
    stringField("tripCardCta", "Pulsante nelle schede viaggio"),
    stringField("tripInterestCta", "Pulsante richiesta di interesse"),
    stringField("tripClosedCta", "Pulsante viaggio non disponibile"),
    stringField("closingCta", "Pulsante finale della pagina Chi siamo"),
    stringField("aboutIntro", "Sottotitolo della pagina Chi siamo"),
    textField("aboutText", "Testo della pagina Chi siamo", false, 12),
    defineField({
      name: "faq", title: "Domande frequenti", type: "array",
      description: "Aggiungi, riordina o rimuovi le domande mostrate nella homepage e nella pagina Domande.",
      of: [defineArrayMember({
        name: "faqItem", title: "Domanda", type: "object",
        fields: [
          stringField("question", "Domanda", true),
          textField("answer", "Risposta", true, 5),
        ],
        preview: { select: { title: "question", subtitle: "answer" } },
      })],
    }),
    siteCopy,
  ],
  preview: { prepare: () => ({ title: "Testi del sito Wānanga" }) },
});
export const schemaTypes = [trip, waitlistSchema, siteSettings];
