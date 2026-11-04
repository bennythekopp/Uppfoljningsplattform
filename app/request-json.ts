/** Parse API responses without exposing proxy HTML as a JSON exception. No write retries. */
export async function requestJson(response:Response):Promise<any>{
 const text=await response.text();let value:any;
 try{value=JSON.parse(text)}catch{throw Object.assign(Error('Servern kunde inte svara korrekt'+(response.status?' (HTTP '+response.status+')':'')+'. Ändringen är inte bekräftat sparad. Din text finns kvar i den öppna rutan. Försök igen när anslutningen fungerar.'),{status:response.status,invalidResponse:true})}
 if(!response.ok)throw Object.assign(Error(value?.error||'Begäran kunde inte slutföras (HTTP '+response.status+').'),{status:response.status,...(value?.conflict?{conflict:value.conflict}:{})});
 return value;
}
// Only identical concurrent GETs share a response. No cached data between requests,
// no sharing between app/web cookie scopes, no automatic retry of mutations.
const pending=new Map<string,Promise<any>>();let identity=0;
export function resetJsonRequests(){identity++;pending.clear()}
export function fetchJson(url:string,init?:RequestInit):Promise<any>{
 const method=(init?.method||'GET').toUpperCase(),headers=new Headers(init?.headers),key=JSON.stringify([identity,url,init?.credentials||'same-origin',[...headers.entries()].sort()]);
 if(method!=='GET'||init?.signal)return fetch(url,init).then(requestJson);
 const found=pending.get(key);if(found)return found;
 const request=fetch(url,{...init,cache:'no-store'}).then(requestJson).finally(()=>{if(pending.get(key)===request)pending.delete(key)});pending.set(key,request);return request;
}
