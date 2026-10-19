import {auditMutation} from '../../../activity-log';
import {currentUser,error} from '../../../auth';
import {db} from '../../../database';
import {stockholmYear} from '../../../followup-status';
export const dynamic='force-dynamic';

async function reset(req:Request){
 const user=await currentUser();
 if(!user||user.role!=='Administratör')return error('Behörighet saknas',403);
 const year=stockholmYear();
 const input=await req.json().catch(()=>({}));
 if(input.year!==year)return error('Året har ändrats. Ladda om sidan och försök igen.',409);
 await db.prepare('INSERT INTO iu_annual_resets(year,reset_at,reset_by) VALUES(?,?,?) ON CONFLICT (year) DO UPDATE SET reset_at=EXCLUDED.reset_at,reset_by=EXCLUDED.reset_by').bind(year,Date.now(),user.email).run();
 return Response.json({year,ok:true});
}
export const POST=(req:Request)=>auditMutation(req,reset,'Årets IU');
