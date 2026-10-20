import 'server-only';
import {db} from './database';
export type MomentArea='student'|'iu-op'|'iu-simulator'|'kp'|'exam';
export async function hiddenMomentIds(area:MomentArea,connection=db){const rows=await connection.prepare('SELECT moment_id AS id FROM hidden_moments WHERE area=?').bind(area).all<{id:string}>();return new Set(rows.results.map(row=>row.id))}
export async function withMomentVisibility<T extends {id:string|number}>(area:MomentArea,rows:T[],connection=db){const ids=await hiddenMomentIds(area,connection);return rows.map(row=>({...row,hidden:ids.has(String(row.id))}))}
