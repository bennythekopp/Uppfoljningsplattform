const fs=require('fs'),assert=require('node:assert/strict'),Module=require('module'),crypto=require('crypto'),path=require('path'),root=path.resolve(__dirname,'..'),ts=require(root+'/node_modules/typescript'),{PGlite}=require('@electric-sql/pglite');let engine,token='',requestApp=false;require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:1,target:9,esModuleInterop:true}}).outputText,f);const extraCookies=new Map(),cookieOptions=new Map();const jar={get:n=>n==='tc_session'?(token?{value:token}:undefined):(extraCookies.has(n)?{value:extraCookies.get(n)}:undefined),set:(n,v,o)=>{if(n==='tc_session')token=v;else{if(o?.maxAge===0)extraCookies.delete(n);else extraCookies.set(n,v);cookieOptions.set(n,o)}},delete:n=>{if(n==='tc_session')token='';else extraCookies.delete(n)}},orig=Module._load;Module._load=function(id){if(id==='@netlify/blobs')return {getStore:()=>({setJSON:async()=>({modified:true})})};if(id==='server-only')return {};if(id==='next/headers')return {cookies:async()=>jar,headers:async()=>new Headers(requestApp?{'x-tc-app':'planning'}:{})};if(id==='pg'){const query=async(sql,args)=>{if(sql.includes('pg_try_advisory_lock'))return {rows:[{locked:true}],rowCount:1};if(sql.includes('pg_advisory_unlock'))return {rows:[],rowCount:1};if(sql.includes('pg_advisory_xact_lock'))return {rows:[],rowCount:1};let r;try{r=await engine.query(sql,args)}catch(e){console.error('QUERY FAILED',sql,e.message);throw e}return {rows:r.rows,rowCount:r.affectedRows||r.rows.length}};return {__esModule:true,default:{types:{setTypeParser(){}},Pool:class{query(...args){return query(...args)}async connect(){return {query,release(){}}}}}}}return orig.apply(this,arguments)};process.env.DATABASE_URL='postgres://qa';process.env.NETLIFY='true';process.env.APP_ORIGIN='https://handledare.netlify.app';
(async()=>{engine=new PGlite();for(const f of fs.readdirSync(root+'/netlify/database/migrations').sort())await engine.exec(fs.readFileSync(root+'/netlify/database/migrations/'+f,'utf8').replace("PERFORM pg_advisory_xact_lock(hashtextextended('schedule-membership:'||NEW.user_email,0));",'PERFORM 1;'));
for(const [role,key,email,name]of[['Administratör','a','admin@test','Anna Svensson'],['Instruktör','b','instructor@test','Erik Nilsson'],['Chef','c','chief@test','Chef']]){token=key.repeat(64);await engine.query('INSERT INTO users(email,username,name,role,created_at) VALUES($1,$2,$3,$4,0)',[email,key,name,role]);await engine.query('INSERT INTO sessions(token_hash,user_email,expires_at,last_activity_at) VALUES($1,$2,$3,$4)',[crypto.createHash('sha256').update(token).digest('hex'),email,Date.now()+3600000,Date.now()])}token='a'.repeat(64);

const auth=require(root+'/app/auth.ts'),block=require(root+'/app/api/users/block/route.ts'),login=require(root+'/app/api/login/route.ts');
const salt=auth.randomToken(),hash=await auth.passwordHash('TestPassword123!',salt);
await engine.query("UPDATE users SET username='testuser',password_hash=$1,password_salt=$2 WHERE email='instructor@test'",[hash,salt]);
async function mutate(api,body){return api.POST(new Request(process.env.APP_ORIGIN+'/api/test',{method:'POST',headers:{origin:process.env.APP_ORIGIN,'content-type':'application/json','x-forwarded-for':'127.0.0.1'},body:JSON.stringify(body)}))}
let res=await mutate(block,{email:'instructor@test',blocked:true});assert.equal(res.status,200,await res.clone().text());
assert.equal((await engine.query("SELECT count(*)::int AS n FROM sessions WHERE user_email='instructor@test'")).rows[0].n,0);
for(const planningApp of [false,true]){res=await mutate(login,{username:'testuser',password:'TestPassword123!',planningApp});assert.equal(res.status,403,await res.clone().text());assert.equal((await res.json()).error,'Kontot spärrat')}
res=await mutate(login,{username:'testuser',password:'WrongPassword123!'});assert.equal(res.status,401);
res=await mutate(block,{email:'admin@test',blocked:true});assert.equal(res.status,400);
token='c'.repeat(64);res=await mutate(block,{email:'instructor@test',blocked:false});assert.equal(res.status,403);
token='a'.repeat(64);res=await mutate(block,{email:'instructor@test',blocked:false});assert.equal(res.status,200);
assert.equal((await engine.query("SELECT login_blocked_at FROM users WHERE email='instructor@test'")).rows[0].login_blocked_at,null);
res=await mutate(login,{username:'testuser',password:'TestPassword123!',planningApp:false});assert.equal(res.status,200,await res.clone().text());
assert.equal((await auth.currentUser()).email,'instructor@test');
token='a'.repeat(64);
const deadline=require(root+'/app/panel-deadline.ts');
assert.equal(deadline.deadlineTime('2026-11-03T09:00'),Date.parse('2026-11-03T08:00:00Z'));
assert.equal(deadline.deadlineTime('2026-07-03T09:00'),Date.parse('2026-07-03T07:00:00Z'));
assert.equal(deadline.itemIsOverdue({due:'2026-11-03T09:00',done:true,completedAt:Date.parse('2026-11-03T07:59Z')},Date.parse('2027-01-01')),false);
assert.equal(deadline.itemIsOverdue({due:'2026-11-03T09:00',done:true,completedAt:Date.parse('2026-11-03T08:01Z')}),true);
const panel=require(root+'/app/api/panel/route.ts');
res=await mutate(panel,{action:'save',kind:'task',scope:'private',data:{title:'Sent task',due:'2020-01-01T09:00',done:false}});assert.equal(res.status,200,await res.clone().text());const id=(await res.json()).id;
res=await mutate(panel,{action:'save',id,revision:1,data:{title:'Sent task',due:'2020-01-01T09:00',done:true,completedAt:1}});assert.equal(res.status,200,await res.clone().text());
let item=(await engine.query('SELECT data FROM panel_items WHERE id=$1',[id])).rows[0].data;assert.ok(item.completedAt>1);assert.ok(deadline.itemIsOverdue(item));const completed=item.completedAt;
res=await mutate(panel,{action:'save',id,revision:2,data:{...item,body:'edited',completedAt:1}});assert.equal(res.status,200);item=(await engine.query('SELECT data FROM panel_items WHERE id=$1',[id])).rows[0].data;assert.equal(item.completedAt,completed);
res=await mutate(panel,{action:'save',id,revision:3,data:{...item,done:false}});assert.equal(res.status,200);assert.equal((await engine.query('SELECT data FROM panel_items WHERE id=$1',[id])).rows[0].data.completedAt,null);
const {exportRows,calendarExport}=require(root+'/app/planning-export-data.ts');
const config={tours:[{code:'Natt',color:'#ff0000',passes:[{start:'21:00',end:'24:00',type:'Arbete'},{start:'00:00',end:'06:45',type:'Arbete'}],meal:false}],pattern:[['Natt']],startDate:'2026-11-02',year:2026};
const data={columns:[{id:'p',title:'Anna',kind:'person',userEmail:'a'},{id:'q',title:'Other',kind:'person',userEmail:'b'}],cells:[{day:'2026-11-02',columnId:'p',field:'tour',value:'Natt'},{day:'2026-11-02',columnId:'p',field:'task',value:'Text med åäö, semikolon; och \nrad'}],periods:[{id:'x',groupId:'g',startDate:'2026-01-01',config,assignments:[{userEmail:'a',row:0}]}]};
const rows=exportRows(data,'2026-11-02','2026-11-02','a','mine');assert.equal(rows.length,1);assert.equal(rows[0].tourColor,'#ff0000');
const ics=calendarExport(rows);assert.ok(ics.includes('DTEND;TZID=Europe/Stockholm:20261103T000000'));assert.ok(ics.includes('DTSTART;TZID=Europe/Stockholm:20261103T000000'));assert.ok(ics.includes('20261103T064500'));assert.ok(ics.includes('BEGIN:VTIMEZONE'));assert.ok(!ics.includes('Invalid'));
for(const line of ics.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);
const api=require(root+'/app/api/planning/export/route.ts');
const planning=require(root+'/app/api/planning/route.ts');
res=await planning.GET(new Request(process.env.APP_ORIGIN+'/api/planning?year=2026'));assert.equal(res.status,200);
const savedTour=require(root+'/app/grundschema-types.ts').tourValue({code:'8-16.30',color:'#ffff00',passes:[{start:'08:00',end:'16:30',type:'Arbete'}],meal:false});
for(const [field,value] of [['tour',savedTour],['task','Simulatorutbildning med grupp 2']])await engine.query('INSERT INTO planning_cells(day,column_id,field,value,updated_at,updated_by) VALUES($1,$2,$3,$4,$5,$6)', ['2026-11-03','person:instructor@test',field,value,Date.now(),'qa']);
fs.mkdirSync(root+'/../../v15-qa',{recursive:true});

for(const format of ['pdf','xlsx','apple','android']){
 res=await api.GET(new Request(process.env.APP_ORIGIN+'/api/planning/export?from=2026-11-02&to=2026-11-08&scope=all&format='+format));assert.equal(res.status,200,await res.clone().text());const bytes=Buffer.from(await res.arrayBuffer());fs.writeFileSync(root+'/../../v15-qa/export.'+format,bytes);
 if(format==='pdf')assert.equal(bytes.subarray(0,4).toString(),'%PDF');
 if(format==='xlsx'){const ExcelJS=require('exceljs'),b=new ExcelJS.Workbook();await b.xlsx.load(bytes);assert.equal(b.worksheets[0].getRow(1).getCell(1).value,'Datum');let yellow=false;b.worksheets[0].eachRow(r=>{if(r.getCell(3).value==='8-16.30'){yellow=r.getCell(3).fill.fgColor.argb==='FFffff00'}});assert.ok(yellow)}
 if(['apple','android'].includes(format))assert.ok(bytes.toString().includes('BEGIN:VCALENDAR'));
}
res=await api.GET(new Request(process.env.APP_ORIGIN+'/api/planning/export?from=2026-01-01&to=2028-01-01&scope=all&format=pdf'));assert.equal(res.status,400);
token='c'.repeat(64);res=await api.GET(new Request(process.env.APP_ORIGIN+'/api/planning/export?from=2026-11-02&to=2026-11-08&scope=all&format=apple'));assert.equal(res.status,403); // Module visibility is enforced for export too.

// Planning-only sessions can export, but cannot administer accounts.
requestApp=true;token='d'.repeat(64);await engine.query('INSERT INTO sessions(token_hash,user_email,expires_at,last_activity_at,session_scope) VALUES($1,$2,$3,$4,$5)',[crypto.createHash('sha256').update(token).digest('hex'),'admin@test',Date.now()+3600000,Date.now(),'planning']);
res=await api.GET(new Request(process.env.APP_ORIGIN+'/api/planning/export?from=2026-11-02&to=2026-11-08&scope=all&format=apple'));assert.equal(res.status,200,await res.clone().text());
res=await mutate(block,{email:'instructor@test',blocked:true});assert.equal(res.status,403);requestApp=false;token='a'.repeat(64);
// Actual log cell renderer preserves snapshot colours and removes colour-code text.
require.extensions['.css']=()=>{};require.extensions['.tsx']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:1,target:9,jsx:4,esModuleInterop:true}}).outputText,f);
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),Log=require(root+'/app/planning-log-value.tsx').default;
for(const [value,color,label] of [['FP · #ff0000','#ff0000','FP'],['8-16.30 · #ffff00','#ffff00','8-16.30']]){const html=renderToStaticMarkup(React.createElement(Log,{row:{field:'tour'},value}));assert.ok(html.includes('--planning-color:'+color));assert.ok(html.includes(label));assert.ok(!html.includes(' · #'))}
const literal=renderToStaticMarkup(React.createElement(Log,{row:{field:'task'},value:'Text · #ff0000'}));assert.ok(literal.includes('Text · #ff0000'));
console.log('PASS: account block/unblock, login messages, session revocation, admin guards, Swedish deadlines, completion persistence, calendar overnight/DST/escaping/folding, PDF/Excel/ICS routes and limits.');
await engine.close();
})().catch(async e=>{console.error(e);if(engine)await engine.close();process.exitCode=1});
