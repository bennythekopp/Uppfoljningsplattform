import {getStore} from '@netlify/blobs';
import {createHash,randomUUID} from 'node:crypto';

// Only wake times are stored here; never users, secrets, mail or assessment data.
// Scope by database AND context so deploy previews cannot pause production jobs.
function hosted(){return !!(process.env.NETLIFY||process.env.SITE_ID||process.env.NETLIFY_BLOBS_CONTEXT)}
function store(){return getStore({name:'tc-boden-scheduler-v1',consistency:'strong'})}
function key(job:string){return (process.env.CONTEXT||'production')+'/'+createHash('sha256').update(process.env.NETLIFY_DB_URL||process.env.DATABASE_URL||'unconfigured').digest('hex').slice(0,24)+'/'+job}
export async function wakeScheduledJobs(){
 if(!hosted())return;
 for(const job of ['mail','backup'])await store().setJSON(key(job),{at:0,version:randomUUID()});
}
export async function runScheduled(job:string,work:()=>Promise<number|null>,now=Date.now()){
 // Local development and integration tests retain the ordinary SQL path.
 if(!hosted()){await work();return}
 const s=store(),k=key(job);
 const entry=await s.getWithMetadata(k,{type:'json'});
 if(entry&&(entry.data.at===null||entry.data.at>now))return;
 // Atomic lease prevents concurrent ticks. A crash is retried after 20 minutes.
 const lease=await s.setJSON(k,{at:now+20*60000,version:randomUUID()},entry?{onlyIfMatch:entry.etag}:{onlyIfNew:true});
 if(!lease.modified)return;
 const claimed=await s.getWithMetadata(k,{type:'json'});
 // Do not overwrite an invalidation from a concurrent settings/data change.
 if(!claimed||claimed.etag!==lease.etag)return;
 let next:number|null=now+15*60000;
 try{next=await work()}finally{await s.setJSON(k,{at:next,version:randomUUID()},{onlyIfMatch:claimed.etag})}
}

export async function wakePushNotifications(){if(hosted())await store().setJSON(key('push'),{at:0,version:randomUUID()})}
