import {backupPool} from '../../lib/backup/db';
import {scheduleBackup} from '../../lib/backup/worker';
import {oneDriveConfig} from '../../lib/backup/onedrive';
export default async function(){if(!oneDriveConfig().configured)return;const pool=backupPool(),client=await pool.connect();try{await scheduleBackup(client)}finally{client.release()}}
export const config={schedule:'*/5 * * * *'};
