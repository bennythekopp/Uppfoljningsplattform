const fs=require('fs'),assert=require('node:assert/strict'),path=require('path'),ts=require('typescript'),{PGlite}=require('@electric-sql/pglite');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:1,target:9,esModuleInterop:true}}).outputText,f);
const {runDigest}=require('../lib/planning-mail.ts');
(async()=>{
 const e=new PGlite();for(const f of fs.readdirSync(path.join(__dirname,'../netlify/database/migrations')).sort())await e.exec(fs.readFileSync(path.join(__dirname,'../netlify/database/migrations',f),'utf8').replace("PERFORM pg_advisory_xact_lock(hashtextextended('schedule-membership:'||NEW.user_email,0));",'PERFORM 1;'));
 const c={query:(sql,args)=>sql.includes('pg_advisory_xact_lock')?Promise.resolve({rows:[]}):e.query(sql,args)};
 process.env.RESEND_API_KEY='isolated-test-key';process.env.PLANNING_MAIL_FROM='test@example.com';process.env.APP_ORIGIN='https://tcboden.se';
 await e.exec("INSERT INTO users(email,username,name,role,created_at) VALUES('admin@test','admin','Admin','Administratör',0);UPDATE planning_mail_settings SET enabled=true,recipient_email='recipient@example.com',recipient_user='admin@test',send_time='07:00',cadence='daily';");
 const sent=[];let fail=false;const send=async(url,init)=>{assert.equal(url,'https://api.resend.com/emails');sent.push({body:JSON.parse(init.body),key:init.headers['Idempotency-Key']});if(fail)throw Error('Simulated uncertain transport');return Response.json({id:'mock-'+sent.length})};
 async function add(id,status='pending'){await e.query("INSERT INTO planning_suggestions(id,day,column_id,field,previous_value,proposed_value,previous_label,proposed_label,base_revision,author_email,author_name,created_at,status) VALUES($1,'2026-11-02','ht2025','shared','','Text '||$1,'','Text '||$1,0,$1,$1,0,$2)",[id,status])}
 const day=n=>new Date(`2026-11-${String(n).padStart(2,'0')}T08:00:00Z`);
 await add('pendingA');await add('approvedB','approved');await add('rejectedC','rejected');await add('supersededD','superseded');await add('withdrawnH','withdrawn');
 await runDigest(c,day(2),send);assert.equal(sent.length,1);assert.match(sent[0].body.text,/pendingA/);for(const id of ['approvedB','rejectedC','supersededD','withdrawnH'])assert.ok(!sent[0].body.text.includes(id));assert.match(sent[0].body.html,/1 väntande förslag/);
 await runDigest(c,day(2),send);assert.equal(sent.length,1,'same day not resent');
 await runDigest(c,day(3),send);assert.equal(sent.length,2);assert.match(sent[1].body.text,/pendingA/,'already mailed pending still included');assert.notEqual(sent[0].key,sent[1].key);
 await e.exec("UPDATE planning_suggestions SET status='approved' WHERE id='pendingA'");await runDigest(c,day(4),send);assert.equal(sent.length,2,'no pending no message');
 // Frozen payload remains stable after uncertain transport; same key retries exact bytes.
 await add('pendingE');fail=true;await assert.rejects(()=>runDigest(c,day(5),send),/uncertain/);const first=sent.at(-1);fail=false;await runDigest(c,day(5),send);assert.deepEqual(sent.at(-1),first);
 // A queued uncertain delivery must not resend an approved proposal.
 await add('pendingF');fail=true;await assert.rejects(()=>runDigest(c,day(6),send));await e.exec("UPDATE planning_suggestions SET status='rejected' WHERE id='pendingF'");fail=false;const count=sent.length;await runDigest(c,day(6),send);assert.equal(sent.length,count);assert.equal((await e.query('SELECT review_required FROM planning_mail_outbox WHERE sent_at IS NULL')).rows[0].review_required,true);
 // After explicit retry resolution the next digest is freshly built.
 await e.exec('DELETE FROM planning_mail_outbox WHERE sent_at IS NULL');await runDigest(c,day(6),send);assert.match(sent.at(-1).body.text,/pendingE/);assert.ok(!sent.at(-1).body.text.includes('pendingF'));
 // Queue created but never attempted is safe to refresh, including new proposals.
 await add('pendingG');const seqs=(await e.query("SELECT seq::text FROM planning_suggestions WHERE id='pendingE'")).rows.map(r=>r.seq);await e.query("INSERT INTO planning_mail_outbox(id,send_day,created_at,payload,suggestion_seqs) VALUES('unattempted','2026-11-07',$1,$2,$3)",[day(7).getTime(),JSON.stringify({to:['recipient@example.com'],text:'STALE'}),JSON.stringify(seqs)]);await runDigest(c,day(7),send);assert.match(sent.at(-1).body.text,/pendingE/);assert.match(sent.at(-1).body.text,/pendingG/);assert.ok(!JSON.stringify(sent.at(-1)).includes('STALE'));
 // Empty unattempted queue is removed without sending.
 await e.exec("UPDATE planning_suggestions SET status='approved' WHERE status='pending'");await e.query("INSERT INTO planning_mail_outbox(id,send_day,created_at,payload,suggestion_seqs) VALUES('empty','2026-11-08',$1,$2,'[]')",[day(8).getTime(),JSON.stringify({to:['recipient@example.com'],text:'OLD'})]);const before=sent.length;await runDigest(c,day(8),send);assert.equal(sent.length,before);assert.equal((await e.query('SELECT id FROM planning_mail_outbox WHERE sent_at IS NULL')).rows.length,0);
 console.log('PASS v14 digest: all pending on each scheduled day; excludes approved/rejected/superseded; empty suppression; daily dedupe; immutable retry/idempotency; changed uncertain payload held for review; never-attempted queue refresh. No real mail sent.');await e.close();
})().catch(e=>{console.error(e);process.exitCode=1});
