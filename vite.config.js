import { localApi } from "./server/vite-api.js";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { SANITY_PROJECT_ID } from "./src/lib/integrations.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const projectId = (env.VITE_SANITY_PROJECT_ID ?? SANITY_PROJECT_ID).trim();
  return {
    plugins: [react(), localApi()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    // Local preview reads public Sanity content without requiring localhost CORS.
    server: {
      proxy: /^[a-z0-9]+$/.test(projectId) ? {
        "/__sanity/v2025-02-19/data/query/": {
          target: `https://${projectId}.api.sanity.io`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__sanity/, ""),
          configure(proxy) {
            proxy.on("proxyReq", (request) => {
              for (const header of ["origin", "referer", "cookie", "authorization"]) {
                request.removeHeader(header);
              }
            });
          },
        },
      } : {},
    },
    build: { outDir: "dist" },
  };
});
