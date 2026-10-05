import { movePerson } from '../../../database';
import { currentUser,error } from '../../../auth';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{
  const u=await currentUser();if(!u||!['Administratör','Instruktör'].includes(u.role))return error('Behörighet saknas',403);
  const {id,source}=await req.json() as {id:unknown,source:unknown};
  if(typeof id!=='string'||!id||!['students','personnel'].includes(String(source)))return error('Ogiltig person',400);
  const moved=await movePerson(id,source as 'students'|'personnel',u.email);
  if(!moved)return error('Personen finns inte i denna grupp',404);
  return Response.json({...moved,destination:source==='students'?'personnel':'students'});
}catch{return error('Kunde inte flytta personen',503)}}
