import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createSubscribeHandler, waitlistName } from '../server/subscribe.js';
import { createHostingerStore } from '../server/hostinger-store.js';
import { migrateStoredRecords } from '../server/brevo-migration.js';
import { saveFormRecord } from '../server/form-history.js';
const req = (data, path = '/api/newsletter') => new Request('https://test.example' + path, { method: 'POST', headers: { origin: 'https://test.example', 'content-type': 'application/json' }, body: JSON.stringify(data) });
async function setup(t, overrides = {}) {
 const dir = await mkdtemp(join(tmpdir(), 'wananga-subscriptions-')); t.after(()=>rm(dir,{recursive:true,force:true}));
 const db=createHostingerStore(dir); let wakes=0;
 const handler=createSubscribeHandler({store:()=>db,configured:()=>true,hash:s=>s,limit:(s,k,n)=>s.limit(k,n),getWaitlist:async()=>({_id:'bali-list',slug:'bali-prossima-partenza',status:'collecting'}),wake:()=>wakes++,...overrides});
 return {db,handler,wakes:()=>wakes};
}
test('newsletter and waitlist persist separate consent records before acknowledging, with retry deduplication',async t=>{
 const {db,handler}=await setup(t);
 const input={requestId:randomUUID(),email:'test@example.com',privacy:true,newsletter:true};
 assert.equal((await handler(req(input))).status,200);assert.equal((await handler(req(input))).status,200);
 const wait={...input,requestId:randomUUID(),waitlistId:'bali-list',newsletter:false};
 assert.equal((await handler(req(wait,'/api/waitlist'))).status,200);
 const records=await db.findDeliverableRecords();assert.equal(records.length,2);
 const n=records.find(r=>r.kind==='newsletter'),w=records.find(r=>r.kind==='waitlist');
 assert.equal(n.consenso_newsletter,true);assert.ok(n.newsletterConsent);
 assert.equal(w.consenso_newsletter,false);assert.equal(w.newsletterConsent,null);assert.ok(w.waitlistConsent);assert.equal(w.waitlistName,'Lista d’attesa · Bali prossima partenza');
 assert.ok(records.every(r=>r.status==='queued'&&r.provider==='brevo'));
});
test('invalid consent, cross-origin, closed lists and storage failure never acknowledge success',async t=>{
 const {db,handler}=await setup(t);
 for(const patch of [{privacy:false},{newsletter:false},{email:'bad'},{website:'bot'}])assert.equal((await handler(req({email:'test@example.com',privacy:true,newsletter:true,...patch}))).status,400);
 const cross=req({email:'test@example.com',privacy:true,newsletter:true});cross.headers.set('origin','https://evil.example');assert.equal((await handler(cross)).status,403);
 assert.equal((await db.findDeliverableRecords()).length,0);
 const closed=await setup(t,{getWaitlist:async()=>({status:'closed'})});assert.equal((await closed.handler(req({email:'test@example.com',privacy:true,newsletter:false,waitlistId:'bali'},'/api/waitlist'))).status,409);
 const failure=createSubscribeHandler({configured:()=>true,hash:s=>s,limit:async()=>{},store:()=>({withLock:async(k,fn)=>fn(),getJSON:async()=>null,setJSON:async()=>{throw Error('disk');}})});
 assert.equal((await failure(req({email:'test@example.com',privacy:true,newsletter:true}))).status,503);
});
test('legacy migration keeps complete source records and is restart-safe',async t=>{
 const {db}=await setup(t);const old={email:'test@example.com',requestId:randomUUID(),kind:'application',at:'2026-09-24T09:00:00Z',status:'received',motivazione:'a'.repeat(2000),viaggio:'Bali'};
 await saveFormRecord(db,`forms/${old.email}/${old.requestId}`,old,{secret:'test'});
 await db.setJSON('old-consent',{email:old.email,at:old.at,privacyVersion:'v1',newsletter:true,status:'subscribed'});
 await migrateStoredRecords(db,{hash:s=>s,secret:'test'});await migrateStoredRecords(db,{hash:s=>s,secret:'test'});
 const records=await db.findDeliverableRecords();assert.equal(records.length,2);assert.ok(records.every(r=>r.imported&&r.status==='queued'));assert.equal(records.find(r=>r.kind==='application').motivazione,old.motivazione);
 assert.equal((await db.getJSON('old-consent')).status,'subscribed');
 assert.equal(records.find(r=>r.kind==='newsletter').originalStatus,'subscribed');
});
