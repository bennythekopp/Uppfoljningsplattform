import {secureApi} from '../../../api-security';
import {currentUser,error} from '../../../auth';
import {PanelError,panelBody} from '../../../panel-server';
import {backupPool} from '../../../../lib/backup/db';
import {GoogleDrive,googleDriveConfig,publicConnection} from '../../../../lib/backup/googledrive';
import {enqueueBackup,snapshot,buildJobs} from '../../../../lib/backup/queue';
import {optionsFromRow,validOptions} from '../../../../lib/backup/options';
import {launchWorker} from '../../../../lib/backup/worker';
export const dynamic='force-dynamic';
async function get(req:Request){const c=await backupPool().connect();try{if(new URL(req.url).searchParams.has('catalog')){await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ');try{const files=buildJobs(await snapshot(c),new Date().toISOString()).filter(j=>j.path!=='Exportinformation.json').map(j=>({path:j.path,kind:j.kind}));await c.query('COMMIT');return Response.json({files})}catch(e){await c.query('ROLLBACK');throw e}}const settings=(await c.query('SELECT * FROM sharepoint_backup_settings WHERE id=1')).rows[0],runs=(await c.query('SELECT r.id,r.created_at,r.completed_at,r.state,r.folder,r.error,(SELECT count(*) FROM sharepoint_backup_jobs j WHERE j.run_id=r.id) AS total,(SELECT count(*) FROM sharepoint_backup_jobs j WHERE j.run_id=r.id AND j.state=\'done\') AS done FROM sharepoint_backup_runs r ORDER BY created_at DESC LIMIT 20')).rows;return Response.json({connection:await publicConnection(c),settings,runs,configured:googleDriveConfig().configured,missing:googleDriveConfig().missing})}finally{c.release()}}
async function post(req:Request){const u=(await currentUser())!,b=await panelBody(req,2000000),c=await backupPool().connect();try{
 const audit=async(action:string)=>{await c.query('INSERT INTO activity_log(id,occurred_at,actor_email,actor_name,actor_role,action,area,target) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[crypto.randomUUID(),Date.now(),u.email,u.name,u.role,action,'Reservkopior','Google Drive'])};
 if(b.action==='settings'){
 const previous=(await c.query('SELECT * FROM sharepoint_backup_settings WHERE id=1')).rows[0],options={...optionsFromRow(previous),...Object.fromEntries(['copyMode','selectedPaths','scheduleKind','intervalHours','sendTime','weekDay'].filter(k=>b[k]!==undefined).map(k=>[k,b[k]]))};
 if(typeof b.enabled!=='boolean'||typeof b.restrictedConfirmed!=='boolean'||!Number.isInteger(b.revision)||!validOptions(options))throw new PanelError('Kontrollera intervall, tid och valda filer.');
 if(b.enabled&&(!googleDriveConfig().configured||!b.restrictedConfirmed||!(await publicConnection(c)).connected))throw new PanelError('Konfigurera anslutningen och bekräfta begränsad åtkomst först.');
 const saved=await c.query('UPDATE sharepoint_backup_settings SET enabled=$1,interval_hours=$2,restricted_confirmed=$3,revision=revision+1,copy_mode=$5,selected_paths=$6::jsonb,schedule_kind=$7,send_time=$8,week_day=$9 WHERE id=1 AND revision=$4 RETURNING id',[b.enabled,options.intervalHours,b.restrictedConfirmed,b.revision,options.copyMode,JSON.stringify(options.selectedPaths),options.scheduleKind,options.sendTime,options.weekDay]);
 if(!saved.rowCount)throw new PanelError('Inställningarna har ändrats. Läs in igen.',409);await audit('Exportinställningar ändrade')
 }
 else if(b.action==='test'){const root=await new GoogleDrive(undefined,c).checkRoot();await audit('Exportanslutning testad');return Response.json(root)}
 else if(b.action==='run'){await new GoogleDrive(undefined,c).checkRoot();const id=await enqueueBackup(c,u.email,true);await audit('Reservexport begärd');await launchWorker();return Response.json({ok:true,id})}
 else if(b.action==='retry'){await c.query('BEGIN');try{const run=(await c.query("SELECT id FROM sharepoint_backup_runs WHERE id=$1 AND state='failed' FOR UPDATE",[b.id])).rows[0];if(!run)throw new PanelError('Ingen misslyckad kopia hittades.',404);if((await c.query("SELECT id FROM sharepoint_backup_runs WHERE state IN('preparing','queued','running')")).rowCount)throw new PanelError('En annan export pågår.',409);await c.query("UPDATE sharepoint_backup_jobs SET state='queued',attempts=0,next_try_at=0 WHERE run_id=$1 AND state<>'done'",[b.id]);await c.query("UPDATE sharepoint_backup_runs SET state=CASE WHEN EXISTS(SELECT 1 FROM sharepoint_backup_jobs WHERE run_id=$1) THEN 'queued' ELSE 'preparing' END,error='' WHERE id=$1",[b.id]);await c.query('COMMIT')}catch(e){await c.query('ROLLBACK');throw e}await audit('Reservexport återupptagen');await launchWorker()}
 else throw new PanelError('Okänd åtgärd.');return Response.json({ok:true});
 }finally{c.release()}}
const handle=(fn:(r:Request)=>Promise<Response>)=>async(req:Request)=>{try{return await fn(req)}catch(e){const message=e instanceof PanelError?e.message:e instanceof Error&&/^(GoogleDrive|Google|Anslut |Konfigurera |Bekräfta |Exportarbetaren)/.test(e.message)?e.message:'Exporten kunde inte slutföras. Kontrollera databasuppdatering 0038 och Netlifys funktionslogg.';return error(message,e instanceof PanelError?e.status:503)}};
export const GET=secureApi('/api/admin/backups',handle(get));export const POST=secureApi('/api/admin/backups',handle(post));
