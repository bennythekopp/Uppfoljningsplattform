import 'server-only';
import {db} from './database';
import {PanelError,short,type PanelActor} from './panel-server';
import {planningDate,planningLog} from './planning-server';
import {baseTour,personPeriodFor,type PlanningPeriod,type PlanningColumn} from './planning-types';
import {tourLogValue,findTour} from './grundschema-types';
/** Caller holds a transaction. Used by direct edits and reviewed proposals. */
export async function savePlanningCell(u:PanelActor,b:any){
  const day=planningDate(b.day),id=short(b.columnId,300),column=await db.prepare('SELECT id,title,kind,user_email AS userEmail FROM planning_columns WHERE id=? AND deleted_at IS NULL').bind(id).first<PlanningColumn>();if(!column)throw new PanelError('Kolumnen finns inte längre.',404);
  if(!(column.kind==='shared'?['shared','color'].includes(b.field):['tour','task','color'].includes(b.field))||typeof b.value!=='string'||b.value.length>4000||!Number.isInteger(b.revision)||b.revision<0)throw new PanelError('Kontrollera rutans innehåll.');
  if(b.field==='color'&&b.value!==''&&!/^#[0-9a-f]{6}$/i.test(b.value))throw new PanelError('Välj en giltig färg.');
  await db.prepare('SELECT pg_advisory_xact_lock(hashtextextended(?,0))').bind(JSON.stringify([day,id])).first();
  const old=await db.prepare('SELECT value,revision FROM planning_cells WHERE day=?::date AND column_id=? AND field=? FOR UPDATE').bind(day,id,b.field).first<{value:string,revision:number}>();
  if((old?.value??null)===b.value)return Response.json({cell:{day,columnId:id,field:b.field,value:b.value,revision:old!.revision,updatedAt:Date.now(),updatedBy:u.name}});
  if((old?.revision||0)!==b.revision) return Response.json({error:'Rutan har ändrats. Din text finns kvar. Välj vilken version du vill behålla.',conflict:old||{value:'',revision:0}}, {status:409});
  const cell=await db.prepare('INSERT INTO planning_cells(day,column_id,field,value,updated_at,updated_by) VALUES(?::date,?,?,?,?,?) ON CONFLICT(day,column_id,field) DO UPDATE SET value=EXCLUDED.value,revision=planning_cells.revision+1,updated_at=EXCLUDED.updated_at,updated_by=EXCLUDED.updated_by RETURNING day::text AS day,column_id AS columnId,field,value,revision,updated_at AS updatedAt,updated_by AS updatedBy').bind(day,id,b.field,b.value,Date.now(),u.name).first();
  const periods=b.field==='tour'?(await db.prepare('SELECT id,group_id AS groupId,name,start_date::text AS startDate,list_change AS listChange,config,assignments FROM planning_schedule_periods ORDER BY start_date,created_at,id').all<PlanningPeriod>()).results:[],memberships=b.field==='tour'?(await db.prepare('SELECT id,user_email AS userEmail,group_id AS groupId,row_number AS row,start_date::text AS startDate,end_date::text AS endDate FROM schedule_memberships ORDER BY start_date').all<any>()).results:[],config=personPeriodFor(periods,column,day,memberships)?.config||{tours:[]},previous=old?.value??(b.field==='tour'?baseTour(periods,column,day,memberships):'');
  const linkedCells=[];
  if(b.field==='tour'&&findTour(config,b.value)?.code.trim().toLocaleLowerCase('sv-SE')==='semester'){
   // Choosing Semester resets a prior manual colour, so both cells follow its
   // saved tour colour. A later explicit colour choice can still override it.
   const color=await db.prepare("UPDATE planning_cells SET value='',revision=revision+1,updated_at=?,updated_by=? WHERE day=?::date AND column_id=? AND field='color' AND value<>'' RETURNING day::text AS day,column_id AS columnId,field,value,revision,updated_at AS updatedAt,updated_by AS updatedBy").bind(Date.now(),u.name,day,id).first();if(color)linkedCells.push(color);
  }
  await planningLog(u,b.field==='color'?'Cellfärg ändrad':'Ruta ändrad',{day,columnId:id,columnName:column.title,field:b.field,previous:b.field==='tour'?tourLogValue(config,previous):previous,next:b.field==='tour'?tourLogValue(config,b.value):b.value});return Response.json({cell,linkedCells});

}
