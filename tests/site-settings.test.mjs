import test from "node:test";
import assert from "node:assert/strict";
import { defaultSettings, normalizeContent } from "../src/lib/content.js";
import { initialSiteSettings, missingSiteSettings } from "../studio/siteSettingsDefaults.js";

test("initial editor values match every website fallback, with valid FAQ keys", () => {
  const initial = initialSiteSettings();
  assert.deepEqual(normalizeContent({ trips: [], settings: initial }).settings, defaultSettings);
  assert.equal(new Set(initial.faq.map((item) => item._key)).size, initial.faq.length);
  assert.ok(initial.faq.every((item) => item._type === "faqItem" && item._key));
  initial.siteCopy.navTrips = "changed";
  initial.faq[0].question = "changed";
  assert.notEqual(initialSiteSettings().siteCopy.navTrips, "changed");
  assert.notEqual(initialSiteSettings().faq[0].question, "changed");
});

test("backfill preserves editorial text, questions and intentionally empty lists", () => {
  const document = {
    homeTitle: "Titolo personalizzato", homeIntro: "  ",
    siteCopy: { navTrips: "Partenze", questionsTitle: "" },
    faq: [{ _key: "custom", question: "Domanda?", answer: "Risposta." }],
  };
  const set = missingSiteSettings(document);
  assert.equal(set.homeTitle, undefined);
  assert.equal(set.homeIntro, defaultSettings.homeIntro);
  assert.equal(set["siteCopy.navTrips"], undefined);
  assert.equal(set["siteCopy.questionsTitle"], defaultSettings.siteCopy.questionsTitle);
  assert.equal(set.faq, undefined);
  assert.equal(missingSiteSettings({ faq: [] }).faq, undefined);
  assert.deepEqual(missingSiteSettings({ faq: null }).faq, initialSiteSettings().faq);
});

test("backfill fills legacy documents and is idempotent", () => {
  const legacy = { homeTitle: "Il titolo già salvato" };
  const complete = { ...legacy, ...missingSiteSettings(legacy) };
  assert.equal(complete.homeTitle, legacy.homeTitle);
  assert.equal(complete.faq.length, defaultSettings.faq.length);
  assert.deepEqual(missingSiteSettings(complete), {});
  assert.deepEqual(missingSiteSettings(initialSiteSettings()), {});
});
