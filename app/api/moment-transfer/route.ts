import {secureApi} from '../../api-security';
import {currentUser,error} from '../../auth';
import {db,databaseTransaction} from '../../database';
import {loadIUMoments,loadOperationalCategories} from '../../iu-data';
import {loadExamTemplate} from '../../exam-data';
import {panelBody,PanelError,panelLog} from '../../panel-server';
export const dynamic='force-dynamic';
type Group={id:string,ids:string[]};
function valid(v:unknown):v is Group[]{return Array.isArray(v)&&v.length<=300&&v.every(g=>g&&typeof g.id==='string'&&g.id.length<=200&&Array.isArray(g.ids)&&g.ids.length<=5000&&g.ids.every((id:unknown)=>typeof id==='string'&&id.length<=200))&&new Set(v.map(g=>g.id)).size===v.length&&new Set(v.flatMap(g=>g.ids)).size===v.flatMap(g=>g.ids).length}
async function post(req:Request){try{const u=(await currentUser())!,b=await panelBody(req,1000000);if(!['iu','exam'].includes(b.area)||!valid(b.groups)||!valid(b.previous))throw new PanelError('Ogiltig flyttning.');return await databaseTransaction(async()=>{
 await db.prepare('SELECT pg_advisory_xact_lock(hashtextextended(?,0))').bind('template-order:'+b.area).first();
 if(b.area==='iu')await db.prepare('LOCK TABLE iu_moments,iu_operational_categories,display_orders IN SHARE ROW EXCLUSIVE MODE').run();
 else {await db.prepare('SELECT pg_advisory_xact_lock(hashtextextended(?,0))').bind(JSON.stringify(['exam','template'])).first();await db.prepare('LOCK TABLE exam_templates,display_orders IN SHARE ROW EXCLUSIVE MODE').run()}
 let actual:Group[],exam:any;
 if(b.area==='iu'){const categories=await loadOperationalCategories(),rows=(await loadIUMoments()).filter(m=>m.kind==='op');actual=[...categories.map(c=>({id:c.id,ids:rows.filter(m=>m.operationalCategoryId===c.id).map(m=>m.id)})),{id:'uncategorized',ids:rows.filter(m=>!categories.some(c=>c.id===m.operationalCategoryId)).map(m=>m.id)}]}
 else {exam=(await loadExamTemplate()).find(g=>g.id===b.kind&&g.part==='op');if(!exam)throw new PanelError('Underlaget finns inte.',404);actual=[...(exam.categories||[]).map((c:any)=>({id:c.id,ids:exam.moments.filter((m:any)=>m.categoryId===c.id).map((m:any)=>m.id)})),{id:'uncategorized',ids:exam.moments.filter((m:any)=>!exam.categories.some((c:any)=>c.id===m.categoryId)).map((m:any)=>m.id)}]}
 const normalized=(groups:Group[])=>[...groups].sort((a,b)=>a.id.localeCompare(b.id));
 if(JSON.stringify(normalized(actual))!==JSON.stringify(normalized(b.previous)))throw new PanelError('Underlaget har ändrats. Läs in det igen innan du flyttar.',409);
 const all=actual.flatMap(g=>g.ids);if(b.groups.length!==actual.length||b.groups.some((g:Group)=>!actual.some(a=>a.id===g.id))||b.groups.flatMap((g:Group)=>g.ids).length!==all.length||b.groups.flatMap((g:Group)=>g.ids).some((id:string)=>!all.includes(id)))throw new PanelError('Flyttningen måste behålla alla moment och kategorier.');
 const now=Date.now();
 for(const g of b.groups as Group[]){
  if(b.area==='iu'){for(const id of g.ids)await db.prepare("UPDATE iu_moments SET operational_category_id=?,updated_at=?,updated_by=? WHERE id=? AND kind='op' AND deleted_at IS NULL").bind(g.id==='uncategorized'?null:g.id,now,u.email,id).run();await saveOrder('iu-moments:'+g.id,g.ids,now,u.email)}
 }
 if(b.area==='exam'){const ordered=(b.groups as Group[]).flatMap(g=>g.ids.map(id=>({...exam.moments.find((m:any)=>m.id===id),categoryId:g.id==='uncategorized'?null:g.id})));await db.prepare('UPDATE exam_templates SET moments=?::jsonb WHERE id=?').bind(JSON.stringify(ordered),exam.id).run();await saveOrder('exam-moments:'+exam.id,ordered.map(m=>m.id),now,u.email)}
 await panelLog(u,'Bedömningsmoment flyttade',b.area==='iu'?'Operativ IU':'Operativ examen');return Response.json({ok:true});})}catch(e){return error(e instanceof PanelError?e.message:'Flyttningen kunde inte sparas.',e instanceof PanelError?e.status:503)}}
async function saveOrder(scope:string,ids:string[],now:number,email:string){await db.prepare('INSERT INTO display_orders(scope,item_ids,updated_at,updated_by) VALUES(?,?::jsonb,?,?) ON CONFLICT(scope) DO UPDATE SET item_ids=EXCLUDED.item_ids,updated_at=EXCLUDED.updated_at,updated_by=EXCLUDED.updated_by').bind(scope,JSON.stringify(ids),now,email).run()}
export const POST=secureApi('/api/moment-transfer',post);
