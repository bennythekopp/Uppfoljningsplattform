import 'server-only';
import {requestMemo} from './auth';
import {db} from './database';
export function peopleVisibility(user:{email:string,role:string}):Promise<{students:boolean,personnel:boolean}>{return requestMemo('people:'+user.email+':'+user.role,()=>loadPeopleVisibility(user))}
async function loadPeopleVisibility(user:{email:string,role:string}){
 // Keep administrator recovery access; other roles never gain permissions here.
 if(user.role==='Administratör')return {students:true,personnel:true};
 return await db.prepare('SELECT students,personnel FROM people_visibility WHERE user_email=?').bind(user.email).first<{students:boolean,personnel:boolean}>()||{students:true,personnel:true};
}
