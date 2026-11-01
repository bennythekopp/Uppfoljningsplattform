const fs=require('fs'),assert=require('node:assert/strict'),Module=require('module'),crypto=require('crypto'),path=require('path'),root=path.resolve(__dirname,'..'),ts=require(root+'/node_modules/typescript'),{PGlite}=require('@electric-sql/pglite');let engine,token='',requestHeaders=new Headers();require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:1,target:9,esModuleInterop:true}}).outputText,f);const extraCookies=new Map(),cookieOptions=new Map();const jar={get:n=>n==='tc_session'?(token?{value:token}:undefined):(extraCookies.has(n)?{value:extraCookies.get(n)}:undefined),set:(n,v,o)=>{if(n==='tc_session')token=v;else{if(o?.maxAge===0)extraCookies.delete(n);else extraCookies.set(n,v);cookieOptions.set(n,o)}},delete:n=>{if(n==='tc_session')token='';else extraCookies.delete(n)}},orig=Module._load;Module._load=function(id){if(id==='@netlify/blobs')return {getStore:()=>({setJSON:async()=>({modified:true})})};if(id==='server-only')return {};if(id==='next/headers')return {cookies:async()=>jar,headers:async()=>requestHeaders};if(id==='pg'){const query=async(sql,args)=>{if(sql.includes('pg_try_advisory_lock'))return {rows:[{locked:true}],rowCount:1};if(sql.includes('pg_advisory_unlock'))return {rows:[],rowCount:1};if(sql.includes('pg_advisory_xact_lock'))return {rows:[],rowCount:1};const r=await engine.query(sql,args);return {rows:r.rows,rowCount:r.affectedRows||r.rows.length}};return {__esModule:true,default:{types:{setTypeParser(){}},Pool:class{query(...args){return query(...args)}async connect(){return {query,release(){}}}}}}}return orig.apply(this,arguments)};process.env.DATABASE_URL='postgres://qa';process.env.NETLIFY='true';process.env.APP_ORIGIN='https://handledare.netlify.app';
(async()=>{engine=new PGlite();for(const f of fs.readdirSync(root+'/netlify/database/migrations').sort().filter(f=>!f.startsWith('0034')))await engine.exec(fs.readFileSync(root+'/netlify/database/migrations/'+f,'utf8').replace("PERFORM pg_advisory_xact_lock(hashtextextended('schedule-membership:'||NEW.user_email,0));",'PERFORM 1;'));

await engine.exec(fs.readFileSync(root+'/netlify/database/migrations/0034_planning_permissions_and_widths.sql','utf8'));
const hash=t=>crypto.createHash('sha256').update(t).digest('hex'),auth=require(root+'/app/auth.ts'),login=require(root+'/app/api/login/route.ts'),session=require(root+'/app/api/session/route.ts'),logout=require(root+'/app/api/logout/route.ts'),planning=require(root+'/app/api/planning/route.ts'),users=require(root+'/app/api/users/route.ts');
const password='Example-Password-2026',salt='1'.repeat(64),passwordHash=await auth.passwordHash(password,salt),now=Date.now();
for(const [email,role] of [['admin@test','Administratör'],['proposer@test','Instruktör'],['editor@test','Instruktör']])await engine.query('INSERT INTO users(email,username,name,role,password_hash,password_salt,created_at) VALUES($1,$1,$1,$2,$3,$4,0)',[email,role,passwordHash,salt]);
const origin=process.env.APP_ORIGIN;
async function call(api,method='GET',body,query='',app=false){requestHeaders=new Headers(app?{'x-tc-app':'planning'}:{});const headers={origin,...Object.fromEntries(requestHeaders),...(body?{'content-type':'application/json'}:{})};const res=await api[method](new Request(origin+'/api/test'+query,{method,headers,...(body?{body:JSON.stringify(body)}:{})}));return {status:res.status,...await res.json()}}
// Inactivity does not expire sessions; absolute expiration and disabled accounts do.
token='a'.repeat(64);await engine.query("INSERT INTO sessions(token_hash,user_email,expires_at,last_activity_at) VALUES($1,'admin@test',$2,$3)",[hash(token),now+3600000,now-3*3600000]);
assert.ok(await auth.currentAccount());let result=await call(session);assert.equal(result.status,200);assert.equal(result.idleExpiresAt,result.expiresAt);await auth.currentAccount();
const {cleanAuthState}=require(root+'/app/login-security.ts');await cleanAuthState();assert.ok(await auth.currentAccount(),'cleanup must retain inactive valid session');
await engine.query('UPDATE sessions SET expires_at=$1 WHERE token_hash=$2',[now-1,hash(token)]);assert.equal(await auth.currentAccount(),null);
// Website and planning logins have independent cookies/lifetimes and scope.
result=await call(login,'POST',{username:'admin@test',password});assert.equal(result.status,200,JSON.stringify(result));const websiteToken=token;assert.ok(result.expiresAt>Date.now()+7*3600000&&result.expiresAt<=Date.now()+8*3600000);
result=await call(login,'POST',{username:'proposer@test',password,planningApp:true,rememberMe:true},'',true);assert.equal(result.status,200,JSON.stringify(result));const planningToken=extraCookies.get('tc_planning_session');assert.equal(cookieOptions.get('tc_planning_session').maxAge,30*24*3600);assert.equal(cookieOptions.get('tc_planning_session').httpOnly,true);assert.equal(cookieOptions.get('tc_planning_session').sameSite,'strict');assert.equal(token,websiteToken);
assert.equal((await auth.currentAccount()).email,'proposer@test');requestHeaders=new Headers();assert.equal((await auth.currentAccount()).email,'admin@test');
// Copying app token to a normal cookie cannot grant website access.
token=planningToken;assert.equal(await auth.currentAccount(),null);token=websiteToken;
assert.equal((await call(users,'GET',undefined,'',true)).status,403);
result=await call(login,'POST',{username:'editor@test',password,planningApp:true,rememberMe:false},'',true);assert.equal(result.status,200);assert.equal(cookieOptions.get('tc_planning_session').maxAge,8*3600);
// Live permission and disabled-account checks still apply to remembered sessions.
await engine.query("UPDATE users SET disabled_at=$1 WHERE email='editor@test'",[now]);assert.equal(await auth.currentAccount(),null);await engine.query("UPDATE users SET disabled_at=NULL WHERE email='editor@test'");
extraCookies.set('tc_planning_session',planningToken);
await engine.query("UPDATE planning_settings SET editor_emails='[\"editor@test\"]'::jsonb,suggester_emails='[\"proposer@test\",\"editor@test\"]'::jsonb");
await engine.query("UPDATE panel_module_access SET restricted=false WHERE kind='planning'");
let data=await call(planning,'GET',undefined,'?year=2026',true);assert.equal(data.status,200,JSON.stringify(data));assert.equal(data.canSuggest,true);
const column=data.columns.find(c=>c.userEmail==='proposer@test');assert.ok(column);
const proposal={action:'propose',day:'2026-11-02',columnId:column.id,field:'task',previousValue:'',value:'Testuppgift',revision:0,color:'#70519e',previousColor:'',colorRevision:0};
assert.equal((await call(planning,'POST',{action:'cell',day:proposal.day,columnId:column.id,field:'task',value:'Forbidden',revision:0},'',true)).status,403);
result=await call(planning,'POST',proposal,'',true);assert.equal(result.status,200,JSON.stringify(result));
let row=(await engine.query("SELECT * FROM planning_suggestions WHERE status='pending'")).rows[0];assert.equal(row.proposed_color,'#70519e');assert.equal(row.proposed_value,'Testuppgift');assert.equal((await engine.query('SELECT * FROM planning_cells')).rows.length,0,'proposal must not directly change schedule');
// Duplicate retry does not create another proposal.
assert.equal((await call(planning,'POST',proposal,'',true)).status,200);assert.equal((await engine.query("SELECT * FROM planning_suggestions WHERE status='pending'")).rows.length,1);
// Both permissions coexist; app remains proposals only.
await engine.query("UPDATE planning_settings SET editor_emails='[\"editor@test\",\"proposer@test\"]'::jsonb");assert.equal((await call(planning,'POST',proposal,'',true)).status,200);assert.equal((await call(planning,'POST',{action:'review',id:row.id,decision:'approve'},'',true)).status,403);await engine.query("UPDATE planning_settings SET editor_emails='[\"editor@test\"]'::jsonb");
// Website approval atomically applies text+color and preserves other cells.
result=await call(planning,'POST',{action:'review',id:row.id,decision:'approve'});assert.equal(result.status,200,JSON.stringify(result));let cells=(await engine.query('SELECT field,value FROM planning_cells ORDER BY field')).rows;assert.deepEqual(cells,[{field:'color',value:'#70519e'},{field:'task',value:'Testuppgift'}]);
// Color-only proposal is accepted but detects concurrent color edits before approval.
data=await call(planning,'GET',undefined,'?year=2026',true);const task=data.cells.find(c=>c.field==='task'),color=data.cells.find(c=>c.field==='color');
const colorOnly={...proposal,previousValue:'Testuppgift',revision:task.revision,previousColor:color.value,colorRevision:color.revision,color:'#315f9a'};result=await call(planning,'POST',colorOnly,'',true);assert.equal(result.status,200,JSON.stringify(result));row=(await engine.query("SELECT * FROM planning_suggestions WHERE status='pending'")).rows[0];await engine.query("UPDATE planning_cells SET value='#a84242',revision=revision+1 WHERE field='color'");result=await call(planning,'POST',{action:'review',id:row.id,decision:'approve'});assert.equal(result.status,409,JSON.stringify(result));assert.equal((await engine.query("SELECT status FROM planning_suggestions WHERE id=$1",[row.id])).rows[0].status,'pending');
// Invalid color and stale values are rejected.
assert.equal((await call(planning,'POST',{...proposal,field:'tour'},'',true)).status,400);assert.equal((await call(planning,'POST',{...colorOnly,color:'javascript:bad'},'',true)).status,400);
await engine.query("UPDATE panel_module_access SET restricted=true,user_emails='[]'::jsonb WHERE kind='planning'");assert.equal((await call(planning,'GET',undefined,'?year=2026',true)).status,403);await engine.query("UPDATE panel_module_access SET restricted=false WHERE kind='planning'");
// v14: administrator can persist simultaneous rights, and app sees other authors.
let perms=await call(planning,'GET',undefined,'?year=2026');
result=await call(planning,'POST',{action:'editors',emails:['proposer@test','editor@test'],suggesterEmails:['proposer@test'],revision:perms.settingsRevision});assert.equal(result.status,200,JSON.stringify(result));
perms=await call(planning,'GET',undefined,'?year=2026');assert.ok(perms.editorEmails.includes('proposer@test'));assert.ok(perms.suggesterEmails.includes('proposer@test'));
result=await call(login,'POST',{username:'admin@test',password,planningApp:true,rememberMe:false},'',true);assert.equal(result.status,200);
const another={action:'propose',day:'2026-11-05',columnId:column.id,field:'tour',previousValue:'',value:'Adminens tur',revision:0};result=await call(planning,'POST',another,'',true);assert.equal(result.status,200,JSON.stringify(result));
assert.equal((await call(planning,'POST',{action:'review',id:row.id,decision:'reject'},'',true)).status,403);
extraCookies.set('tc_planning_session',planningToken);
data=await call(planning,'GET',undefined,'?year=2026&from=2026-11-02&to=2026-11-09',true);assert.equal(data.canEdit,true);assert.equal(data.canSuggest,true);assert.ok(data.suggestions.some(s=>s.authorEmail==='admin@test'&&s.proposedValue==='Adminens tur'));assert.ok(data.suggestions.some(s=>s.authorEmail==='proposer@test'));
assert.equal((await call(planning,'GET',undefined,'?year=2026&from=2026-12-01&to=2026-12-08',true)).suggestions.length,0);
await call(login,'POST',{username:'editor@test',password,planningApp:true},'',true);data=await call(planning,'GET',undefined,'?year=2026',true);assert.equal(data.canEdit,true);assert.equal(data.canSuggest,false);assert.equal((await call(planning,'POST',another,'',true)).status,403);
extraCookies.set('tc_planning_session',planningToken);
// v14-3: everyone with planning access can read all pending suggestions.
assert.equal((await call(planning,'POST',{...another,day:'2027-11-05',value:'Nästa års förslag'})).status,200);
await engine.query("INSERT INTO users(email,username,name,role,password_hash,password_salt,created_at) VALUES('viewer@test','viewer@test','Read only','Chef',$1,$2,0)",[passwordHash,salt]);
await call(login,'POST',{username:'viewer@test',password,planningApp:true},'',true);
let all=await call(planning,'GET',undefined,'?suggestions=all',true);assert.equal(all.status,200,JSON.stringify(all));assert.ok(all.suggestions.some(s=>s.authorEmail==='admin@test'));assert.ok(all.suggestions.every(s=>s.status==='pending'));assert.ok(all.suggestions.some(s=>s.day==='2027-11-05'));assert.ok((await call(planning,'GET',undefined,'?year=2026',true)).suggestions.some(s=>s.authorEmail==='admin@test'));assert.equal((await call(planning,'POST',{action:'review',id:row.id,decision:'reject'},'',true)).status,403);
assert.equal((await call(planning,'POST',another,'',true)).status,403);
await engine.query("UPDATE panel_module_access SET restricted=true,user_emails='[]'::jsonb WHERE kind='planning'");assert.equal((await call(planning,'GET',undefined,'?suggestions=all',true)).status,403);
await engine.query("UPDATE panel_module_access SET restricted=false WHERE kind='planning'");extraCookies.set('tc_planning_session',planningToken);
// v14-4: only the author can withdraw pending proposals, including app sessions.
all=await call(planning,'GET',undefined,'?suggestions=all',true);const own=all.suggestions.find(s=>s.authorEmail==='proposer@test'),other=all.suggestions.find(s=>s.authorEmail==='admin@test');assert.ok(own&&other);
const beforeCells=(await engine.query('SELECT * FROM planning_cells ORDER BY day,column_id,field')).rows;
assert.equal((await call(planning,'POST',{action:'withdraw',id:other.id},'',true)).status,403,'no withdrawing another author, even with edit rights');
let counted=await call(planning,'GET',undefined,'?year=2026',true);assert.equal(counted.suggestionCount,all.suggestions.length);
result=await call(planning,'POST',{action:'withdraw',id:own.id},'',true);assert.equal(result.status,200,JSON.stringify(result));assert.equal((await engine.query('SELECT status FROM planning_suggestions WHERE id=$1',[own.id])).rows[0].status,'withdrawn');assert.deepEqual((await engine.query('SELECT * FROM planning_cells ORDER BY day,column_id,field')).rows,beforeCells);
assert.equal((await call(planning,'POST',{action:'withdraw',id:own.id},'',true)).status,200,'retry is idempotent');assert.equal((await call(planning,'GET',undefined,'?year=2026',true)).suggestionCount,counted.suggestionCount-1);
assert.ok(!(await call(planning,'GET',undefined,'?suggestions=all',true)).suggestions.some(s=>s.id===own.id));
assert.equal((await call(planning,'POST',{action:'withdraw',id:'missing'},'',true)).status,404);
const approved=(await engine.query("SELECT id FROM planning_suggestions WHERE status='approved' AND author_email='proposer@test'")).rows[0];assert.ok(approved);assert.equal((await call(planning,'POST',{action:'withdraw',id:approved.id},'',true)).status,409);
// Author retains withdrawal of own pending proposal after suggestion rights are revoked.
result=await call(planning,'POST',{...another,day:'2026-11-06',value:'Tillfälligt förslag'},'',true);assert.equal(result.status,200,JSON.stringify(result));const revokeOwn=(await call(planning,'GET',undefined,'?suggestions=all',true)).suggestions.find(s=>s.proposedValue==='Tillfälligt förslag');await engine.query("UPDATE planning_settings SET suggester_emails='[]'::jsonb");assert.equal((await call(planning,'POST',{action:'withdraw',id:revokeOwn.id},'',true)).status,200);
// Website author can withdraw, but administrators cannot withdraw another author's proposal.
assert.equal((await call(planning,'POST',{action:'withdraw',id:other.id})).status,200);
// Logout revokes the remembered token server-side, preserves website session.
result=await call(logout,'POST',{},'',true);assert.equal(result.status,200,JSON.stringify(result));assert.equal(extraCookies.has('tc_planning_session'),false);assert.equal((await engine.query('SELECT * FROM sessions WHERE token_hash=$1',[hash(planningToken)])).rows.length,0);requestHeaders=new Headers();assert.equal((await auth.currentAccount()).email,'admin@test');
console.log('PASS v11: removed idle expiry; absolute expiry/disabled account; separate 8h/30d scoped cookies; no website privilege from app token; app write restriction; simultaneous rights/admin app proposals/read other authors; task+color atomic review; duplicate retry; stale color rejection; input validation; server-side logout revocation.');await engine.close();
})().catch(e=>{console.error(e);process.exitCode=1});
