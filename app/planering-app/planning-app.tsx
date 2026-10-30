'use client';
import {useCallback,useEffect,useMemo,useState} from 'react';
import {addDays,findTour,isoWeek,stockholmToday,tourStyle} from '../grundschema-types';
import {baseTour,cellKey,personPeriodFor,periodFor,planningTourStyle,type PlanningColumn,type PlanningData} from '../planning-types';
import {PullRefresh} from '../pull-refresh';
import {pairedPlanningStyle,nightFlags,colorStyle} from '../planning-types';
import PlanningSettings from './settings';
import {useAppearanceUser} from '../appearance-provider';
import './style.css';
const weekdays=['Mån','Tis','Ons','Tor','Fre','Lör','Sön'];
const monthNames=['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];
type User={email:string,name:string,role:string};
function startOfWeek(day:string){const w=(new Date(day+'T12:00:00Z').getUTCDay()+6)%7;return addDays(day,-w)}
function dayLabel(day:string){return `${Number(day.slice(8))} ${monthNames[Number(day.slice(5,7))-1]}`}
function weekLabel(monday:string){const sunday=addDays(monday,6);return `Vecka ${isoWeek(monday)} · ${dayLabel(monday)} – ${dayLabel(sunday)}${monday.slice(0,4)===sunday.slice(0,4)?'':' '+sunday.slice(0,4)}`}
function parseResult(r:Response){return r.json().then(x=>{if(!r.ok)throw Error(x.error||'Kunde inte läsa uppgifter.');return x})}
export default function PlanningApp(){
 const [user,setUser]=useState<User|null>(null),[authLoading,setAuthLoading]=useState(true),[loginUser,setLoginUser]=useState(''),[password,setPassword]=useState(''),[loggingIn,setLoggingIn]=useState(false);
 const [monday,setMonday]=useState(()=>startOfWeek(stockholmToday())),[picker,setPicker]=useState(false),[data,setData]=useState<PlanningData|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState('');
 useAppearanceUser(user?.email||null);
 const [offline,setOffline]=useState(false);
 const [wide,setWide]=useState(false),[lastSync,setLastSync]=useState('');
 const refreshUser=useCallback(async()=>{try{const r=await fetch('/api/me',{cache:'no-store'});if(r.ok){const u=await r.json();setUser(u);localStorage.setItem('tcpa-user',JSON.stringify(u))}else{for(const k of Object.keys(localStorage))if(k.startsWith('tcpa-'))localStorage.removeItem(k);setData(null);setUser(null)}}catch{if(!navigator.onLine){try{setUser(JSON.parse(localStorage.getItem('tcpa-user')||'null'));setOffline(true)}catch{setUser(null)}}else setUser(null)}finally{setAuthLoading(false)}},[]);
 useEffect(()=>{void refreshUser();if('serviceWorker' in navigator)void navigator.serviceWorker.register('/planering-app/sw.js',{scope:'/planering-app'}).catch(()=>{})},[refreshUser]);
 useEffect(()=>{const m=window.matchMedia('(orientation: landscape)');const update=()=>setWide(m.matches);update();m.addEventListener('change',update);return()=>m.removeEventListener('change',update)},[]);
 const load=useCallback(async()=>{if(!user)return;setLoading(true);try{const end=addDays(monday,7);const year=Number(monday.slice(0,4));const qs=new URLSearchParams({year:String(year),from:addDays(monday,-1),to:end});const r=await fetch('/api/planning?'+qs,{cache:'no-store'});if(r.status===403){for(const k of Object.keys(localStorage))if(k.startsWith('tcpa-'))localStorage.removeItem(k);setData(null);const me=await fetch('/api/me',{cache:'no-store'});if(!me.ok){setUser(null);throw Error('Sessionen har gått ut. Logga in igen.')}}const result=await parseResult(r);setData(result);setOffline(false);try{localStorage.setItem('tcpa-week:'+user.email+':'+monday,JSON.stringify({data:result,time:Date.now()}))}catch{}setError('');setLastSync(new Intl.DateTimeFormat('sv-SE',{hour:'2-digit',minute:'2-digit'}).format(new Date()))}catch(e){if(!navigator.onLine){try{const saved=JSON.parse(localStorage.getItem('tcpa-week:'+user.email+':'+monday)||'null');setData(saved?.data||null);setOffline(true);setError(saved?'':'Denna vecka finns inte sparad offline.')}catch{setError('Kunde inte läsa sparat schema.')}}else{setData(null);setError((e as Error).message)}}finally{setLoading(false)}},[user,monday]);
 useEffect(()=>{if(!user)return;void load();const id=setInterval(()=>void load(),60000);const focus=()=>void load();window.addEventListener('focus',focus);return()=>{clearInterval(id);window.removeEventListener('focus',focus)}},[load,user]);
 const days=useMemo(()=>Array.from({length:7},(_,i)=>addDays(monday,i)),[monday]);
 const people=useMemo(()=>(data?.columns||[]).filter(c=>c.kind==='person'),[data]);
 const mine=people.find(c=>c.userEmail?.toLocaleLowerCase('sv-SE')===user?.email.toLocaleLowerCase('sv-SE'));
 const shared=(data?.columns||[]).filter(c=>c.kind==='shared');
 const visible=wide?people:mine?[mine]:[];
 const cells=useMemo(()=>new Map((data?.cells||[]).map(c=>[cellKey(c.day,c.columnId,c.field),c.value])),[data]);
 function tour(c:PlanningColumn,day:string){const v=cells.get(cellKey(day,c.id,'tour'));return v===undefined?baseTour(data?.periods||[],c,day,data?.memberships):v}
 function period(c:PlanningColumn,day:string){return personPeriodFor(data?.periods||[],c,day,data?.memberships)}
 function task(c:PlanningColumn,day:string){return cells.get(cellKey(day,c.id,'task'))||''}
 function tourInfo(c:PlanningColumn,day:string){const code=tour(c,day);const period=personPeriodFor(data?.periods||[],c,day,data?.memberships);const found=period?findTour(period.config,code):undefined;const color=cells.get(cellKey(day,c.id,'color'));return {label:found?.code||code,style:color&&/^#[\da-f]{6}$/i.test(color)?colorStyle(color):found?tourStyle(period!.config,code):undefined}}
 async function login(e:React.FormEvent){e.preventDefault();setLoggingIn(true);setError('');try{await parseResult(await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:loginUser,password})}));setPassword('');await refreshUser()}catch(e){setError((e as Error).message)}finally{setLoggingIn(false)}}
 async function logout(){setError('');try{await parseResult(await fetch('/api/logout',{method:'POST'}));for(const k of Object.keys(localStorage))if(k.startsWith('tcpa-'))localStorage.removeItem(k);setData(null);setUser(null);setOffline(false)}catch{setError('Utloggningen kunde inte slutföras. Anslut till internet och försök igen.')}}
 return <main className="tcpa"><PullRefresh onRefresh={load}/>
 <header className="tcpa-header"><img alt="TC Boden" src="/logo.png"/><div><strong>TC Boden</strong><small>Planering</small></div><PlanningSettings onLogout={user?logout:undefined}/></header>
 {authLoading?<p className="tcpa-state">Kontrollerar inloggning…</p>:!user?<form className="tcpa-login" onSubmit={login}><h1>Logga in</h1><p>Använd samma konto som på Bedömningsstödet.</p><label>Användarnamn<input autoComplete="username" value={loginUser} onChange={e=>setLoginUser(e.target.value)} required/></label><label>Lösenord<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button disabled={loggingIn}>{loggingIn?'Loggar in…':'Logga in'}</button>{error&&<p className="tcpa-error" role="alert">{error}</p>}</form>:<>
 <div className="tcpa-bar"><button aria-label="Föregående vecka" onClick={()=>setMonday(d=>addDays(d,-7))}>‹</button><strong>{weekLabel(monday)}</strong><button aria-label="Nästa vecka" onClick={()=>setMonday(d=>addDays(d,7))}>›</button><button className="tcpa-cal" aria-label="Välj datum" title="Välj datum" onClick={()=>setPicker(v=>!v)}>▦</button></div>
 {picker&&<div className="tcpa-picker"><label>Gå till ett datum <input aria-label="Välj datum" type="date" defaultValue={monday} onChange={e=>{if(/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)){setMonday(startOfWeek(e.target.value));setPicker(false)}}}/></label><button onClick={()=>{setMonday(startOfWeek(stockholmToday()));setPicker(false)}}>Idag</button></div>}

 {offline&&<p role="status">Offline – visar senast hämtade schema. Ändringar kan ha gjorts sedan dess.</p>}{error&&<p className="tcpa-error" role="alert">{error}</p>}
 {!error&&!data&&<p className="tcpa-state">Hämtar planering…</p>}
 {data&&!wide&&!mine&&<p className="tcpa-state">Ditt konto har ingen egen planeringskolumn. Kontakta administratören för att koppla kolumnen till ditt användarkonto.</p>}
 {data&&visible.length>0&&<div className="tcpa-grid-scroll"><table className="tcpa-grid"><thead><tr><th className="tcpa-date" rowSpan={2}>Datum</th>{wide&&shared.map(c=><th key={c.id} rowSpan={2} className="tcpa-shared">{c.title}</th>)}{visible.map(c=><th key={c.id} colSpan={2} className="tcpa-person">{c.title}</th>)}</tr><tr>{visible.map(c=><><th key={c.id+'tour'} className="tcpa-tour-head">Tur</th><th key={c.id+'task'} className="tcpa-task-head">Uppgift</th></>)}</tr></thead><tbody>{days.map((day,i)=><tr key={day} className={day===stockholmToday()?'tcpa-today':''}><th className="tcpa-date"><strong>{weekdays[i]}</strong><span>{dayLabel(day)}</span></th>{wide&&shared.map(c=><td key={c.id} className="tcpa-shared">{cells.get(cellKey(day,c.id,'shared'))||''}</td>)}{visible.map(c=>{const t=tourInfo(c,day);const night=nightFlags(tour(c,day),period(c,day)).starts,previous=nightFlags(tour(c,addDays(day,-1)),period(c,addDays(day,-1))).starts;const pair=pairedPlanningStyle(cells.get(cellKey(day,c.id,'color'))||'',tour(c,day),period(c,day));return <><td key={c.id+'tour'} style={pair} className={'tcpa-tour-cell '+(night?'night-start ':'')+(previous?'night-continue ':'')+(previous&&!night?'night-end':'')}><span style={pair||t.style} className="tcpa-tour-value">{previous&&night?'':t.label||'–'}</span>{(night||previous)&&<span aria-label={night?'Nattpass fortsätter':'Nattpass avslutas'} className="tcpa-night" style={night?t.style:tourInfo(c,addDays(day,-1)).style}>{previous&&!night?'↓':''}</span>}</td><td key={c.id+'task'} style={pair} className="tcpa-task-cell">{task(c,day)}</td></>})}</tr>)}</tbody></table></div>}
 <footer className="tcpa-footer"><span>{loading?'Uppdaterar…':lastSync?'Uppdaterad '+lastSync:''}</span></footer>
 </>}
 </main>
}
