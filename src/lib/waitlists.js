export const WAITLIST_QUERY = `*[_type == "waitlist" && defined(slug.current)] | order(_createdAt desc) {
  _id, title, "slug": slug.current, headline, description, period, buttonLabel,
  status, "image": cover.asset->url, "imageAlt": cover.alt,
  "trip": trip->{_id, title, "slug": slug.current, status}
}`;

export const WAITLIST_PRIVACY_VERSION = "waiting-list-v1";
export const GENERAL_NEWSLETTER_CONSENT = "Iscrivendoti accetti di ricevere la newsletter Wānanga. Puoi cancellarti quando vuoi.";
export const NEWSLETTER_CONSENT = "Desidero ricevere anche la newsletter Wānanga con novità e racconti di tutti i viaggi. Potrò cancellarmi in qualsiasi momento (facoltativo).";
export const WAITLIST_CONSENT = "Chiedo di ricevere via email l’avviso di apertura di questo viaggio e ho letto l’informativa privacy.";
export const slugValid = (value) => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

export function waitlistPhase(item) {
  if (item.status === "closed") return "closed";
  if (item.status === "available") {
    return slugValid(item.trip?.slug) ? "available" : "unavailable";
  }
  return item.status === "collecting" ? "collecting" : "closed";
}

