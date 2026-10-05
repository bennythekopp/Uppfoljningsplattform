import 'server-only';
import { db } from './database';
import { buildIUTemplate,type IUMoment } from './iu-types';
export async function loadIUMoments(){
 const {results}=await db.prepare('SELECT id,kind,section,title,description,max_score AS maxScore,position FROM iu_moments WHERE deleted_at IS NULL ORDER BY position,id').all<IUMoment>();
 return results;
}
export async function loadIUTemplate(){return buildIUTemplate(await loadIUMoments())}
