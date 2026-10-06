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
export async function removePerson(id:string,source:'students'|'personnel') {
  const client=await getPool().connect();
  try {
    await client.query('BEGIN');
    const exists=await client.query(`SELECT id FROM ${source} WHERE id=$1 AND moved_at IS NULL FOR UPDATE`,[id]);
    if (!exists.rowCount) { await client.query('ROLLBACK'); return false; }
    await client.query('DELETE FROM comments WHERE student_id=$1',[id]);
    await client.query('DELETE FROM assessments WHERE student_id=$1',[id]);
    await client.query('DELETE FROM students WHERE id=$1',[id]);
    await client.query('DELETE FROM personnel WHERE id=$1',[id]);
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}
export async function renamePerson(id:string,source:'students'|'personnel',name:string) {
  const client=await getPool().connect();
  try {
    await client.query('BEGIN');
    const found=await client.query(`SELECT id FROM ${source} WHERE id=$1 AND moved_at IS NULL FOR UPDATE`,[id]);
    if(!found.rowCount){await client.query('ROLLBACK');return false}
    await client.query('UPDATE students SET name=$2 WHERE id=$1',[id,name]);
    await client.query('UPDATE personnel SET name=$2 WHERE id=$1',[id,name]);
    await client.query('COMMIT');return true;
  }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
}
export async function movePerson(id:string,source:'students'|'personnel',actor:string) {
  const destination=source==='students'?'personnel':'students';
  const client=await getPool().connect();
  try{
    await client.query('BEGIN');
    const found=await client.query(`SELECT id,name FROM ${source} WHERE id=$1 AND moved_at IS NULL FOR UPDATE`,[id]);
    if(!found.rowCount){await client.query('ROLLBACK');return null}
    const {name}=found.rows[0] as {name:string};
    const existing=await client.query(`SELECT id FROM ${destination} WHERE id=$1 FOR UPDATE`,[id]);
    if(existing.rowCount)await client.query(`UPDATE ${destination} SET name=$2,moved_at=NULL WHERE id=$1`,[id,name]);
    else await client.query(`INSERT INTO ${destination}(id,name,created_at,created_by,moved_at) VALUES($1,$2,$3,$4,NULL)`,[id,name,Date.now(),actor]);
    await client.query(`UPDATE ${source} SET moved_at=$2 WHERE id=$1`,[id,Date.now()]);
    await client.query('COMMIT');return {id,name};
  }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
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

export type SimulatorChildInput={id?:string,title:string,description:string,maxScore:number};
export async function saveSimulatorGroup(input:{id?:string,title:string,description:string,children:SimulatorChildInput[]},actor:string){
 const client=await getPool().connect();
 try{
  await client.query('BEGIN');const now=Date.now(),id=input.id||'sim-group-'+crypto.randomUUID();
  if(input.id){const found=await client.query('SELECT id FROM iu_simulator_groups WHERE id=$1 AND deleted_at IS NULL FOR UPDATE',[id]);if(!found.rowCount){await client.query('ROLLBACK');return null}}
  const existing=await client.query('SELECT id FROM iu_moments WHERE simulator_group_id=$1 AND deleted_at IS NULL FOR UPDATE',[id]);
  const allowed=new Set(existing.rows.map(row=>row.id));
  if(input.children.some(child=>child.id&&!allowed.has(child.id)))throw Error('Delmomentet tillhör inte momentet');
  if(input.id)await client.query('UPDATE iu_simulator_groups SET title=$2,description=$3,updated_at=$4,updated_by=$5 WHERE id=$1',[id,input.title,input.description,now,actor]);
  else await client.query('INSERT INTO iu_simulator_groups(id,title,description,position,updated_at,updated_by) SELECT $1,$2,$3,COALESCE(MAX(position),0)+1,$4,$5 FROM iu_simulator_groups',[id,input.title,input.description,now,actor]);
  const kept:string[]=[];
  for(const [index,child] of input.children.entries()){
   const childId=child.id||'iu-'+crypto.randomUUID();kept.push(childId);
   if(child.id)await client.query('UPDATE iu_moments SET section=$2,title=$3,description=$4,max_score=$5,position=$6,updated_at=$7,updated_by=$8 WHERE id=$1 AND simulator_group_id=$9 AND deleted_at IS NULL',[childId,input.title,child.title,child.description,child.maxScore,index+1,now,actor,id]);
   else await client.query("INSERT INTO iu_moments(id,kind,section,title,description,max_score,position,updated_at,updated_by,simulator_group_id) VALUES($1,'simulator',$2,$3,$4,$5,$6,$7,$8,$9)",[childId,input.title,child.title,child.description,child.maxScore,index+1,now,actor,id]);
  }
  await client.query('UPDATE iu_moments SET deleted_at=$2,updated_at=$2,updated_by=$3 WHERE simulator_group_id=$1 AND deleted_at IS NULL AND NOT(id=ANY($4::text[]))',[id,now,actor,kept]);
  await client.query('COMMIT');return {id};
 }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
}
export async function deleteSimulatorGroup(id:string,actor:string){
 const client=await getPool().connect();try{
  await client.query('BEGIN');const found=await client.query('SELECT id FROM iu_simulator_groups WHERE id=$1 AND deleted_at IS NULL FOR UPDATE',[id]);if(!found.rowCount){await client.query('ROLLBACK');return false}
  const now=Date.now();await client.query('UPDATE iu_simulator_groups SET deleted_at=$2,updated_at=$2,updated_by=$3 WHERE id=$1',[id,now,actor]);await client.query('UPDATE iu_moments SET deleted_at=$2,updated_at=$2,updated_by=$3 WHERE simulator_group_id=$1 AND deleted_at IS NULL',[id,now,actor]);await client.query('COMMIT');return true;
 }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
}
