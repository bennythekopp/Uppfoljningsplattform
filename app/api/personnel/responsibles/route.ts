import {secureApi} from '../../../api-security';
import { db } from '../../../database';
import { currentUser,error } from '../../../auth';
export const dynamic='force-dynamic';
async function GETEndpoint(){
 try{
  const user=await currentUser();
  if(!user||!['Administratör','Instruktör'].includes(user.role))return error('Behörighet saknas',403);
  const {results}=await db.prepare("SELECT email,name,role,username FROM users WHERE disabled_at IS NULL AND role IN ('Administratör','Instruktör') ORDER BY name COLLATE NOCASE").all();
  return Response.json(results);
 }catch{return error('Kunde inte läsa ansvariga',503)}
}

export const GET=secureApi('/api/personnel/responsibles',GETEndpoint);
