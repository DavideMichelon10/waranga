// Public editorial content only. Never store subscribers or applications here.
export const CONTENT_QUERY = `{
  "trips": *[_type == "trip" && defined(slug.current)] | order(order asc, title asc) {
    _id, title, "slug": slug.current, destination, headline, summary,
    dateLabel, duration, group, price, flight, description, beforeBooking,
    status, itinerary[]{_key, title, description},
    "image": cover.asset->url, "imageAlt": cover.alt
  },
  "settings": *[_type == "siteSettings" && _id == "siteSettings"][0] {
    homeTitle, homeIntro, homePrimaryCta, tripsTitle, foundersText,
    contactEmail, newsletterTitle, newsletterDescription, visionCta,
    storyCta, tripCardCta, tripInterestCta, tripClosedCta, closingCta,
    aboutIntro, aboutText, faq[]{_key, question, answer}, siteCopy { ... }
  }
}`;

export const defaultSettings = {
  homeTitle: "Il mondo,\ncon calma.",
  homeIntro: "Viaggi in piccoli gruppi con Riccardo e Ftima.\nTempo per scoprire, condividere, ritrovarsi.",
  homePrimaryCta: "Scopri il primo viaggio",
  tripsTitle: "I nostri viaggi.",
  foundersText: "Scriviamo e viaggiamo. Wānanga nasce dal desiderio di condividere i luoghi che amiamo e il nostro modo di viverli.",
  contactEmail: "ciao@wananga.travel",
  newsletterTitle: "Ti scriviamo\nquando si parte.",
  newsletterDescription: "Novità sui viaggi e racconti da condividere. Iscriviti per riceverli via email.",
  visionCta: "Scopri il nostro modo di viaggiare",
  storyCta: "Scopri chi siamo",
  tripCardCta: "Scopri il viaggio",
  tripInterestCta: "Mi interessa questo viaggio",
  tripClosedCta: "Avvisami delle prossime partenze",
  closingCta: "Scopri i viaggi",
  aboutIntro: "Il nostro modo di viaggiare",
  aboutText: "A settembre 2022 abbiamo lasciato l’Italia con un biglietto di sola andata per l’Asia. Abbiamo lasciato il nostro appartamento in affitto e venduto le nostre auto.\n\nQuel primo anno ha dato il via alla nostra vita da nomadi digitali e da allora non abbiamo più smesso davvero di partire. Negli ultimi quattro anni abbiamo attraversato più di 34 Paesi, facendo base tra l’Italia e soprattutto l’Asia.\n\nCi sono luoghi nei quali siamo passati e altri nei quali, invece, abbiamo vissuto a lungo. Bali e la Thailandia, per esempio, sono diventate per noi qualcosa di molto diverso da una destinazione sulla mappa.\n\nSono diventate casa.\n\nWananga nasce da qui.",
  faq: [
    { question: "Posso partire anche da solo o da sola?", answer: "Sì. Puoi partire senza conoscere nessuno. Il piccolo gruppo lascia spazio per conoscersi, condividere le giornate e trovare anche i propri momenti di autonomia." },
    { question: "Che cosa rende diverso un viaggio Wānanga?", answer: "Il tempo che scegliamo di dedicare ai luoghi e alle persone. Il progetto nasce dal modo di viaggiare di Riccardo e Ftima: esplorare, conoscere e lasciare spazio anche a sé stessi. Il programma di ogni partenza racconta come questo si traduce nelle giornate." },
    { question: "Il volo è incluso?", answer: "Il volo internazionale non è incluso. Prima di confermare la partecipazione riceverai i dettagli del punto di incontro e delle date, per organizzare il viaggio dalla città che preferisci." },
    { question: "Sono già disponibili date e prezzi?", answer: "Stiamo definendo la prossima partenza per Bali. Puoi lasciarci una richiesta di interesse: ti ricontatteremo con date, quota, sistemazioni e condizioni prima di qualsiasi conferma." },
    { question: "La richiesta mi impegna a prenotare?", answer: "No. È il primo passo per conoscerci e ricevere le informazioni. Inviare il modulo non riserva un posto e non richiede alcun pagamento." },
    { question: "Come sono organizzate le camere?", answer: "Le sistemazioni e le modalità di condivisione saranno indicate nel programma definitivo. Raccontaci eventuali preferenze quando ci sentiamo, così potremo verificarle insieme." },
  ],
  siteCopy: {
    brandName: "WĀNANGA", logoAlt: "Wānanga — viaggi, persone, vita", brandLabel: "Wānanga, homepage", skipToContent: "Vai al contenuto", menuLabel: "Menu principale", menuOpen: "Apri menu", menuClose: "Chiudi menu",
    navTrips: "I viaggi", navAbout: "Chi siamo", navQuestions: "Domande", navCta: "Parti con noi",
    footerContactTitle: "Ci trovi qui", footerContact: "Scrivici", footerAboutTitle: "Conosciamoci meglio",
    footerStory: "La nostra storia", footerQuestions: "Le tue domande", footerNewsletter: "Newsletter",
    footerMotto: "Il mondo è grande.\nFacciamogli spazio.", footerRights: "Wānanga", footerByline: "Con Riccardo e Ftima",
    footerPrivacy: "Privacy", footerCookies: "Cookie", footerTerms: "Termini e condizioni", instagram: "Instagram",
    cmsLoading: "Stiamo caricando i viaggi…", cmsError: "Non riusciamo a mostrare i viaggi in questo momento.", cmsRetry: "Riprova",
    tripEmpty: "Stiamo preparando i prossimi viaggi.", tripEmptyCta: "Ricevi le novità", tripsPageTitle: "I nostri viaggi.",
    tripsMetaDescription: "Scopri i viaggi Wānanga: luoghi, programmi e prossime partenze.",
    homeMetaTitle: "Il mondo, con calma", homeHeroAlt: "Le onde dell’oceano incontrano la costa verde di Kelingking, a Bali",
    homeVisionTitle: "Un viaggio è anche\ntempo per te.",
    homeVisionText: "Ci piace conoscere un luogo senza correre da una tappa all’altra. Stare insieme, ma lasciare spazio anche a una passeggiata da soli. È così che immaginiamo ogni Wānanga.",
    homeFoundersTitle: "Siamo Riccardo\ne Ftima.", homeFoundersAlt: "Riccardo e Ftima sulla spiaggia al tramonto",
    homeQuestionsTitle: "Ti stai chiedendo…", homeAllQuestions: "Leggi tutte le risposte",
    tripBreadcrumb: "Wānanga / I viaggi", tripDuration: "Durata", tripGroup: "Il gruppo", tripPrice: "La quota", tripFlight: "Il volo",
    tripConfirm: "Da confermare", tripSectionTitle: "Il viaggio.", tripBeforeTitle: "Prima di scegliere.",
    tripStatusInterest: "Stiamo preparando la partenza", tripStatusOpen: "Richieste aperte", tripStatusFull: "Gruppo al completo", tripStatusClosed: "Richieste chiuse",
    tripCtaTitle: "Partiamo insieme?", tripInterestText: "Lascia una richiesta di interesse. Ti ricontatteremo per conoscerci e raccontarti i prossimi passi.",
    tripNoPayment: "Nessun pagamento. Nessun posto prenotato.", tripUnavailableText: "Al momento non raccogliamo richieste per questo viaggio.",
    tripContact: "Hai una domanda? Scrivici", tripImagePlaceholder: "Wānanga",
    homeMetaDescription: "Viaggi in piccoli gruppi con Riccardo e Ftima. Tempo per i luoghi, per gli altri e per te. Scopri il progetto Wānanga e il viaggio a Bali.",
    aboutMetaTitle: "Chi siamo", aboutMetaDescription: "La visione di Wānanga e la storia dei fondatori Riccardo Bertoldi e Ftima. Piccoli gruppi, curiosità e tempo per vivere i luoghi.", aboutTitle: "Chi siamo.\nWananga nasce da qui.", aboutImageAlt: "Riccardo e Ftima davanti al mare",
    aboutStoryTitle: "Partire è solo l’inizio.",
    aboutStory1: "Abbiamo scelto una vita fatta di parole e di partenze. Viaggiando, abbiamo imparato che i ricordi più belli spesso arrivano quando smettiamo di riempire ogni momento.",
    aboutStory2: "Per questo pensiamo a piccoli gruppi, a luoghi da conoscere con rispetto e a giornate che lascino respiro. Si può stare insieme senza dover fare tutto insieme. Si può partire da soli e trovare persone con cui sentirsi a proprio agio.",
    aboutQuote: "Il tempo per un luogo.\nIl tempo per gli altri.\nIl tempo per te.",
    aboutStory3: "La nostra idea di viaggio prende forma nel programma: nelle soste, negli incontri, nei momenti liberi. Ogni proposta deve raccontarti chiaramente che cosa aspettarti, prima di partire.",
    aboutPeopleTitle: "Le persone dietro Wānanga.", aboutRiccardoName: "Riccardo Bertoldi", aboutRiccardoRole: "Scrittore e viaggiatore",
    aboutRiccardoText: "Le storie mi accompagnano ovunque. Nei viaggi cerco prospettive nuove, persone da ascoltare e il tempo per farmi domande.",
    aboutFtimaName: "Ftima", aboutFtimaRole: "Scrittrice e viaggiatrice",
    aboutFtimaText: "Mi piacciono le parole che avvicinano e i luoghi in cui ci si sente accolti. Vorrei portare questo stesso spazio di ascolto in ogni viaggio.",
    aboutClosingTitle: "Partiamo insieme.",
    newsletterMetaTitle: "Newsletter", newsletterSignup: "Iscriviti alla newsletter Wānanga. Puoi cancellare l’iscrizione in qualsiasi momento.",
    newsletterButton: "Iscriviti alla newsletter", newsletterNewTab: "Si apre il nostro modulo di iscrizione in una nuova scheda.",
    newsletterUnavailable: "Le iscrizioni alla newsletter apriranno presto. Torna a trovarci per le prossime novità.",
    newsletterPageTitle: "Newsletter",
    formSuccessTitle: "La tua richiesta è arrivata.", formSuccessText: "Grazie per averci scritto. Ti ricontatteremo ai recapiti che hai lasciato.",
    formSuccessApplication: "Non è una prenotazione: definiremo insieme i prossimi passi.",
    formName: "Nome", formFullName: "e cognome", formNameApplicationPlaceholder: "Come ti chiami?", formNamePlaceholder: "Il tuo nome",
    formEmail: "Email", formEmailPlaceholder: "La tua email", formPhone: "Telefono", formPhonePlaceholder: "Per conoscerci con una telefonata",
    formPeople: "Quante persone?", formSelect: "Seleziona", formSolo: "Parto da solo/a", formPeopleSuffix: "persone",
    formContactTime: "Quando possiamo sentirci?", formMorning: "Al mattino", formAfternoon: "Nel pomeriggio", formEvening: "La sera",
    formMotivation: "Che cosa cerchi in questo viaggio?", formMotivationPlaceholder: "Bastano poche parole. Ci aiutano a conoscerti.",
    formMessage: "Il tuo messaggio", formMessagePlaceholder: "Come possiamo aiutarti?", formPrivacyLead: "Ho letto l’",
    formPrivacyLink: "informativa privacy", formPrivacyTail: "e acconsento al trattamento dei dati per questa richiesta.",
    formNewsletterNote: "Vuoi ricevere anche le novità?", formNewsletterLink: "Iscriviti alla newsletter",
    formValidationError: "Controlla i campi del modulo e riprova.", formSaveError: "Non siamo riusciti a salvare la richiesta. I tuoi dati sono ancora qui: riprova tra poco.",
    formSending: "Invio in corso", formApplicationSubmit: "Invia la richiesta", formContactSubmit: "Invia il messaggio",
    formApplicationNote: "Invii una richiesta di interesse per Bali. Non prenoti un posto e non è richiesto un pagamento.",
    formLocalNote: "Anteprima locale: usa dati di prova. Gli invii restano nel database di test su questo computer.",
    applicationMetaTitle: "Parti con noi", applicationMetaDescription: "Invia una richiesta di interesse per il viaggio Wānanga a Bali. Il primo passo è conoscerci: nessun pagamento e nessuna prenotazione automatica.", applicationKicker: "Il primo passo è conoscerci", applicationTitle: "Il tuo viaggio\ninizia da qui.",
    applicationIntro: "Ti incuriosisce Bali? Raccontaci qualcosa di te.",
    applicationDescription: "Ti ricontatteremo per parlare del viaggio, delle prossime date e delle tue domande. Senza impegno.",
    applicationReview: "Rivedi il viaggio", applicationStep1: "Ci lasci la tua richiesta.", applicationStep2: "Ci sentiamo per conoscerci.",
    applicationStep3: "Decidi con tutte le informazioni.", applicationFormTitle: "Piacere di conoscerti.", applicationFormNote: "I campi del modulo sono richiesti.",
    contactMetaTitle: "Scrivici", contactMetaDescription: "Contatta Wānanga per informazioni sul viaggio a Bali e sulle prossime partenze.", contactKicker: "Parliamone", contactTitle: "Ogni viaggio parte\nda una domanda.",
    contactIntro: "Siamo qui per la tua.", contactFormTitle: "Scrivi a Wānanga.", contactMessageDefault: "Vorrei informazioni sul viaggio ",
    questionsMetaTitle: "Le tue domande", questionsMetaDescription: "Le risposte su viaggi Wānanga, voli, camere, prossime partenze e richieste di partecipazione.", questionsKicker: "Facciamo chiarezza", questionsTitle: "Prima di partire.",
    questionsIntro: "Le informazioni utili per capire se questo viaggio fa per te.", questionsClosingTitle: "Ti è rimasto un dubbio?", questionsContact: "Scrivici",
    legalMetaTitle: "Informazioni del sito", legalTitle: "Informazioni del sito.",
    legalText1: "I documenti privacy, cookie e le condizioni di viaggio non erano presenti nell’export. Devono essere inseriti e verificati prima di pubblicare questa versione e raccogliere dati reali.",
    legalText2: "Questa anteprima serve a valutare il sito. Per informazioni puoi scrivere a ciao@wananga.travel.",
    notFoundMetaTitle: "Pagina non trovata", notFoundKicker: "Fuori itinerario", notFoundTitle: "Qui il sentiero\nsi interrompe.",
    notFoundText: "La pagina che cerchi non esiste o ha cambiato indirizzo.", returnHome: "Torna alla home",
    privacy: "Privacy", cookies: "Cookie", terms: "Termini e condizioni", genericDescription: "Viaggi in piccoli gruppi con Riccardo e Ftima. Tempo per i luoghi, per gli altri e per te.",
  },
};

export const bali = {
  _id: "trip-bali", title: "Bali", slug: "bali", destination: "Indonesia",
  headline: "Bali, con il tempo di viverla.",
  summary: "Quindici giorni tra villaggi, risaie e oceano. Con Riccardo e Ftima, in un gruppo di massimo 12 persone.",
  dateLabel: "Prossime date in arrivo", duration: "15 giorni",
  group: "Fino a 12 viaggiatori", price: "Quota in definizione",
  flight: "Internazionale escluso", status: "interest",
  image: "/images/nusa-penida.webp", imageAlt: "Le scogliere e il mare di Nusa Penida, Bali",
  description: "Conoscere Bali significa anche rallentare. Fermarsi in un villaggio, seguire il ritmo delle giornate, lasciare che una conversazione cambi i programmi.\n\nIl percorso proposto attraversa Canggu, Ubud, Sidemen e Nusa Penida. Stiamo definendo la prossima partenza: tappe, attività e sistemazioni saranno confermate nel programma completo.",
  beforeBooking: "Ti invieremo quota, date, alloggi, spostamenti, attività incluse ed eventuali spese extra prima di chiederti una conferma. Il volo internazionale è escluso. Puoi già raccontarci il tuo interesse senza prenotare.",
  itinerary: [
    { title: "Canggu", description: "Arrivare, incontrarsi, prendere il ritmo dell’isola." },
    { title: "Ubud", description: "Risaie, templi e la vita quotidiana di Bali." },
    { title: "Sidemen", description: "Villaggi e paesaggi da attraversare con calma." },
    { title: "Nusa Penida", description: "L’oceano, le scogliere e il tempo per fermarsi." },
  ],
};

export function httpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch { return ""; }
}

export function queryUrl(projectId, dataset) {
  if (!/^[a-z0-9]+$/.test(projectId) || !/^[a-z0-9_-]+$/.test(dataset)) {
    throw new Error("Configurazione Sanity non valida");
  }
  const url = new URL("https://" + projectId + ".api.sanity.io/v2025-02-19/data/query/" + dataset);
  url.searchParams.set("query", CONTENT_QUERY);
  url.searchParams.set("perspective", "published");
  return url.href;
}

export function normalizeContent(result) {
  if (!result || !Array.isArray(result.trips)) throw new Error("Risposta Sanity non valida");
  const seen = new Set();
  const trips = result.trips.filter((trip) => {
    if (!trip || typeof trip.title !== "string" || !trip.title.trim() ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trip.slug) || seen.has(trip.slug)) return false;
    seen.add(trip.slug);
    return true;
  }).map((trip) => ({
    ...trip,
    image: httpsUrl(trip.image),
    status: ["interest", "open", "full", "closed"].includes(trip.status) ? trip.status : "closed",
    itinerary: Array.isArray(trip.itinerary) ? trip.itinerary.filter((item) => item?.title) : [],
  }));
  const settings = {
    ...defaultSettings,
    faq: [...defaultSettings.faq],
    siteCopy: { ...defaultSettings.siteCopy },
  };
  for (const key of Object.keys(defaultSettings)) {
    if (typeof result.settings?.[key] === "string" && result.settings[key].trim()) {
      settings[key] = result.settings[key];
    }
  }
  if (Array.isArray(result.settings?.faq)) {
    settings.faq = result.settings.faq
      .filter((item) => typeof item?.question === "string" && item.question.trim() && typeof item?.answer === "string" && item.answer.trim())
      .map((item) => ({ question: item.question.trim(), answer: item.answer.trim() }));
  }
  if (result.settings?.siteCopy && typeof result.settings.siteCopy === "object") {
    for (const key of Object.keys(defaultSettings.siteCopy)) {
      if (typeof result.settings.siteCopy[key] === "string" && result.settings.siteCopy[key].trim()) {
        settings.siteCopy[key] = result.settings.siteCopy[key];
      }
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contactEmail)) {
    settings.contactEmail = defaultSettings.contactEmail;
  }
  return { trips, settings };
}

export async function fetchContent({ projectId, dataset, signal, fetcher = fetch }) {
  const response = await fetcher(queryUrl(projectId, dataset), {
    signal, credentials: "omit", cache: "no-store",
  });
  if (!response.ok) throw new Error("Sanity HTTP " + response.status);
  const body = await response.json();
  if (body.error) throw new Error("Errore nella query Sanity");
  return normalizeContent(body.result);
}

export function tripRequestPath(trip) {
  // Horizons' candidature collection accepts only a fixed set of travel names.
  // New CMS trips use the contact form, preserving the requested destination.
  return trip.slug === "bali" ? "/candidatura-bali" : "/contattaci?viaggio=" + encodeURIComponent(trip.title);
}

export function acceptsRequests(trip) {
  return Boolean(trip && ["interest", "open"].includes(trip.status));
}
