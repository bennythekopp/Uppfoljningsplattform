import type {PanelData} from './panel-types';
const cache=new Map<string,{data:PanelData,at:number}>();
const lifetime=30000;
export function panelCacheKey(user:{email:string,role?:string,previewRole?:string|null}){return JSON.stringify([user.email,user.role||'',user.previewRole||''])}
export function cachedPanel(key:string,now=Date.now()){const entry=cache.get(key);if(!entry||now-entry.at>lifetime){cache.delete(key);return null}return entry.data}
export function cachePanel(key:string,data:PanelData,now=Date.now()){cache.delete(key);cache.set(key,{data,at:now});while(cache.size>8)cache.delete(cache.keys().next().value!)}
export function clearPanelCache(){cache.clear()}
