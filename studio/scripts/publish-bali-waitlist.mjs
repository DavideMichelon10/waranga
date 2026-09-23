import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false, perspective: 'raw' });
if (client.config().projectId !== 'v6jdx1wm' || client.config().dataset !== 'production') throw Error('Progetto inatteso.');
const id = 'waitlist-bali-prossima-partenza';
const [published, draft] = await client.getDocuments([id, `drafts.${id}`]);
const source = draft || published;
if (!source || source._type !== 'waitlist') throw Error('Lista Bali assente.');
if (!source.slug?.current || !source.cover?.asset?._ref || !source.headline || !source.description) throw Error('Lista Bali incompleta.');
const fields = ['emailSubject', 'emailBody', 'emailButtonLabel', 'campaignRequestId', 'campaignStatus', 'campaignUuid', 'campaignAudience', 'campaignMessage'];
const clean = await client.patch(source._id).ifRevisionId(source._rev).unset(fields).commit();
if (draft) {
  await client.action({
    actionType: 'sanity.action.document.publish',
    draftId: draft._id, publishedId: id, ifDraftRevisionId: clean._rev,
    ...(published ? { ifPublishedRevisionId: published._rev } : {}),
  });
}
const result = await client.getDocument(id);
console.log(JSON.stringify({ status: 'published', id: result._id, title: result.title, slug: result.slug.current, collectionStatus: result.status }));
