import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { initialSiteSettings } from "../siteSettingsDefaults.js";
const monorepoContent = new URL("../../apps/web/src/lib/content.js", import.meta.url);
const { bali } = await import(existsSync(monorepoContent)
  ? monorepoContent.href : new URL("../../src/lib/content.js", import.meta.url).href);

// Prepared locally only: importing into an account is an explicit separate step.
const { image, imageAlt, ...trip } = bali;
await writeFile(new URL("../seed.ndjson", import.meta.url), [
  {
    ...trip, _id: "drafts.trip-bali", _type: "trip", order: 0,
    slug: { _type: "slug", current: "bali" },
    itinerary: trip.itinerary.map((step, i) => ({ ...step, _type: "itineraryStep", _key: "bali-" + i })),
  },
  { ...initialSiteSettings(), _id: "drafts.siteSettings", _type: "siteSettings" },
].map((doc) => JSON.stringify(doc)).join("\n") + "\n");
console.log("Bozze preparate in studio/seed.ndjson. Nessun dato inviato a Sanity.");
console.log("Dopo l’importazione carica la fotografia di Bali, verifica i contenuti e pubblica.");
