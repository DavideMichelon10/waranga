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
    aboutIntro, aboutText
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
  const settings = { ...defaultSettings };
  for (const key of Object.keys(defaultSettings)) {
    if (typeof result.settings?.[key] === "string" && result.settings[key].trim()) {
      settings[key] = result.settings[key];
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
