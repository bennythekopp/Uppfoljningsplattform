'use client';

// Shared by every module. Local events only: no presence/keep-alive API.
export const CLIENT_IDLE_MS=2*60*1000;
let lastActivity=0,installed=false;
const listeners=new Set<()=>void>();
function visible(){return typeof document!=='undefined'&&document.visibilityState==='visible'&&!(typeof navigator!=='undefined'&&navigator.onLine===false)}
export function clientActive(){return visible()&&Date.now()-lastActivity<CLIENT_IDLE_MS}
function install(){
 if(installed||typeof window==='undefined')return;
 installed=true;lastActivity=Date.now();
 const activity=(event:Event)=>{if(!event.isTrusted||!visible())return;const was=clientActive();lastActivity=Date.now();if(!was)listeners.forEach(run=>run())};
 for(const event of ['pointerdown','pointermove','keydown','input','scroll','touchstart'])window.addEventListener(event,activity,{passive:true,capture:true});
 // Returning to a visible tab is an explicit resumption of work.
 const resume=()=>{if(!visible())return;lastActivity=Date.now();listeners.forEach(run=>run())};
 document.addEventListener('visibilitychange',resume);
 window.addEventListener('pageshow',resume);
 window.addEventListener('online',()=>{if(clientActive())listeners.forEach(run=>run())});
}
export function activeInterval(callback:()=>unknown,delay:number){
 install();let stopped=false,running=false,lastRun=Date.now();
 const run=()=>{if(stopped||running||!clientActive())return;running=true;lastRun=Date.now();try{Promise.resolve(callback()).catch(()=>{}).finally(()=>{running=false})}catch{running=false}};
 const timer=window.setInterval(()=>{if(Date.now()-lastRun>=delay)run()},Math.min(delay,1000));
 listeners.add(run);
 return()=>{stopped=true;window.clearInterval(timer);listeners.delete(run)};
}
