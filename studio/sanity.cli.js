import { defineCliConfig } from "sanity/cli";
export default defineCliConfig({
  deployment: { appId: "gjc500t7d3f971slb5i62f9r" },
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || "v6jdx1wm",
    dataset: process.env.SANITY_STUDIO_DATASET || "production",
  },
});
