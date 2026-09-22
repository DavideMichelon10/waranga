import { createReadStream, existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-02-19" });
if (client.config().projectId !== "v6jdx1wm" || client.config().dataset !== "production") {
  throw new Error("Questo import iniziale è riservato a v6jdx1wm / production.");
}
const ids = ["trip-bali", "drafts.trip-bali", "siteSettings", "drafts.siteSettings"];
const existing = await client.getDocuments(ids);
const drafts = (await readFile(new URL("../seed.ndjson", import.meta.url), "utf8"))
  .trim().split("\n").map((line) => JSON.parse(line));
let transaction = client.transaction();
let count = 0;
if (!existing[0] && !existing[1]) {
  const localImage = new URL("../../apps/web/public/images/nusa-penida.webp", import.meta.url);
  const file = existsSync(localImage) ? localImage : new URL("../../public/images/nusa-penida.webp", import.meta.url);
  const asset = await client.assets.upload("image", createReadStream(fileURLToPath(file)), {
    filename: "wananga-bali-nusa-penida.webp",
  });
  const doc = drafts.find((item) => item._id === "drafts.trip-bali");
  doc.cover = {
    _type: "image", asset: { _type: "reference", _ref: asset._id },
    alt: "Le scogliere e il mare di Nusa Penida, Bali",
  };
  transaction = transaction.createIfNotExists(doc);
  count += 1;
}
if (!existing[2] && !existing[3]) {
  transaction = transaction.createIfNotExists(drafts.find((item) => item._id === "drafts.siteSettings"));
  count += 1;
}
if (count) await transaction.commit();
console.log("Bozze iniziali create: " + count + ". Nessun documento esistente sovrascritto o pubblicato.");
