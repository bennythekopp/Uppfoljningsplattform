import { currentUser,error } from '../../../auth';
import { saveSimulatorGroup,deleteSimulatorGroup,type SimulatorChildInput } from '../../../database';
export const dynamic='force-dynamic';
async function save(req:Request,editing:boolean){try{
 const user=await currentUser();if(!user||!['Administratör','Instruktör'].includes(user.role))return error('Behörighet saknas',403);
 const input=await req.json();
 if(editing&&(typeof input.id!=='string'||!input.id)||!editing&&input.id!==undefined||typeof input.title!=='string'||!input.title.trim()||input.title.length>180||typeof input.description!=='string'||input.description.length>10000||!Array.isArray(input.children)||!input.children.length||input.children.length>200)return error('Ange momentets namn och minst ett delmoment',400);
 const ids=new Set<string>();const children:SimulatorChildInput[]=[];
 for(const child of input.children){
  if(!child||child.id!==undefined&&(typeof child.id!=='string'||!child.id||ids.has(child.id))||!editing&&child.id!==undefined||typeof child.title!=='string'||!child.title.trim()||child.title.length>180||typeof child.description!=='string'||child.description.length>10000||!Number.isInteger(child.maxScore)||child.maxScore<0||child.maxScore>1000)return error('Kontrollera delmomentens namn och maxpoäng',400);
  if(child.id)ids.add(child.id);children.push({...(child.id?{id:child.id}:{}),title:child.title.trim(),description:child.description.trim(),maxScore:child.maxScore});
 }
 const result=await saveSimulatorGroup({...(editing?{id:input.id}:{}),title:input.title.trim(),description:input.description.trim(),children},user.email);
 return result?Response.json(result):error('Momentet finns inte',404);
}catch{return error('Kunde inte spara momentet. Kontrollera delmomenten och försök igen.',400)}}
export async function POST(req:Request){return save(req,false)}
export async function PUT(req:Request){return save(req,true)}
export async function DELETE(req:Request){try{const user=await currentUser();if(!user||!['Administratör','Instruktör'].includes(user.role))return error('Behörighet saknas',403);const {id}=await req.json();if(typeof id!=='string'||!id)return error('Moment saknas',400);return await deleteSimulatorGroup(id,user.email)?Response.json({ok:true}):error('Momentet finns inte',404)}catch{return error('Kunde inte ta bort momentet',503)}}
