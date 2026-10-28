import pg from 'pg';
import {runDigest} from '../../lib/planning-mail';
export default async function(){const pool=new pg.Pool({connectionString:process.env.NETLIFY_DB_URL||process.env.DATABASE_URL,max:1,connectionTimeoutMillis:5000});const client=await pool.connect();try{await runDigest(client)}finally{client.release();await pool.end()}}
export const config={schedule:'* * * * *'};
