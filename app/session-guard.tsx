'use client';
import { useEffect,useRef,useState } from 'react';
import { SESSION_WARNING_MS } from './session-policy';
export default function SessionGuard({onExpired}:{onExpired:()=>void}){
 const callback=useRef(onExpired);callback.current=onExpired;
 const [seconds,setSeconds]=useState<number|null>(null),[error,setError]=useState('');
 const checkRef=useRef<((touch:boolean)=>Promise<void>)|null>(null);
 useEffect(()=>{
  let stopped=false,inflight=false,pending=false,lastCheck=0,deadline=0;
  async function check(touch:boolean){
   if(inflight||stopped)return;inflight=true;
   try{
    const response=await fetch('/api/session',{method:touch?'POST':'GET',cache:'no-store',...(touch?{headers:{'Content-Type':'application/json'},body:'{}'}:{})});
    if(stopped)return;
    if(response.status===401||response.status===403){stopped=true;callback.current();return}
    if(!response.ok)throw Error('Anslutningen kunde inte kontrolleras.');
    const data=await response.json();deadline=Math.min(data.idleExpiresAt,data.expiresAt);lastCheck=Date.now();pending=false;setError('');tick();
   }catch{if(!stopped&&deadline&&Date.now()>=deadline){stopped=true;callback.current()}else if(!stopped)setError('Kontrollera anslutningen. Inloggningen kunde inte förlängas.')}finally{inflight=false}
  }
  function tick(){
   if(stopped)return;
   const remaining=deadline-Date.now();
   setSeconds(deadline&&remaining<=SESSION_WARNING_MS?Math.max(0,Math.ceil(remaining/1000)):null);
   if(deadline&&remaining<=0){void check(false);return}
   if(Date.now()-lastCheck>=30000)void check(pending&&document.visibilityState==='visible');
  }
  function activity(event:Event){if(!event.isTrusted||document.visibilityState!=='visible')return;pending=true;if(Date.now()-lastCheck>=30000)void check(true)}
  function visible(){if(document.visibilityState==='visible')void check(false)}
  const events=['pointerdown','keydown','scroll','touchstart'];
  for(const event of events)window.addEventListener(event,activity,{passive:true});
  document.addEventListener('visibilitychange',visible);
  const timer=window.setInterval(tick,1000);checkRef.current=check;void check(false);
  return()=>{stopped=true;clearInterval(timer);for(const event of events)window.removeEventListener(event,activity);document.removeEventListener('visibilitychange',visible);checkRef.current=null};
 },[]);
 if(seconds===null&&!error)return null;
 return <aside className="sessionwarning" role="alert"><div><strong>{seconds!==null?'Du loggas snart ut':'Anslutningen behöver kontrolleras'}</strong><p>{seconds!==null?`Inloggningen går ut om ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}. Spara ditt arbete.`:error}</p>{seconds!==null&&error&&<p>{error}</p>}</div><button type="button" className="primary" onClick={()=>void checkRef.current?.(true)}>Fortsätt arbeta</button></aside>;
}
