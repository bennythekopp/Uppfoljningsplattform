import pg from 'pg';
pg.types.setTypeParser(20,value=>Number(value));
import {runScheduled} from '../../lib/scheduler-gate';
import {runPlanningPush,type PushDatabase} from '../../lib/planning-push';
export default async function(){await runScheduled('push',async()=>{
 const pool=new pg.Pool({connectionString:process.env.NETLIFY_DB_URL||process.env.DATABASE_URL,max:1,connectionTimeoutMillis:5000});
 const client=await pool.connect();
 const db:PushDatabase={prepare(sql:string){let i=0;const query=sql.replace(/\?/g,()=>'$'+(++i)).replace(/\bAS\s+([a-z_]*[A-Z][A-Za-z_]*)\b/g,(_,alias)=>'AS "'+alias+'"');const statement=(values:unknown[])=>({bind(...next:unknown[]){return statement(next)},async first<T>(){return (await client.query(query,values)).rows[0] as T||null},async all<T>(){return {results:(await client.query(query,values)).rows as T[]}},async run(){return client.query(query,values)}});return statement([])}};
 try{await client.query('BEGIN');const next=await runPlanningPush(db);await client.query('COMMIT');return next}catch(e){await client.query('ROLLBACK');throw e}finally{client.release();await pool.end()}
})}
export const config={schedule:'* * * * *'};
