import {backupPool} from '../../lib/backup/db';
import {processBackup,validBackupToken} from '../../lib/backup/worker';
export default async function(request:Request){if(request.method!=='POST'||!validBackupToken(request.headers.get('x-backup-token')))return new Response('Forbidden',{status:403});const client=await backupPool().connect();try{await processBackup(client)}finally{client.release()}return new Response(null,{status:204})}
