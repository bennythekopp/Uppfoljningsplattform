import {backupPool} from '../../lib/backup/db';
import {scheduleBackup,launchWorker} from '../../lib/backup/worker';
import {googleDriveConfig} from '../../lib/backup/googledrive';
import {runScheduled} from '../../lib/scheduler-gate';
import {nextBackupCheck} from '../../lib/scheduler-times';
export default async function(){if(!googleDriveConfig().configured)return;await runScheduled('backup',async()=>{
 const client=await backupPool().connect();try{
  const pending=(await client.query("SELECT id FROM sharepoint_backup_runs WHERE state IN('preparing','queued','running') LIMIT 1")).rowCount;
  if(pending){await launchWorker();return Date.now()+20*60000}
  await scheduleBackup(client);
  const active=(await client.query("SELECT id FROM sharepoint_backup_runs WHERE state IN('preparing','queued','running') LIMIT 1")).rowCount;
  if(active)return Date.now()+20*60000;
  const settings=(await client.query('SELECT * FROM sharepoint_backup_settings WHERE id=1')).rows[0];
  return nextBackupCheck(settings);
 }finally{client.release()}
})}
export const config={schedule:'* * * * *'};
