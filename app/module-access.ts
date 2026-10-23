import 'server-only';
import {db} from './database';
import {moduleNames,type ModuleKind} from './panel-types';
import {PanelError,type PanelActor} from './panel-server';
export type ModuleAccessRule={kind:ModuleKind,restricted:boolean,userEmails:string[],revision:number};
export async function moduleAccessRules():Promise<ModuleAccessRule[]>{
 const rows=(await db.prepare('SELECT kind,restricted,user_emails AS userEmails,revision FROM panel_module_access').all<ModuleAccessRule>()).results;
 return (Object.keys(moduleNames) as ModuleKind[]).map(kind=>rows.find(r=>r.kind===kind)||{kind,restricted:kind==='planning',userEmails:[],revision:0});
}
export async function allowedModules(user:PanelActor):Promise<ModuleKind[]>{
 if(user.role==='Administratör')return Object.keys(moduleNames) as ModuleKind[];
 if(!['Instruktör','Chef'].includes(user.role))return [];
 return (await moduleAccessRules()).filter(r=>(user.role!=='Chef'||r.kind==='planning')&&(!r.restricted||r.userEmails.includes(user.email))).map(r=>r.kind);
}
export async function requireModule(user:PanelActor,kind:ModuleKind){if(!(await allowedModules(user)).includes(kind))throw new PanelError('Du har inte tillgång till den här modulen.',403)}
export const panelItemModule=(kind:string):ModuleKind|undefined=>({task:'tasks',notice:'notices',introduction:'introduction',reminder:'reminders','document-template':'templates','email-template':'templates'} as Record<string,ModuleKind>)[kind];
