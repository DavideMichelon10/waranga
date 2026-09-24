import { createBrevoApi, dealAttributes } from '../server/brevo.js';

// Run locally: node --env-file=.env.hostinger scripts/setup-brevo.mjs
// Only provisions readable deal attributes. No emails, campaigns or imports.
const api = createBrevoApi();
try {
  const account = await api('/account');
  const pipelines = await api('/crm/pipeline/details/all');
  const attributes = await api('/crm/attributes/deals');
  for (const label of Object.values(dealAttributes)) {
    const existing = attributes.find(a => a.label === label);
    if (existing && existing.attributeTypeName !== 'text') throw new Error('Attribute type conflict: ' + label);
    if (!existing) await api('/crm/attributes', 'POST', { objectType: 'deals', attributeType: 'text', label });
  }
  console.log(JSON.stringify({ configured: true, accountEmail: account.email, pipelines: pipelines.map(p => ({ id: p.pipeline, name: p.pipeline_name, stages: p.stages })) }, null, 2));
} catch (error) {
  console.error('Brevo setup failed:', error.code || error.message);
  process.exitCode = 1;
}
