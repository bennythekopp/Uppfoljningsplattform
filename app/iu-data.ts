import 'server-only';
import { db } from './database';
import { buildIUTemplate,type IUMoment,type IUOperationalCategory,type IUSimulatorGroup } from './iu-types';
export async function loadIUMoments(connection=db){
 const {results}=await connection.prepare('SELECT id,kind,section,title,description,max_score AS maxScore,position,simulator_group_id AS simulatorGroupId,operational_category_id AS operationalCategoryId FROM iu_moments WHERE deleted_at IS NULL ORDER BY position,id').all<IUMoment>();return results;
}
export async function loadSimulatorGroups(moments?:IUMoment[],connection=db){
 const rows=moments||await loadIUMoments(connection);
 const {results}=await connection.prepare('SELECT id,title,description,position FROM iu_simulator_groups WHERE deleted_at IS NULL ORDER BY position,id').all<Omit<IUSimulatorGroup,'children'>>();
 return results.map(group=>({...group,children:rows.filter(row=>row.kind==='simulator'&&row.simulatorGroupId===group.id)}));
}
export async function loadOperationalCategories(connection=db){const {results}=await connection.prepare('SELECT id,title,position FROM iu_operational_categories ORDER BY position,id').all<IUOperationalCategory>();return results}
export async function loadIUTemplate(connection=db){const moments=await loadIUMoments(connection);return buildIUTemplate(moments,await loadSimulatorGroups(moments,connection),await loadOperationalCategories(connection))}
