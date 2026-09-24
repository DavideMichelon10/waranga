import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createFormHandler } from '../server/forms.js';
import { createHostingerStore } from '../server/hostinger-store.js';
import { createReach } from '../server/reach.js';
import fields from '../server/reach-fields.json' with { type: 'json' };
import { tripRequestPath } from '../src/lib/content.js';
const input = () => ({ requestId: randomUUID(), nome: 'Test Wānanga', email: 'test@example.com', privacy_accepted: true, consenso_newsletter: false, messaggio: 'Una domanda sul viaggio.' });
const application = () => ({ ...input(), tripSlug: 'bali', telefono: '+39 333 1234567', eta: '30', numero_persone: '2', contatto_preferito: 'sera', motivazione: 'Vorrei scoprire Bali.', esperienza_gruppo: 'No', info_utili: '' });
const request = (body, path = '/api/contact', origin = 'https://test.example') => new Request('https://test.example' + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body) });
async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'wananga-forms-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const db = createHostingerStore(directory);
  return { db, directory };
}
test('invalid forms, cross-origin submissions and closed trips never reach provider', async t => {
  const { db } = await fixture(t); let calls = 0;
  const handler = createFormHandler({ store: () => db, enabled: () => true, hash: s => s, getTrip: async () => ({ title: 'Bali', status: 'closed' }), reach: () => ({ submitForm: async () => { calls++; } }) });
  for (const bad of [{...input(), privacy_accepted:false},{...input(),consenso_newsletter:'false'},{...input(),email:'bad'},{...input(),messaggio:'x'.repeat(5001)},{...input(),website:'spam'},{...input(),requestId:'../secret'}]) assert.equal((await handler(request(bad))).status,400);
  assert.equal((await handler(request(input(),'/api/contact','https://other.example'))).status,403);
  assert.equal((await handler(request({...application(),eta:0},'/api/application'))).status,400);
  assert.equal((await handler(request(application(),'/api/application'))).status,409);
  assert.equal(calls,0);
});
test('submission is successful only after Reach confirms; retries are idempotent and failure recoverable', async t => {
  const { db,directory } = await fixture(t); let calls=0; let fail=true;
  const handler=createFormHandler({ store:()=>db,enabled:()=>true,hash:s=>s,reach:()=>({ submitForm:async()=>{calls++; if(fail)throw Error(); return {contactUuid:'c',newsletter:'not_requested'};} }) });
  const data=input();
  assert.equal((await handler(request(data))).status,503);
  fail=false;
  assert.equal((await handler(request(data))).status,200);
  assert.equal((await handler(request(data))).status,200);
  assert.equal(calls,2);
  const records=await readdir(join(directory,'consent')); assert.equal(records.length,1);
  const saved=JSON.parse(await readFile(join(directory,'consent',records[0]),'utf8'));
  assert.equal(saved.status,'received');assert.equal(saved.messaggio,data.messaggio);assert.equal(saved.consenso_newsletter,false);
});
test('concurrent submissions for one email are serialized and lock releases after failure',async t=>{
  const {db}=await fixture(t);let release;
  const a=db.withLock('email',()=>new Promise(r=>{release=r;}));
  while(!release)await new Promise(r=>setImmediate(r));
  await assert.rejects(db.withLock('email',async()=>{}),{code:'request_in_progress'});
  release();await a;
  await assert.rejects(db.withLock('email',async()=>{throw Error('failure');}));
  await db.withLock('email',async()=>{});
});
function provider({existing=true,status='subscribed',activeAutomation=false}={}){
 let contact=existing?{uuid:'c',email:'test@example.com',subscription_status:status,note:'Existing member'}:null;
 const calls=[];
 const reach=createReach({token:'test',profileId:'profile',fetcher:async(url,options)=>{
  const body=options.body?JSON.parse(options.body):null;calls.push({url,method:options.method,body});
  if(url.includes('/contacts?'))return Response.json({data:contact?[contact]:[]});
  if(url.includes('/automations?'))return Response.json({data:activeAutomation?[{status:'active'}]:[]});
  if(url.endsWith('/contacts')&&options.method==='POST'){contact={...body,uuid:'c',subscription_status:'subscribed'};return Response.json({success:true});}
  if(url.endsWith('/contacts/c')&&options.method==='GET')return Response.json({...contact,fields:[{uuid:'unrelated',type:'text',value:'preserve me'}]});
  if(url.endsWith('/contacts/c')&&options.method==='PATCH'){Object.assign(contact,body);return Response.json({success:true});}
  if(url.endsWith('/tags'))return Response.json({data:body.names.map(value=>({uuid:value,value}))});
  return new Response(null,{status:204});
 }});return {reach,calls};
}
test('Reach keeps full long messages, preserves unrelated fields and never opts existing members out',async()=>{
 const {reach,calls}=provider();const data={...input(),kind:'contact',at:new Date().toISOString(),messaggio:'à'.repeat(5000)};
 const result=await reach.submitForm(data);assert.equal(result.newsletter,'not_requested');
 const patch=calls.find(c=>c.method==='PATCH').body;
 assert.equal(patch.subscription_status,undefined);
 assert.equal(patch.fields.find(f=>f.uuid==='unrelated').value,'preserve me');
 assert.equal(fields.message.map(id=>patch.fields.find(f=>f.uuid===id).value||'').join(''),data.messaggio);
 assert.ok(patch.fields.every(f=>f.value===null||Array.from(f.value).length<=255));
 assert.ok(!calls.some(c=>c.url.includes('/tags/wananga-newsletter/')));
});
test('new operational contacts are unsubscribed; existing suppressed contacts are never revived',async()=>{
 for(const existing of [false,true]){
  const {reach,calls}=provider({existing,status:'unsubscribed'});
  const data={...input(),kind:'contact',at:new Date().toISOString(),consenso_newsletter:existing};
  const result=await reach.submitForm(data);
  const patch=calls.find(c=>c.method==='PATCH').body;
  assert.equal(patch.subscription_status,existing?undefined:'unsubscribed');
  assert.equal(result.newsletter,existing?'not_subscribed':'not_requested');
  assert.ok(!calls.some(c=>c.url.includes('/tags/wananga-newsletter/')));
 }
 const {reach,calls}=provider({existing:false,activeAutomation:true});
 await assert.rejects(reach.submitForm({...input(),kind:'contact',at:new Date().toISOString()}),{code:'operational_contact_automation'});
 assert.ok(!calls.some(c=>c.method==='POST'));
});
test('application data maps to Reach and opt-in adds only the newsletter tag when requested',async()=>{
 const {reach,calls}=provider();
 const result=await reach.submitForm({...application(),kind:'application',viaggio:'Bali',at:new Date().toISOString(),consenso_newsletter:true});
 assert.equal(result.newsletter,'subscribed');
 const patch=calls.find(c=>c.method==='PATCH').body;
 assert.equal(patch.phone,'+393331234567');
 assert.equal(patch.fields.find(f=>f.uuid===fields.age).value,'30');
 assert.ok(calls.some(c=>c.url.includes('/tags/wananga-candidature/')));
 assert.ok(calls.some(c=>c.url.includes('/tags/wananga-newsletter/')));
 assert.equal(tripRequestPath({slug:'thailandia'}),'/candidatura/thailandia');
});

test('new Reach contacts can become queryable after the create acknowledgement', async () => {
  let searches = 0; let patches = 0; const delays = [];
  const reach = createReach({ token: 'test', profileId: 'p', pause: async ms => delays.push(ms), fetcher: async (url, options) => {
    if (url.includes('/contacts?')) return Response.json({ data: ++searches < 3 ? [] : [{ uuid: 'new', email: 'test@example.com', subscription_status: 'subscribed', note: 'wananga-contact-only' }] });
    if (url.includes('/automations?')) return Response.json({ data: [] });
    if (url.endsWith('/contacts/new') && options.method === 'GET') return Response.json({ fields: [] });
    if (url.endsWith('/contacts/new') && options.method === 'PATCH') { patches++; return Response.json({ success: true }); }
    if (url.endsWith('/tags')) return Response.json({ data: JSON.parse(options.body).names.map(value => ({ uuid: value, value })) });
    return Response.json({ message: 'Request accepted' });
  } });
  const result = await reach.submitForm({ ...input(), kind: 'contact', at: new Date().toISOString() });
  assert.equal(result.contactUuid, 'new'); assert.equal(patches, 1); assert.deepEqual(delays, [500]);
});
