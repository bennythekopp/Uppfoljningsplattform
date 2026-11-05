import {allowedModules} from '../../module-access';
import {peopleVisibility} from '../../people-visibility';
import {secureApi} from '../../api-security';
import { currentUser,error } from '../../auth';
export const dynamic='force-dynamic';
async function GETEndpoint(){try{const user=await currentUser();return user?Response.json({...user,peopleVisibility:await peopleVisibility(user),allowedModules:user.sessionScope==='planning'?[]:await allowedModules(user)}):error('Du har inte tillgång till bedömningsstödet',403)}catch{return error('Kunde inte kontrollera behörighet',503)}}

export const GET=secureApi('/api/me',GETEndpoint);
