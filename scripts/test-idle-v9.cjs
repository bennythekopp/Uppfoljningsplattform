const fs=require('fs'),assert=require('node:assert/strict'),ts=require('typescript'),vm=require('node:vm'),Module=require('node:module');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:9,module:1}}).outputText,f);
async function clientTests(){
 let now=1000,id=0,calls=0;const timers=new Map(),we=new Map(),de=new Map();
 function events(map){return {addEventListener:(n,f)=>{if(!map.has(n))map.set(n,new Set());map.get(n).add(f)}}}
 const win={...events(we),setInterval:f=>{timers.set(++id,f);return id},clearInterval:i=>timers.delete(i)},doc={...events(de),visibilityState:'visible'};
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/client-activity.ts','utf8'),{compilerOptions:{target:9,module:1}}).outputText,{exports,window:win,document:doc,Date:{now:()=>now},Promise,Set});
 const settle=()=>new Promise(r=>setImmediate(r)),tick=async()=>{for(const f of timers.values())f();await settle()},emit=(map,name)=>{for(const f of map.get(name)||[])f({isTrusted:true})};
 const stop=exports.activeInterval(()=>{calls++},1000);now+=1000;await tick();assert.equal(calls,1);
 doc.visibilityState='hidden';emit(de,'visibilitychange');now+=10000;await tick();assert.equal(calls,1,'hidden tab must not poll');
 doc.visibilityState='visible';emit(de,'visibilitychange');await settle();assert.equal(calls,2,'visible tab refreshes immediately');
 now+=exports.CLIENT_IDLE_MS;await tick();assert.equal(calls,2,'visible idle tab must not poll');
 emit(we,'keydown');await settle();assert.equal(calls,3,'typing resumes immediately');
 stop();now+=1000;await tick();assert.equal(calls,3,'unmounted module stays stopped');
 let release;const stop2=exports.activeInterval(()=>{calls++;return new Promise(r=>release=r)},1000);now+=1000;await tick();const n=calls;now+=1000;await tick();emit(de,'visibilitychange');await settle();assert.equal(calls,n,'requests never overlap');release();await settle();stop2();
 console.log('PASS: hidden, idle, resume, disposal and overlapping requests');
}
async function scheduleTests(){
 process.env.RESEND_API_KEY='test';process.env.PLANNING_MAIL_FROM='test';
 const {nextMailCheck,nextBackupCheck}=require('../lib/scheduler-times.ts'),t=Date.parse;
 assert.equal(nextMailCheck({enabled:false}),null);
 assert.equal(nextMailCheck({enabled:true,send_time:'07:00'},t('2026-11-01T05:59:30Z')),t('2026-11-01T06:00Z'),'near-due jobs must not skip to tomorrow');
 assert.equal(nextMailCheck({enabled:true,send_time:'07:00'},t('2026-11-01T05:00Z')),t('2026-11-01T06:00Z'));
 assert.equal(nextMailCheck({enabled:true,send_time:'07:00',sent_day:'2026-11-01'},t('2026-11-01T06:00Z')),t('2026-11-02T06:00Z'));
 assert.equal(nextMailCheck({enabled:true,send_time:'02:30'},t('2026-03-28T23:00Z')),t('2026-03-29T01:00Z'),'DST missing time catches up');
 assert.equal(nextMailCheck({enabled:true,send_time:'02:30',sent_day:'2026-10-25'},t('2026-10-25T01:00Z')),t('2026-10-26T01:30Z'),'DST repeated hour sends once');
 assert.equal(nextBackupCheck({enabled:false}),null);
 const row={enabled:true,schedule_kind:'interval',interval_hours:6,send_time:'07:00',schedule_anchored:true,last_queued_at:t('2026-11-01T06:00Z')};
 assert.equal(nextBackupCheck(row,t('2026-11-01T06:01Z')),t('2026-11-01T12:00Z'));
 assert.equal(nextBackupCheck({enabled:true,schedule_kind:'weekly',send_time:'07:00',week_day:1,last_queued_at:t('2026-10-26T06:00Z')},t('2026-11-01T12:00Z')),t('2026-11-02T06:00Z'));
 console.log('PASS: disabled, daily, weekly, anchored intervals and Swedish DST');
 const records=new Map();let version=0;
 const store={getWithMetadata:async key=>records.get(key)||null,setJSON:async(key,data,options={})=>{const old=records.get(key);if(options.onlyIfNew&&old||options.onlyIfMatch&&old?.etag!==options.onlyIfMatch)return {modified:false};const entry={data,etag:String(++version)};records.set(key,entry);return {modified:true,etag:entry.etag}}};
 const original=Module._load;Module._load=function(name,...args){if(name==='@netlify/blobs')return {getStore:()=>store};return original.call(this,name,...args)};
 const {runScheduled,wakeScheduledJobs,wakePushNotifications}=require('../lib/scheduler-gate.ts');Module._load=original;process.env.NETLIFY='true';let sql=0;
 await runScheduled('mail',async()=>{sql++;return 500000},1000);await runScheduled('mail',async()=>{sql++;return 500000},2000);assert.equal(sql,1,'sleep gate skips database');
 await wakeScheduledJobs();await runScheduled('mail',async()=>{sql++;return null},3000);await runScheduled('mail',async()=>{sql++;return null},4000);assert.equal(sql,2,'disabled job never queries again');
 await wakeScheduledJobs();await runScheduled('mail',async()=>{sql++;await wakeScheduledJobs();return 999999},5000);await runScheduled('mail',async()=>{sql++;return null},6000);assert.equal(sql,4,'concurrent invalidation must survive');
 await wakeScheduledJobs();await Promise.all([runScheduled('mail',async()=>{sql++;return 999999},7000),runScheduled('mail',async()=>{sql++;return 999999},7000)]);assert.equal(sql,5,'atomic lease allows only one worker');
 await wakeScheduledJobs();await assert.rejects(runScheduled('mail',async()=>{throw Error('provider unavailable')},8000));let retry=0;await runScheduled('mail',async()=>{retry++;return null},9000);assert.equal(retry,0);await runScheduled('mail',async()=>{retry++;return null},8000+15*60000);assert.equal(retry,1,'failed jobs retry after backoff');
 let pushes=0;await runScheduled('push',async()=>{pushes++;return null},1000);for(let i=0;i<60;i++)await runScheduled('push',async()=>{pushes++;return null},2000+i*60000);assert.equal(pushes,1,'empty push job must not wake SQL every minute');await wakePushNotifications();await runScheduled('push',async()=>{pushes++;return null},4000000);assert.equal(pushes,2,'a change wakes the push job');
 delete process.env.NETLIFY;
 console.log('PASS: SQL-free idle ticks, disabled schedules, concurrent writes/leases and retry');
}
(async()=>{await clientTests();await scheduleTests()})().catch(e=>{console.error(e);process.exitCode=1});
