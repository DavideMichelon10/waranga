import { useState } from "react";
import { useClient } from "sanity";

const origin = process.env.SANITY_STUDIO_SITE_URL || "http://localhost:4173";

export function OpenWaitingListAction(props) {
  const doc = props.published;
  return { label: "Apri pagina social", disabled: !doc?.slug?.current,
    onHandle() { window.open(`${origin}/waiting-list/${encodeURIComponent(doc.slug.current)}`, "_blank", "noopener,noreferrer"); props.onComplete(); } };
}

export function DuplicateWaitingListAction(props) {
  const client = useClient({ apiVersion: "2025-02-19" });
  const [busy, setBusy] = useState(false);
  return { label: "Duplica per un nuovo viaggio", disabled: busy,
    async onHandle() {
      setBusy(true);
      try {
        const source = props.draft || props.published;
        const copy = Object.fromEntries(["headline", "description", "period", "cover", "buttonLabel"].filter(key => source[key] !== undefined).map(key => [key, source[key]]));
        await client.create({ ...copy, _id: `drafts.${crypto.randomUUID()}`, _type: "waitlist", title: `${source.title || "Viaggio"} — nuova partenza`, status: "collecting" });
        props.onComplete();
      } catch { window.alert("Non è stato possibile duplicare la pagina. Riprova."); }
      finally { setBusy(false); }
    },
  };
}
