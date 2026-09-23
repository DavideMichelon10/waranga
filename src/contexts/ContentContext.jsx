import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { bali, defaultSettings, fetchContent } from "../lib/content";
import { SANITY_PROJECT_ID, SANITY_DATASET } from "../lib/integrations";

const ContentContext = createContext(null);
const projectId = (import.meta.env.VITE_SANITY_PROJECT_ID ?? SANITY_PROJECT_ID).trim();
const dataset = import.meta.env.VITE_SANITY_DATASET?.trim() || SANITY_DATASET;

export function ContentProvider({ children }) {
  const configured = Boolean(projectId);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    trips: configured ? [] : [bali], settings: defaultSettings, waitlists: [],
    status: configured ? "loading" : "ready",
  });
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    if (!configured) return;
    let disposed = false;
    let activeController;
    const refresh = async () => {
      if (activeController || document.visibilityState === "hidden") return;
      const controller = new AbortController();
      activeController = controller;
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const content = await fetchContent({
          projectId, dataset, signal: controller.signal,
          useLocalProxy: import.meta.env.DEV,
        });
        if (!disposed) setState({ ...content, status: "ready" });
      } catch {
        // Do not resurrect an unpublished/removed trip using local fallback.
        if (!disposed) setState((old) => ({ ...old, trips: [], status: "error" }));
      } finally {
        clearTimeout(timeout);
        activeController = undefined;
      }
    };
    setState((old) => ({ ...old, status: "loading" }));
    refresh();
    const interval = setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      disposed = true;
      activeController?.abort();
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [configured, attempt]);
  return <ContentContext.Provider value={{ ...state, configured, retry }}>{children}</ContentContext.Provider>;
}

export function useContent() { return useContext(ContentContext); }
