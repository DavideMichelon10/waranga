import { defineArrayMember, defineField, defineType } from "sanity";

const textField = (name, title, required = false, rows = 4) => defineField({
  name, title, type: "text", rows,
  validation: (Rule) => required ? Rule.required() : Rule,
});
const stringField = (name, title, required = false) => defineField({
  name, title, type: "string",
  validation: (Rule) => required ? Rule.required() : Rule,
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
  fields: [
    textField("homeTitle", "Titolo principale della homepage", false, 2),
    textField("homeIntro", "Presentazione della homepage", false, 3),
    stringField("tripsTitle", "Titolo della sezione viaggi"),
    textField("foundersText", "Presentazione dei fondatori nella homepage", false, 6),
    defineField({ name: "contactEmail", title: "Email pubblica di contatto", type: "string", validation: (Rule) => Rule.email() }),
    textField("newsletterTitle", "Titolo della sezione newsletter", false, 2),
    textField("newsletterDescription", "Presentazione della newsletter", false, 3),
  ],
  preview: { prepare: () => ({ title: "Testi del sito Wānanga" }) },
});
export const schemaTypes = [trip, siteSettings];
