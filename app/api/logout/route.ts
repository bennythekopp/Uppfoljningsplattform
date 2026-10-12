import {auditMutation} from '../../activity-log';
import { db } from '../../database';
import { cookies } from 'next/headers';
import { sha256 } from '../../auth';
export const dynamic='force-dynamic';
async function POSTHandler(){const c=await cookies(),token=c.get('tc_session')?.value;if(token)try{await db.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha256(token)).run()}catch{}c.delete('tc_session');return Response.json({ok:true})}

export const POST=(req:Request)=>auditMutation(req,POSTHandler,'Utloggning');
