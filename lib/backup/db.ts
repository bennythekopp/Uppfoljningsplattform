import pg from 'pg';
let pool:pg.Pool|undefined;
export function backupPool(){return pool??=new pg.Pool({connectionString:process.env.NETLIFY_DB_URL||process.env.DATABASE_URL,max:2,connectionTimeoutMillis:10000,idleTimeoutMillis:10000})}
