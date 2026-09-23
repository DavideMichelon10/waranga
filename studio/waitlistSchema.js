import { defineField, defineType } from "sanity";

export const waitlistSchema = defineType({
  name: "waitlist", title: "Lista d’attesa", type: "document",
  description: "Una pagina per ogni partenza. Qui gestisci i contenuti pubblici; le email degli iscritti restano in Reach.",
  initialValue: { status: "collecting", buttonLabel: "Avvisami quando si parte" },
  groups: [
    { name: "page", title: "Pagina social", default: true },
    { name: "launch", title: "Apertura del viaggio" },
  ],
  fields: [
    defineField({ name: "title", title: "Nome della partenza", type: "string", group: "page", description: "Es. Bali · primavera 2027. Crea una nuova lista per ogni partenza.", validation: R => R.required().max(100) }),
    defineField({ name: "slug", title: "Link da condividere", type: "slug", group: "page", description: "La pagina sarà /waiting-list/indirizzo. Mantieni lo stesso indirizzo dopo averlo condiviso.", options: { source: "title", maxLength: 80 }, validation: R => R.required().custom(value => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) ? true : "Usa lettere minuscole, numeri e trattini.") }),
    defineField({ name: "headline", title: "Titolo della pagina", type: "string", group: "page", validation: R => R.required().max(160) }),
    defineField({ name: "description", title: "Presentazione", type: "text", rows: 7, group: "page", validation: R => R.required().max(5000) }),
    defineField({ name: "period", title: "Periodo o breve anticipazione", type: "string", group: "page", validation: R => R.max(160) }),
    defineField({ name: "cover", title: "Fotografia", type: "image", group: "page", options: { hotspot: true }, fields: [{ name: "alt", title: "Descrizione della foto", type: "string", validation: R => R.required() }], validation: R => R.required() }),
    defineField({ name: "buttonLabel", title: "Testo del pulsante", type: "string", group: "page", validation: R => R.required().max(70) }),
    defineField({ name: "status", title: "Stato della pagina", type: "string", group: "launch", options: { list: [
      { title: "Raccogli iscrizioni", value: "collecting" },
      { title: "Viaggio disponibile: mostra il programma", value: "available" },
      { title: "Lista chiusa", value: "closed" },
    ] }, validation: R => R.required() }),
    defineField({ name: "trip", title: "Viaggio definitivo", type: "reference", to: [{ type: "trip" }], weak: true, group: "launch", description: "Puoi collegare un viaggio ancora in bozza. Prima di aprirlo al pubblico devi pubblicare il viaggio completo.", validation: R => R.custom(async (value, context) => {
      if (context.document?.status !== "available") return true;
      if (!value?._ref) return "Collega il viaggio prima di aprire la pagina.";
      const id = value._ref.replace(/^drafts\./, "");
      const exists = await context.getClient({ apiVersion: "2025-02-19" }).fetch('count(*[_id == $id && _type == "trip" && defined(slug.current)])', { id }, { perspective: "published" });
      return exists > 0 || "Pubblica il viaggio completo prima di impostarlo come disponibile.";
    }) }),

  ],
  preview: { select: { title: "title", status: "status", media: "cover" }, prepare: ({ title, status, media }) => ({ title, subtitle: { collecting: "Raccolta iscrizioni", available: "Viaggio disponibile", closed: "Lista chiusa" }[status], media }) },
});
