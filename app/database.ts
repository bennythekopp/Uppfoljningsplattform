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
export async function removeStudent(id:string) {
  const client=await getPool().connect();
  try {
    await client.query('BEGIN');
    const exists=await client.query('SELECT id FROM students WHERE id=$1 FOR UPDATE',[id]);
    if (!exists.rowCount) { await client.query('ROLLBACK'); return false; }
    await client.query('DELETE FROM comments WHERE student_id=$1',[id]);
    await client.query('DELETE FROM assessments WHERE student_id=$1',[id]);
    await client.query('DELETE FROM students WHERE id=$1',[id]);
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}
export async function removeMoment(id:number,deletedBy:string) {
  const client=await getPool().connect();
  try {
    await client.query('BEGIN');
    if(id>=1000000){
      const found=await client.query('SELECT id FROM custom_moments WHERE id=$1 FOR UPDATE',[id-1000000]);
      if(!found.rowCount){await client.query('ROLLBACK');return false}
    }else{
      const found=await client.query('SELECT item_id FROM deleted_moments WHERE item_id=$1',[id]);
      if(found.rowCount){await client.query('ROLLBACK');return false}
      await client.query('INSERT INTO deleted_moments(item_id,deleted_at,deleted_by) VALUES($1,$2,$3)',[id,Date.now(),deletedBy]);
    }
    await client.query('DELETE FROM comments WHERE item_id=$1',[id]);
    await client.query('DELETE FROM assessments WHERE item_id=$1',[id]);
    if(id>=1000000)await client.query('DELETE FROM custom_moments WHERE id=$1',[id-1000000]);
    else await client.query('DELETE FROM moment_edits WHERE item_id=$1',[id]);
    await client.query('COMMIT');
    return true;
  }catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
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
