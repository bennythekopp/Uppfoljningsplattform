const fs=require('fs'),assert=require('node:assert/strict'),Module=require('node:module'),crypto=require('node:crypto'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:1,target:9,esModuleInterop:true}}).outputText,f);
let actor={email:'admin@test.se',name:'Admin',role:'Administratör'},calls=[],queries=[],fail=false,throws=false;
const original=Module._load,db={prepare(sql){queries.push(sql);const stmt={bind(){return stmt},async run(){return {meta:{changes:1}}},async first(){return null},async all(){return {results:[]}}};return stmt}};
Module._load=function(id,parent,...args){
 if(id==='server-only')return {};
 if(/(?:^|\/)auth$/.test(id))return {currentUser:async()=>actor,currentAccount:async()=>actor,sha256:async s=>crypto.createHash('sha256').update(s).digest('hex'),error:(message,status=400)=>Response.json({error:message},{status})};
 if(/(?:^|\/)database$/.test(id))return {db};
 if(/(?:^|\/)module-access$/.test(id))return {requireModule:async()=>{}};
 if(/(?:^|\/)login-security$/.test(id))return {loginIP:()=>''};
 return original.call(this,id,parent,...args)
};
process.env.RESEND_API_KEY='secret-test';process.env.PLANNING_MAIL_FROM='TC Boden <test@tcboden.se>';process.env.APP_ORIGIN='https://tcboden.se';
global.fetch=async(url,init)=>{calls.push({url,...init});if(throws)throw Error('secret-test internal error');return Response.json(fail?{error:'secret-test'}:{id:'test-message'},{status:fail?403:200})};
const route=require('../app/api/planning/test-mail/route.ts'),requestId=crypto.randomUUID(),body={recipientEmail:'recipient@example.se',requestId};
async function call(value=body,origin='https://tcboden.se'){return route.POST(new Request('https://tcboden.se/api/planning/test-mail',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(value)}))}
(async()=>{
 let r=await call();assert.equal(r.status,200);assert.match((await r.json()).message,/recipient@example.se/);assert.equal(calls.length,1);let payload=JSON.parse(calls[0].body);assert.deepEqual(payload.to,['recipient@example.se']);assert.match(payload.subject,/Testmail/);assert.match(payload.text,/https:\/\/tcboden.se/);assert.ok(!queries.some(q=>/planning_mail|planning_mailed|planning_suggestions/.test(q)),'test mail must never modify the digest/outbox/settings');
 const key=calls[0].headers['Idempotency-Key'];await call();assert.equal(calls[1].headers['Idempotency-Key'],key,'retry uses same provider key');
 actor={...actor,role:'Instruktör'};assert.equal((await call()).status,403);actor={...actor,role:'Administratör',previewRole:'Administratör'};assert.equal((await call()).status,403);delete actor.previewRole;
 assert.equal((await call(body,'https://other.example')).status,403);assert.equal(calls.length,2,'unauthorized requests must not send');
 for(const email of ['', 'a@b', 'a@example.se\r\nBcc:other@example.se','one@example.se,two@example.se'])assert.equal((await call({...body,recipientEmail:email})).status,400);
 assert.equal((await call({...body,requestId:'bad'})).status,400);delete process.env.RESEND_API_KEY;assert.equal((await call()).status,503);process.env.RESEND_API_KEY='secret-test';
 fail=true;r=await call();assert.equal(r.status,502);assert.ok(!JSON.stringify(await r.json()).includes('secret-test'));fail=false;throws=true;r=await call();assert.equal(r.status,502);assert.ok(!JSON.stringify(await r.json()).includes('secret-test'));
 const ui=fs.readFileSync('app/planning-suggestions.tsx','utf8');assert.match(ui,/type="button" className="secondary planning-test-mail"/);assert.match(ui,/Skickar testmail…/);
 console.log('PASS: real API authorization/preview/origin controls; valid recipient; provider payload/idempotency; invalid input; missing config; provider errors/timeouts; no digest/settings changes; test button does not submit form. No real emails sent.');
})().catch(e=>{console.error(e);process.exitCode=1});
