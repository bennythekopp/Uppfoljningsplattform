import 'server-only';
import {db} from './database';
import {PanelError,type PanelActor} from './panel-server';
import {planningLog} from './planning-server';
export async function operationalSettings(){return (await db.prepare('SELECT config,revision FROM planning_operational_settings WHERE id=1').first())!}
export async function saveOperational(u:PanelActor,b:any){if(u.role!=='Administratör')throw new PanelError('Bara administratörer kan ange vilka turer som räknas.',403);const cfg=b.config;if(!cfg||!Array.isArray(cfg.tourKeys)||cfg.tourKeys.length>3000||cfg.tourKeys.some((v:unknown)=>typeof v!=='string'||v.length>4000)||new Set(cfg.tourKeys).size!==cfg.tourKeys.length||!['dates','continuous'].includes(cfg.nightPolicy)||!Number.isInteger(b.revision))throw new PanelError('Välj turer och hur nattpass ska räknas.');const saved=await db.prepare('UPDATE planning_operational_settings SET config=?::jsonb,revision=revision+1,updated_at=?,updated_by=? WHERE id=1 AND revision=? RETURNING revision').bind(JSON.stringify(cfg),Date.now(),u.email,b.revision).first();if(!saved)throw new PanelError('Inställningarna har ändrats. Läs in igen.',409);await planningLog(u,'Räkneregler för operativa pass ändrade',{next:JSON.stringify(cfg)});return Response.json({ok:true})}

export async function saveOperationalCount(u:PanelActor,b:any){
 if(u.role!=='Administratör')throw new PanelError('Bara administratörer kan ändra antalet operativa turer.',403);
 if(typeof b.columnId!=='string'||typeof b.month!=='string'||!/^20\d\d-(0[1-9]|1[0-2])$/.test(b.month)||b.count!==null&&(!Number.isInteger(b.count)||b.count<0||b.count>999)||!Number.isInteger(b.revision)||b.revision<0)throw new PanelError('Ange ett heltal mellan 0 och 999.');
 if(!await db.prepare("SELECT id FROM planning_columns WHERE id=? AND kind='person' AND deleted_at IS NULL").bind(b.columnId).first())throw new PanelError('Personen finns inte.',404);
 await db.prepare('SELECT pg_advisory_xact_lock(hashtextextended(?,0))').bind('operational:'+b.columnId+':'+b.month).first();
 const old=await db.prepare('SELECT count,revision FROM planning_operational_overrides WHERE column_id=? AND month=? FOR UPDATE').bind(b.columnId,b.month).first<{count:number|null,revision:number}>();
 if((old?.revision||0)!==b.revision)throw new PanelError('Antalet har ändrats av någon annan. Läs in igen innan du sparar.',409);
 await db.prepare('INSERT INTO planning_operational_overrides(column_id,month,count,revision,updated_at,updated_by) VALUES(?,?,?,?,?,?) ON CONFLICT(column_id,month) DO UPDATE SET count=EXCLUDED.count,revision=EXCLUDED.revision,updated_at=EXCLUDED.updated_at,updated_by=EXCLUDED.updated_by').bind(b.columnId,b.month,b.count,b.revision+1,Date.now(),u.email).run();
 await planningLog(u,'Antal operativa turer justerat',{columnId:b.columnId,field:b.month,previous:old?.count===null||!old?'Beräknat':String(old.count),next:b.count===null?'Beräknat':String(b.count)});return Response.json({ok:true});
}
