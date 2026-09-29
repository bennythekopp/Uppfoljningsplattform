import { currentUser,error } from '../../auth';
export const dynamic='force-dynamic';
export async function GET(){try{const user=await currentUser();return user?Response.json(user):error('Du har inte tillgång till bedömningsstödet',403)}catch{return error('Kunde inte kontrollera behörighet',503)}}
