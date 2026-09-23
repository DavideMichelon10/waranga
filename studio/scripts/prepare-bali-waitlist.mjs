import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false, perspective: 'raw' });
if (client.config().projectId !== 'v6jdx1wm' || client.config().dataset !== 'production') {
  throw new Error('Operazione riservata al progetto Wānanga v6jdx1wm / production.');
}
const id = 'waitlist-bali-prossima-partenza';
const slug = 'bali-prossima-partenza';
const existing = await client.fetch('*[_type == "waitlist" && (_id in $ids || slug.current == $slug || title match "Bali*")]{_id,title,slug}', {
  ids: [id, `drafts.${id}`], slug,
});
if (existing.length) {
  console.log(JSON.stringify({ status: 'already_exists', documents: existing }, null, 2));
} else {
  const trip = await client.getDocument('trip-bali');
  if (trip?._type !== 'trip' || !trip.cover?.asset?._ref) throw new Error('Viaggio Bali o fotografia non disponibili.');
  const draft = {
    _id: `drafts.${id}`,
    _type: 'waitlist',
    title: 'Bali · prossima partenza',
    slug: { _type: 'slug', current: slug },
    headline: 'Bali, con il tempo di viverla.',
    description: 'Quindici giorni tra villaggi, risaie e oceano. Con Riccardo e Ftima, in un piccolo gruppo, per conoscere Bali lasciando spazio agli incontri e al ritmo dei luoghi.\n\nStiamo preparando la prossima partenza: da Canggu a Ubud, tra il verde di Sidemen e il mare di Nusa Penida. Date, tappe e dettagli saranno confermati nel programma completo.\n\nLasciaci la tua email: ti scriveremo quando il viaggio sarà pronto, con il programma e tutte le informazioni per partecipare. Iscriverti alla lista non prenota un posto e non comporta alcun impegno.',
    period: 'Prossime date in arrivo',
    cover: { ...trip.cover, alt: trip.cover.alt || 'Le scogliere e il mare di Nusa Penida, Bali' },
    buttonLabel: 'Avvisami quando si parte',
    status: 'collecting',
    trip: { _type: 'reference', _ref: trip._id, _weak: true },

  };
  if (process.argv.includes('--apply')) {
    const created = await client.create(draft);
    console.log(JSON.stringify({ status: 'draft_created', _id: created._id, title: created.title, slug: created.slug.current, fields: Object.keys(created) }, null, 2));
  } else {
    console.log(JSON.stringify({ status: 'preview', document: draft }, null, 2));
  }
}
