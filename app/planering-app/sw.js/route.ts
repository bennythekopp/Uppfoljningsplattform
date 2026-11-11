export function GET(){return new Response(`const CACHE='tcpa-shell-v20';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('tcpa-shell-')&&k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/')||e.request.headers.get('RSC'))return;if(!u.pathname.startsWith('/_next/static/')&&!u.pathname.startsWith('/planning-app/')&&!['/planering-app','/planering-app/'].includes(u.pathname))return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,copy)))}return r}).catch(()=>caches.match(e.request).then(r=>r||Response.error())))});
self.addEventListener('push',e=>e.waitUntil((async()=>{
 let p;try{p=e.data.json()}catch{return}
 if(!p||typeof p.title!=='string'||typeof p.body!=='string'||!/^\\d{4}-\\d\\d-\\d\\d$/.test(p.day||''))return;
 let allowed=false;try{const response=await fetch('/api/me',{cache:'no-store',headers:{'x-tc-app':'planning'}});if(response.ok){const user=await response.json();allowed=user.email===p.owner}}catch{}
 const url=new URL('/planering-app',self.location.origin);url.searchParams.set('day',p.day);if(typeof p.columnId==='string')url.searchParams.set('column',p.columnId);
 await self.registration.showNotification(allowed?p.title:'TC Boden Planering',{body:allowed?p.body:'Öppna planeringsappen för att se dina notiser.',icon:'/planning-app/icon-192.png',badge:'/planning-app/icon-192.png',tag:typeof p.tag==='string'?p.tag:'schemaandring',data:{url:url.href}});
})()));
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil((async()=>{let url;try{url=new URL(e.notification.data.url)}catch{return}if(url.origin!==self.location.origin||url.pathname!=='/planering-app')return;const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});const existing=windows.find(w=>new URL(w.url).pathname.startsWith('/planering-app'));if(existing){await existing.navigate(url.href);await existing.focus()}else await self.clients.openWindow(url.href)})())});
`,{headers:{'Content-Type':'application/javascript','Cache-Control':'no-cache','Service-Worker-Allowed':'/planering-app'}})}
