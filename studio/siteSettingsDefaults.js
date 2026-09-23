import { defaultSettings } from "../src/lib/content.js";

// Use the same copy as the website, including stable keys for Sanity array items.
export function initialSiteSettings() {
  return {
    ...defaultSettings,
    siteCopy: { ...defaultSettings.siteCopy },
    faq: defaultSettings.faq.map((item, index) => ({
      ...item, _type: "faqItem", _key: `faq-${index + 1}`,
    })),
  };
}

export function missingSiteSettings(document) {
  const defaults = initialSiteSettings();
  const set = {};
  const missingText = (value) => value == null || (typeof value === "string" && !value.trim());
  for (const [name, value] of Object.entries(defaults)) {
    if (typeof value === "string" && missingText(document[name])) set[name] = value;
  }
  // An explicitly empty list means the editor removed the questions intentionally.
  if (document.faq == null) set.faq = defaults.faq;
  if (document.siteCopy == null) {
    set.siteCopy = defaults.siteCopy;
  } else {
    for (const [name, value] of Object.entries(defaults.siteCopy)) {
      if (missingText(document.siteCopy[name])) set[`siteCopy.${name}`] = value;
    }
  }
  return set;
}
