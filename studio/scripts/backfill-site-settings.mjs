import { getCliClient } from "sanity/cli";
import { initialSiteSettings, missingSiteSettings } from "../siteSettingsDefaults.js";

const client = getCliClient({ apiVersion: "2025-02-19" }).withConfig({ useCdn: false });
if (client.config().projectId !== "v6jdx1wm" || client.config().dataset !== "production") {
  throw new Error("Questo aggiornamento è riservato a v6jdx1wm / production.");
}
const apply = process.argv.includes("--apply");
const [published, draft] = await client.getDocuments(["siteSettings", "drafts.siteSettings"]);
const source = draft || published;
const set = source ? missingSiteSettings(source) : initialSiteSettings();
const paths = Object.keys(set);
console.log(`Testi del sito: pubblicato ${Boolean(published)}, bozza ${Boolean(draft)}.`);
console.log(`Campi da compilare: ${paths.length}. ${paths.join(", ")}`);
if (!paths.length) {
  console.log("Tutti i testi sono già presenti. Nessuna modifica.");
} else if (!apply) {
  console.log("Anteprima: nessuna modifica. Aggiungi --apply per compilare la bozza.");
} else {
  let transaction = client.transaction();
  if (draft) {
    // Abort if an editor changed the document since we read it.
    transaction = transaction.patch(draft._id, (patch) => patch.ifRevisionId(draft._rev).set(set));
  } else {
    const { _id, _rev, _createdAt, _updatedAt, ...content } = published || {};
    // create (not replace) fails safely if another editor creates a draft meanwhile.
    transaction = transaction.create({ ...content, _id: "drafts.siteSettings", _type: "siteSettings" });
    transaction = transaction.patch("drafts.siteSettings", (patch) => patch.set(set));
  }
  await transaction.commit();
  console.log("Bozza compilata con i testi esistenti del sito. Nessun contenuto pubblicato o testo personalizzato sovrascritto.");
}
