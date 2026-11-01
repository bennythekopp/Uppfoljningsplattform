import pg from 'pg';
import {runDigest} from '../../lib/planning-mail';
import {runScheduled} from '../../lib/scheduler-gate';
import {nextMailCheck,localMinute} from '../../lib/scheduler-times';
export default async function(){await runScheduled('mail',async()=>{
 const pool=new pg.Pool({connectionString:process.env.NETLIFY_DB_URL||process.env.DATABASE_URL,max:1,connectionTimeoutMillis:5000});
 const client=await pool.connect();try{
  await runDigest(client);
  const s=(await client.query('SELECT *,last_sent_day::text AS sent_day FROM planning_mail_settings WHERE id=1')).rows[0];
  const pending=(await client.query('SELECT review_required FROM planning_mail_outbox WHERE sent_at IS NULL LIMIT 1')).rows[0];
  if(pending)return pending.review_required?null:Date.now()+15*60000;
  // No work today? A new proposal/settings change explicitly wakes this gate.
  const now=Date.now();return nextMailCheck(s,now,localMinute(now).time<String(s?.send_time||''));
 }finally{client.release();await pool.end()}
})}
export const config={schedule:'* * * * *'};
