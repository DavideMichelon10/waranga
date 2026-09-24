import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { createHostingerStore } from '../server/hostinger-store.js';
import { saveFormRecord, handleHistory, historyToken } from '../server/form-history.js';
const secret='unit-test-only';
test('history preserves distinct submissions, updates retries and incorporates earlier private records',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'wananga-history-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const store=createHostingerStore(dir);
 const first={requestId:randomUUID(),email:'test@example.com',nome:'Test',kind:'contact',at:'2026-09-24T10:00:00Z',messaggio:'a'.repeat(5000),status:'received'};
 await store.setJSON('old-record',first);
 const second={...first,requestId:randomUUID(),at:'2026-09-24T11:00:00Z',messaggio:'Seconda richiesta',status:'sending'};
 const token=await saveFormRecord(store,'second-record',second,{secret});
 await saveFormRecord(store,'second-record',{...second,status:'received'},{secret});
 const history=await store.getJSON('form-history/'+token);
 assert.equal(history.records.length,2);assert.equal(history.records[0].status,'received');
 assert.equal(history.records[1].messaggio.length,5000);
 assert.notEqual(token,historyToken(first.email,'different-secret'));
 assert.notEqual(token,historyToken('other@example.com',secret));
});
test('history is inaccessible without the full private link and escapes submitted HTML',async()=>{
 const email='test@example.com';const token=historyToken(email,secret);
 const archive={email,records:[{nome:'<script>alert(1)</script>',at:'2026-09-24T11:00:00Z',kind:'contact',messaggio:'<img src=x onerror=alert(1)>',status:'received',privacy_accepted:true,consenso_newsletter:false}]};
 const store=()=>({getJSON:async key=>key==='form-history/'+token?archive:null});
 for(const path of ['/richieste','/richieste/'+token.slice(0,63),'/richieste/'+'b'.repeat(64)]){
  const response=await handleHistory(new Request('https://test.example'+path),{store});assert.equal(response.status,404);assert.equal(response.headers.get('cache-control'),'private, no-store');
 }
 const request=new Request('https://test.example/richieste/'+token);
 const response=await handleHistory(request,{store,profileId:'profile'});const html=await response.text();
 assert.equal(response.status,200);assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img'));
 assert.equal(response.headers.get('referrer-policy'),'no-referrer');assert.ok(response.headers.get('content-security-policy').includes("frame-ancestors 'none'"));
 assert.equal((await handleHistory(new Request(request,{method:'POST'}),{store})).status,405);
});
