import {secureApi} from '../../../../api-security';
import {db,databaseTransaction} from '../../../../database';
import {currentUser,error} from '../../../../auth';
import {restoreAssessment,RecoveryError,type AssessmentRecovery} from '../../../../assessment-recovery';
export const dynamic='force-dynamic';
async function POSTEndpoint(req:Request){try{const actor=await currentUser();if(actor?.role!=='Administratör')return error('Endast administratörer kan återställa bedömningar.',403);const {id}=await req.json();if(typeof id!=='string'||!id||id.length>120)return error('Välj en loggpost.',400);
 return await databaseTransaction(async()=>{
 const log=await db.prepare('SELECT id,target,area,undo_payload AS undoPayload,restored_at AS restoredAt FROM activity_log WHERE id=? FOR UPDATE').bind(id).first<{id:string,target:string,area:string,undoPayload:AssessmentRecovery|null,restoredAt:number|null}>();
 if(!log)return error('Loggposten finns inte.',404);if(log.restoredAt!==null)return error('Bedömningen har redan återställts.',409);if(!log.undoPayload)return error('Denna äldre borttagning saknar en återställningskopia.',409);
 await restoreAssessment(log.undoPayload);const now=Date.now();
 await db.prepare('UPDATE activity_log SET restored_at=?,restored_by=?,restored_by_name=? WHERE id=?').bind(now,actor.email,actor.name,id).run();
 await db.prepare('INSERT INTO activity_log(id,occurred_at,actor_email,actor_name,actor_role,action,area,target) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),now,actor.email,actor.name,actor.role,'Bedömning återställd',log.area,log.target).run();
 return Response.json({ok:true,restoredAt:now,restoredByName:actor.name});
 });
 }catch(e){if(e instanceof RecoveryError)return error(e.message,e.status);return error('Kunde inte återställa bedömningen. Kontrollera databasuppdatering 0019.',503)}}

export const POST=secureApi('/api/admin/activity/restore',POSTEndpoint);
