'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {Bell,X} from 'lucide-react';
import './notification-bell.css';
type Notice={id:string,body:string,title?:string,createdAt:number,expiresAt?:number|null,read:boolean};
export default function NotificationBell({role,email}:{role:string,email:string}){
 const [notices,setNotices]=useState<Notice[]>([]),[open,setOpen]=useState(false),[error,setError]=useState('');const host=useRef<HTMLDivElement>(null);
 const load=useCallback(async()=>{try{const res=await fetch('/api/notifications',{cache:'no-store'});if(res.ok)setNotices(await res.json())}catch{}},[]);
 useEffect(()=>{void load();const interval=setInterval(()=>void load(),60000);window.addEventListener('site-notifications-changed',load);return()=>{clearInterval(interval);window.removeEventListener('site-notifications-changed',load)}},[load,email,role]);
 useEffect(()=>{const ends=notices.flatMap(n=>n.expiresAt?[n.expiresAt]:[]);if(!ends.length)return;const timer=setTimeout(()=>{setNotices(rows=>rows.filter(n=>!n.expiresAt||n.expiresAt>Date.now()));void load()},Math.min(2147483647,Math.max(1,Math.min(...ends)-Date.now()+20)));return()=>clearTimeout(timer)},[notices,load]);
 useEffect(()=>{if(!open)return;const close=(e:MouseEvent)=>{if(!host.current?.contains(e.target as Node))setOpen(false)};const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};document.addEventListener('mousedown',close);document.addEventListener('keydown',esc);return()=>{document.removeEventListener('mousedown',close);document.removeEventListener('keydown',esc)}},[open]);
 async function post(payload:object){const res=await fetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const result=await res.json();if(!res.ok)throw Error(result.error||'Kunde inte spara notisen');return result}
 async function read(notice:Notice){if(notice.read)return;try{await post({action:'read',id:notice.id});setNotices(rows=>rows.map(n=>n.id===notice.id?{...n,read:true}:n))}catch(e){setError((e as Error).message)}}
 const unread=notices.filter(n=>!n.read).length;
 return <div className="site-notifications" ref={host}><button type="button" className="notification-trigger" aria-label={unread?`${unread} nya notiser`:'Notiser'} aria-expanded={open} onClick={()=>{setOpen(v=>!v);setError('');void load()}}><Bell size={21}/>{unread>0&&<span className="notification-count">{unread>99?'99+':unread}</span>}</button>{open&&<section className="notification-popover" role="dialog" aria-label="Notiser"><header><strong>Notiser</strong><button type="button" aria-label="Stäng notiser" onClick={()=>setOpen(false)}><X size={18}/></button></header>{error&&<p className="notification-error" role="alert">{error}</p>}<div className="notification-list">{notices.length?notices.map(n=><button type="button" key={n.id} className={n.read?'':'unread'} onClick={()=>void read(n)}><time>{new Date(n.createdAt).toLocaleDateString('sv-SE')}</time><span>{n.title&&<strong className="notification-title">{n.title}</strong>}{n.body}</span>{!n.read&&<i aria-label="Oläst"/>}</button>):<p>Inga meddelanden.</p>}</div></section>}</div>;
}
