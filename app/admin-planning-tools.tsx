'use client';
import {useEffect,useState} from 'react';
import AdminPlanningLog from './admin-planning-log';
import {panelRequest} from './panel-types';
import {stockholmToday} from './grundschema-types';
import {flushPlanning} from './planning-client';
import {PlanningMailDialog} from './planning-suggestions';
import type {PlanningData} from './planning-types';
import './planning.css';
export type PlanningAdminView='mail'|'planning-log'|'planning-permissions';
const labels:Record<PlanningAdminView,string>={mail:'Mailinställningar','planning-log':'Planeringslogg','planning-permissions':'Planeringsbehörighet'};
/** Same forms and API contracts, rendered directly in the planning admin modules. */
export default function AdminPlanningTools({view}:{view:PlanningAdminView}){return view==='planning-log'?<AdminPlanningLog/>:<AdminPlanningSettings view={view}/>}
function AdminPlanningSettings({view}:{view:Exclude<PlanningAdminView,'planning-log'>}){
 const [data,setData]=useState<PlanningData|null>(null),[editors,setEditors]=useState<{emails:string[],suggesterEmails:string[],revision:number}|null>(null),[permissionQuery,setPermissionQuery]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[status,setStatus]=useState('');
 async function reload(){const value:PlanningData=await panelRequest('/api/planning?year='+stockholmToday().slice(0,4));setData(value);return value}
 function resetEditors(value:PlanningData){setEditors({emails:value.editorEmails.filter(email=>value.permissionUsers?.some(p=>p.email===email&&p.role==='Instruktör')),suggesterEmails:(value.suggesterEmails||[]).filter(email=>!value.editorEmails.includes(email)&&value.permissionUsers?.some(p=>p.email===email)),revision:value.settingsRevision})}
 async function load(){setLoading(true);setError('');try{await flushPlanning();const value=await reload();if(view==='mail'&&!value.mailSettings)throw Error('Kunde inte läsa mailinställningarna.');if(view==='planning-permissions')resetEditors(value)}catch(e){setError((e as Error).message)}finally{setLoading(false)}}
 useEffect(()=>{void load()},[view]);
 return <section className={'admin-module admin-planning-module admin-planning-'+view}>{view!=='mail'&&<h2>{labels[view]}</h2>}{error&&<p className="formerror" role="alert">{error}</p>}{status&&<p role="status">{status}</p>}{loading?<p>Läser in…</p>:<>
 {error&&<button type="button" className="secondary" onClick={()=>void load()}>Läs in igen</button>}
 {view==='mail'&&data?.mailSettings&&<PlanningMailDialog inline initial={data.mailSettings} users={data.users} onClose={()=>{}} onSaved={async()=>{await reload()}}/>}
 {view==='planning-permissions'&&editors&&<form className="planning-permissions admin-inline-form" onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');setStatus('');try{await flushPlanning();await panelRequest('/api/planning','POST',{action:'editors',...editors});resetEditors(await reload());setStatus('Planeringsbehörigheten har sparats.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}}><input aria-label="Sök person" placeholder="Sök person" value={permissionQuery} onChange={e=>setPermissionQuery(e.target.value)}/><div className="planning-permissions-scroll"><table><thead><tr><th>Namn</th><th>Roll</th><th>Redigera</th><th>Föreslå ändringar</th></tr></thead><tbody>{(data?.permissionUsers||[]).filter(p=>(p.name+' '+p.role).toLocaleLowerCase('sv').includes(permissionQuery.toLocaleLowerCase('sv'))).map(p=><tr key={p.email}><th>{p.name}</th><td>{p.role}</td><td>{p.role==='Instruktör'?<input type="checkbox" disabled={busy} aria-label={'Redigera för '+p.name} checked={editors.emails.includes(p.email)} onChange={e=>setEditors(old=>old&&({...old,emails:e.target.checked?[...old.emails,p.email]:old.emails.filter(v=>v!==p.email),suggesterEmails:e.target.checked?old.suggesterEmails.filter(v=>v!==p.email):old.suggesterEmails}))}/>:<span aria-label="Ej tillgängligt">—</span>}</td><td><input type="checkbox" disabled={busy} aria-label={'Föreslå ändringar för '+p.name} checked={editors.suggesterEmails.includes(p.email)} onChange={e=>setEditors(old=>old&&({...old,suggesterEmails:e.target.checked?[...old.suggesterEmails,p.email]:old.suggesterEmails.filter(v=>v!==p.email),emails:e.target.checked?old.emails.filter(v=>v!==p.email):old.emails}))}/></td></tr>)}</tbody></table></div><div className="admin-form-actions"><button type="button" className="secondary" disabled={busy} onClick={()=>{if(data)resetEditors(data);setStatus('Ändringarna har återställts.')}}>Återställ ändringar</button><button className="primary" disabled={busy}>Spara</button></div></form>}
 </>}</section>;
}
