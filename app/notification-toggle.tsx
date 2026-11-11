'use client';
import {useEffect,useState} from 'react';
async function request(app:boolean,method='GET',body?:unknown,query=''){const res=await fetch('/api/notification-preferences'+query,{method,cache:'no-store',headers:{...(app?{'x-tc-app':'planning'}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});const data=await res.json();if(!res.ok)throw Error(data.error||'Kunde inte spara notisinställningen.');return data}
function publicKey(value:string){const binary=atob(value.replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(binary,c=>c.charCodeAt(0))}
export async function disablePushForLogout(){if(!('serviceWorker' in navigator)||!('PushManager' in window))return undefined;const registration=await navigator.serviceWorker.getRegistration('/planering-app'),sub=await registration?.pushManager.getSubscription();if(!sub)return undefined;const endpoint=sub.endpoint;await sub.unsubscribe();return endpoint}
export default function NotificationToggle({app=false}:{app?:boolean}){
 const [on,setOn]=useState(false),[busy,setBusy]=useState(true),[error,setError]=useState(''),[hint,setHint]=useState(''),[config,setConfig]=useState<any>(null);
 useEffect(()=>{let live=true;(async()=>{try{const d=await request(app);if(!live)return;setConfig(d);setHint(d.systemEnabled?'':'Schemaändringsnotiser är avstängda för systemet.');if(!app)setOn(d.webEnabled);else if('serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window){const registration=await navigator.serviceWorker.getRegistration('/planering-app'),sub=await registration?.pushManager.getSubscription();if(sub){const state=await request(true,'GET',undefined,'?endpoint='+encodeURIComponent(sub.endpoint));if(live)setOn(state.enabled&&Notification.permission==='granted')}}}catch(e){if(live)setError((e as Error).message)}finally{if(live)setBusy(false)}})();return()=>{live=false}},[app]);
 async function change(){if(busy)return;setError('');
  // Request permission directly from the user gesture, before unrelated awaits (iOS).
  const permission=app&&!on&&config?.pushConfigured&&'Notification' in window?Notification.requestPermission():null;
  setBusy(true);try{
   if(!app){await request(false,'POST',{channel:'web',enabled:!on});setOn(!on);window.dispatchEvent(new Event('site-notifications-changed'));return}
   if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window))throw Error('Telefonnotiser stöds inte här. På iPhone: öppna appen från hemskärmen.');
   const registration=await navigator.serviceWorker.register('/planering-app/sw.js',{scope:'/planering-app'});await navigator.serviceWorker.ready;
   if(on){const sub=await registration.pushManager.getSubscription();if(sub){await request(true,'POST',{channel:'push',enabled:false,subscription:{endpoint:sub.endpoint}});await sub.unsubscribe()}setOn(false);return}
   if(!config?.pushConfigured)throw Error('Telefonnotiser behöver först konfigureras av administratören.');
   if(await permission!=='granted')throw Error('Tillåt notiser i telefonens inställningar för att aktivera dem.');
   let sub=await registration.pushManager.getSubscription();if(!sub)sub=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:publicKey(config.publicKey)});
   await request(true,'POST',{channel:'push',enabled:true,subscription:sub.toJSON()});setOn(true);
  }catch(e){setError((e as Error).message)}finally{setBusy(false)}
 }
 return <div className="notification-preference"><div className="user-settings-row"><span>Notiser på/av</span><button type="button" role="switch" aria-label={app?'Schemaändringsnotiser på telefonen':'Schemaändringsnotiser i bjällran'} aria-checked={on} disabled={busy} onClick={()=>void change()} className={'notice-switch '+(on?'on':'')}><span/></button></div>{error&&<small role="alert" className="formerror">{error}</small>}{hint&&<small>{hint}</small>}</div>
}

export function NotificationSwitch({enabled,disabled,onChange}:{enabled:boolean,disabled?:boolean,onChange:()=>void}){return <button type="button" role="switch" aria-checked={enabled} disabled={disabled} onClick={onChange} className={"notice-switch "+(enabled?"on":"")}><span/></button>}
