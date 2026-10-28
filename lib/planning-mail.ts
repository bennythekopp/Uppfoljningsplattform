import type {PoolClient} from 'pg';
import {baseTour,personPeriodFor,type PlanningPeriod,type PlanningColumn} from '../app/planning-types';
import {findTour,addDays} from '../app/grundschema-types';
export function localClock(now=new Date()){const parts=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now),get=(k:string)=>parts.find(p=>p.type===k)!.value;return {day:get('year')+'-'+get('month')+'-'+get('day'),time:get('hour')+':'+get('minute')}}
export function workingTour(code:string,period?:PlanningPeriod){const t=period?findTour(period.config,code):undefined,label=(t?.code||code).trim();return !!label&&!/^(FP|ledig.*|semester|sjuk.*|föräldraledig.*|tjänstledig.*)$/i.test(label)}
const esc=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function digestMessage(rows:any[],day:string,url:string){const field=(s:string)=>s==='tour'?'Tur':s==='task'?'Uppgift':'Text',date=(d:string)=>d.slice(8)+'/'+d.slice(5,7);const text=rows.map(s=>`${s.column_name} · ${date(s.day)} · ${field(s.field)}\n${s.previous_label||'Tomt'} → ${s.proposed_label||'Tomt'}\nFörslag av ${s.author_name}`).join('\n\n');return {subject:'Ändringsförslag i Planering – '+day,text:text+'\n\nÖppna Planering: '+url,html:`<!doctype html><html lang="sv"><meta charset="utf-8"><body style="font:14px Arial;color:#25292c;background:#f4f4f4;padding:16px"><main style="max-width:850px;margin:auto;background:white;padding:20px"><p style="border-bottom:2px solid #b00000;padding-bottom:10px">Instruktörer · TC BODEN</p><h2>Ändringsförslag</h2><p>${rows.length} nya förslag</p><table style="border-collapse:collapse;width:100%;font-size:12px"><thead><tr style="background:#eee;text-align:left"><th>Person / datum</th><th>Nuvarande → Föreslaget</th><th>Förslag av</th></tr></thead><tbody>${rows.map(s=>`<tr><td style="padding:8px;border-bottom:1px solid #ddd"><b>${esc(s.column_name)}</b><br>${date(s.day)} · ${field(s.field)}</td><td style="padding:8px;border-bottom:1px solid #ddd;white-space:pre-wrap;overflow-wrap:anywhere"><span style="background:#f0f1f2;padding:4px">${esc(s.previous_label||'Tomt')}</span> → <span style="background:#fce9e9;padding:4px">${esc(s.proposed_label||'Tomt')}</span></td><td style="padding:8px;border-bottom:1px solid #ddd">${esc(s.author_name)}${s.status!=='pending'?'<br>'+esc(s.status==='approved'?'Godkänt':'Slopat'):''}</td></tr>`).join('')}</tbody></table><p><a href="${esc(url)}" style="display:inline-block;padding:9px 14px;background:#b00000;color:white;text-decoration:none;border-radius:5px">Öppna Planering</a></p></main></body></html>`}}
/** Serialized outbox with immutable payload and provider idempotency. No browser session needed. */
export async function runDigest(c:PoolClient,now=new Date(),send:typeof fetch=fetch){
 const q=async(sql:string,values:any[]=[])=> (await c.query(sql,values)).rows;
 await c.query('BEGIN');try{
 await c.query("SELECT pg_advisory_xact_lock(hashtextextended('planning-mail-worker',0))");
 const [s]=await q('SELECT *,last_sent_day::text AS sent_day FROM planning_mail_settings WHERE id=1 FOR UPDATE');const clock=localClock(now);
 if(!s?.enabled||!process.env.RESEND_API_KEY||!process.env.PLANNING_MAIL_FROM){await c.query('COMMIT');return}
 const [person]=await q("SELECT role FROM users WHERE email=$1 AND disabled_at IS NULL AND role IN('Administratör','Instruktör')",[s.recipient_user]);const [access]=await q("SELECT restricted,user_emails FROM panel_module_access WHERE kind='planning'");
 if(!person||person.role!=='Administratör'&&(!access||access.restricted&&!access.user_emails.includes(s.recipient_user)))throw Error('Mottagaren saknar tillgång till Planering.');
 let [out]=await q('SELECT * FROM planning_mail_outbox WHERE sent_at IS NULL');
 if(out?.review_required){await c.query('COMMIT');return}
 if(out&&(now.getTime()-Number(out.created_at)>23*3600000||out.payload.to[0]!==s.recipient_email)){
 await q("UPDATE planning_mail_outbox SET review_required=true,last_error='Kontrollera det osäkra utskicket hos Resend innan kön återupptas.' WHERE id=$1",[out.id]);await q("UPDATE planning_mail_settings SET last_error='Ett osäkert utskick behöver kontrolleras hos Resend.' WHERE id=1");await c.query('COMMIT');return}
 if(!out){
 if(clock.time<s.send_time||s.sent_day===clock.day){await c.query('COMMIT');return}
 if(s.cadence==='workday'){
 const periods=await q('SELECT id,group_id AS "groupId",name,start_date::text AS "startDate",config,assignments FROM planning_schedule_periods ORDER BY start_date,created_at,id') as PlanningPeriod[],memberships=await q('SELECT user_email AS "userEmail",group_id AS "groupId",row_number AS row,start_date::text AS "startDate",end_date::text AS "endDate" FROM schedule_memberships ORDER BY start_date'),column={userEmail:s.recipient_user} as PlanningColumn;
 const [cell]=await q("SELECT value FROM planning_cells WHERE day=$1 AND column_id=$2 AND field='tour'",[clock.day,'person:'+s.recipient_user]);const code=cell?.value??baseTour(periods,column,clock.day,memberships as any),period=personPeriodFor(periods,column,clock.day,memberships as any);
 if(!workingTour(code,period)){await c.query('COMMIT');return}
 }
 const rows=await q("SELECT s.*,s.day::text AS day,c.title AS column_name FROM planning_suggestions s JOIN planning_columns c ON c.id=s.column_id WHERE s.status<>'superseded' AND NOT EXISTS(SELECT 1 FROM planning_mailed_suggestions m WHERE m.suggestion_seq=s.seq) ORDER BY s.seq");if(!rows.length){await c.query('COMMIT');return}
 const origin=new URL(process.env.APP_ORIGIN||process.env.URL||'https://handledare.netlify.app');if(origin.protocol!=='https:')throw Error('APP_ORIGIN måste vara en HTTPS-adress.');
 const payload={from:process.env.PLANNING_MAIL_FROM,to:[s.recipient_email],...digestMessage(rows,clock.day,origin.origin+'/?view=planning')};out={id:crypto.randomUUID(),send_day:clock.day,created_at:now.getTime(),payload,suggestion_seqs:rows.map(r=>String(r.seq))};
 await q('INSERT INTO planning_mail_outbox(id,send_day,created_at,payload,suggestion_seqs) VALUES($1,$2,$3,$4,$5)',[out.id,clock.day,out.created_at,JSON.stringify(payload),JSON.stringify(out.suggestion_seqs)]);
 }
 // Commit the frozen payload before any network request. A crash can retry exactly it.
 await c.query('COMMIT');await c.query('BEGIN');await c.query("SELECT pg_advisory_xact_lock(hashtextextended('planning-mail-worker',0))");
 const [fresh]=await q('SELECT * FROM planning_mail_outbox WHERE id=$1 FOR UPDATE',[out.id]);if(fresh.sent_at){await c.query('COMMIT');return}
 const response=await send('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'planning-'+out.id},body:JSON.stringify(out.payload),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('Mailtjänsten svarade med status '+response.status+'. Förslagen ligger kvar för nytt försök.');const result=await response.json();if(!result.id)throw Error('Mailtjänstens kvittens saknas.');
 await q('UPDATE planning_mail_outbox SET sent_at=$1,provider_id=$2,last_error=$3 WHERE id=$4',[now.getTime(),result.id,'',out.id]);for(const seq of out.suggestion_seqs)await q('INSERT INTO planning_mailed_suggestions(suggestion_seq,outbox_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[seq,out.id]);await q("UPDATE planning_mail_settings SET last_sent_at=$1,last_sent_day=$2,last_error='' WHERE id=1",[now.getTime(),out.send_day]);await c.query('COMMIT');
 }catch(e){await c.query('ROLLBACK');await c.query('UPDATE planning_mail_settings SET last_error=$1 WHERE id=1',[(e as Error).message.slice(0,500)]);throw e}
}
