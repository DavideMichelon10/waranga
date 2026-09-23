import { OpenWaitingListAction, DuplicateWaitingListAction } from "./waitlistActions.jsx";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes.js";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "v6jdx1wm";
export default defineConfig({
  name: "wananga",
  title: "Wānanga — Viaggi e contenuti",
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  plugins: [structureTool({
    structure: (S) => S.list().title("Gestisci il sito").items([
      S.documentTypeListItem("trip").title("Viaggi"),
      S.documentTypeListItem("waitlist").title("Liste d’attesa"),
      S.listItem().title("Testi del sito").child(
        S.document().schemaType("siteSettings").documentId("siteSettings").title("Testi del sito"),
      ),
    ]),
  })],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter((item) => item.schemaType !== "siteSettings"),
  },
  document: {
    newDocumentOptions: (options) => options.filter((item) => item.templateId !== "siteSettings"),
    actions: (actions, context) => context.schemaType === "siteSettings"
      ? actions.filter((item) => !["duplicate", "delete", "unpublish"].includes(item.action))
      : context.schemaType === "waitlist"
        ? [...actions.filter(item => item.action !== "duplicate"), OpenWaitingListAction, DuplicateWaitingListAction]
        : actions,
  },
});
