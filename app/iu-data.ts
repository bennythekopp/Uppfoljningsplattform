import 'server-only';
import { db } from './database';
import { buildIUTemplate,type IUMoment,type IUOperationalCategory,type IUSimulatorGroup } from './iu-types';
export async function loadIUMoments(){
 const {results}=await db.prepare('SELECT id,kind,section,title,description,max_score AS maxScore,position,simulator_group_id AS simulatorGroupId,operational_category_id AS operationalCategoryId FROM iu_moments WHERE deleted_at IS NULL ORDER BY position,id').all<IUMoment>();return results;
}
export async function loadSimulatorGroups(moments?:IUMoment[]){
 const rows=moments||await loadIUMoments();
 const {results}=await db.prepare('SELECT id,title,description,position FROM iu_simulator_groups WHERE deleted_at IS NULL ORDER BY position,id').all<Omit<IUSimulatorGroup,'children'>>();
 return results.map(group=>({...group,children:rows.filter(row=>row.kind==='simulator'&&row.simulatorGroupId===group.id)}));
}
export async function loadOperationalCategories(){const {results}=await db.prepare('SELECT id,title,position FROM iu_operational_categories ORDER BY position,id').all<IUOperationalCategory>();return results}
export async function loadIUTemplate(){const moments=await loadIUMoments();return buildIUTemplate(moments,await loadSimulatorGroups(moments),await loadOperationalCategories())}
