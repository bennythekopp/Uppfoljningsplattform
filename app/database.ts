import 'server-only';
import pg from 'pg';

// Netlify Database provides NETLIFY_DB_URL to build and function runtimes.
// DATABASE_URL also supports a local or separately managed Postgres database.
let pool: pg.Pool | undefined;
function getPool() {
  if (!pool) {
    const connectionString=process.env.NETLIFY_DB_URL || process.env.DATABASE_URL;
    if (!connectionString) throw new Error('Netlify Database is not configured');
    pg.types.setTypeParser(20, value => Number(value)); // milliseconds and small counts
    pool=new pg.Pool({connectionString,max:4,connectionTimeoutMillis:10000,idleTimeoutMillis:30000});
  }
  return pool;
}
function toPostgres(query:string) {
  let index=0;
  return query
    .replace(/\?/g,()=>`$${++index}`)
    .replace(/\bAS\s+([a-z_]*[A-Z][A-Za-z_]*)\b/g,(_,alias)=>`AS "${alias}"`)
    .replace(/ORDER BY (\w+\.)?name COLLATE NOCASE/gi,(_,prefix)=>`ORDER BY lower(${prefix||''}name)`)
    .replace(/ORDER BY (\w+\.)?name COLLATE NOCASE/gi,(_,prefix)=>`ORDER BY lower(${prefix||''}name)`);
}
export const db={
  prepare(sql:string){
    const statement=toPostgres(sql);
    const make=(values:unknown[])=>({
      async all<T=Record<string,unknown>>(){const r=await getPool().query(statement,values);return {results:r.rows as T[]}},
      async first<T=Record<string,unknown>>(){const r=await getPool().query(statement,values);return (r.rows[0] as T|undefined)||null},
      async run(){const returning=/^INSERT INTO custom_moments\b/i.test(statement)?statement+' RETURNING id':statement;const r=await getPool().query(returning,values);return {meta:{changes:r.rowCount||0,last_row_id:r.rows[0]?.id||0}}}
    });
    return {...make([]),bind(...values:unknown[]){return make(values)}};
  }
};
