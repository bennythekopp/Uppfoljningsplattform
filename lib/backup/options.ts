export type CopyMode='all'|'changed'|'selected';
export type BackupOptions={copyMode:CopyMode,selectedPaths:string[],scheduleKind:'interval'|'daily'|'weekly',intervalHours:number,sendTime:string,weekDay:number,scheduleAnchored?:boolean};
export const copyModeLabels:Record<CopyMode,string>={all:'Samtliga filer',changed:'Endast uppdaterade filer',selected:'Utvalda filer'};
export function optionsFromRow(row:any):BackupOptions{return {copyMode:row.copy_mode||'all',selectedPaths:row.selected_paths||[],scheduleKind:row.schedule_kind||'interval',intervalHours:row.interval_hours||24,sendTime:row.send_time||'07:00',weekDay:row.week_day||1,scheduleAnchored:row.schedule_anchored===true}}
export function validOptions(o:BackupOptions){return (o.scheduleAnchored===undefined||typeof o.scheduleAnchored==='boolean')&&['all','changed','selected'].includes(o.copyMode)&&Array.isArray(o.selectedPaths)&&o.selectedPaths.length<=10000&&new Set(o.selectedPaths).size===o.selectedPaths.length&&o.selectedPaths.every(p=>typeof p==='string'&&p.length<=500&&/^(Instruktörspanel|Personal|Elever)(\/|$)/.test(p)&&!p.split('/').some(s=>!s||s==='.'||s==='..')&&!/[\\\x00-\x1f]/.test(p))&&(o.copyMode!=='selected'||o.selectedPaths.length>0)&&['interval','daily','weekly'].includes(o.scheduleKind)&&[1,6,12,24].includes(o.intervalHours)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(o.sendTime)&&Number.isInteger(o.weekDay)&&o.weekDay>=1&&o.weekDay<=7}
export function selectedPath(path:string,selected:string[]){return selected.some(p=>path===p||path.startsWith(p+'/'))}
function localTime(now:number){const parts=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now),get=(key:string)=>parts.find(p=>p.type===key)!.value;return {day:get('year')+'-'+get('month')+'-'+get('day'),time:get('hour')+':'+get('minute')}}
export function backupDue(row:any,now=Date.now()){
 if(!row.enabled)return false;const o=optionsFromRow(row),last=Number(row.last_queued_at||0);
 if(o.scheduleKind==='interval'){
  if(!o.scheduleAnchored)return !last||now-last>=o.intervalHours*3600000;
  const local=localTime(now);if(!last)return local.time>=o.sendTime;
  // Local wall-clock slots keep the chosen Swedish start time across DST.
  const slot=(stamp:number)=>{const t=localTime(stamp),[h,m]=t.time.split(':').map(Number),[sh,sm]=o.sendTime.split(':').map(Number);return Math.floor((Date.parse(t.day+'T00:00Z')+(h*60+m-sh*60-sm)*60000)/(o.intervalHours*3600000))};
  return slot(now)>slot(last);
 }
 const local=localTime(now);if(local.time<o.sendTime||last&&localTime(last).day>=local.day)return false;
 return o.scheduleKind==='daily'||(new Date(local.day+'T12:00Z').getUTCDay()||7)===o.weekDay;
}
export type CatalogNode={path:string,name:string,children:CatalogNode[],kind?:string};
export function catalogTree(files:{path:string,kind:string}[]):CatalogNode[]{const roots:CatalogNode[]=[];for(const file of files){let children=roots,path='';for(const [i,part] of file.path.split('/').entries()){path+=(path?'/':'')+part;let node=children.find(n=>n.path===path);if(!node){node={path,name:part.replace(/_[a-f0-9]{10}(?=\.|$)/,''),children:[]};children.push(node)}if(i===file.path.split('/').length-1)node.kind=file.kind;children=node.children}}const sort=(nodes:CatalogNode[])=>{nodes.sort((a,b)=>Number(!!a.kind)-Number(!!b.kind)||a.name.localeCompare(b.name,'sv'));nodes.forEach(n=>sort(n.children))};sort(roots);return roots}
// Removing one child of a selected folder retains its siblings, without selecting the excluded child again.
export function toggleSelection(paths:string[],path:string,checked:boolean,tree:CatalogNode[]):string[]{
 if(checked){if(selectedPath(path,paths))return paths;return [...paths.filter(p=>!p.startsWith(path+'/')),path]}
 const result=paths.filter(p=>p!==path&&!p.startsWith(path+'/'));
 const ancestor=paths.find(p=>path.startsWith(p+'/'));if(!ancestor)return result;
 result.splice(result.indexOf(ancestor),1);
 const visit=(nodes:CatalogNode[])=>{for(const n of nodes){if(n.path===path)continue;if(path.startsWith(n.path+'/'))visit(n.children);else result.push(n.path)}};
 const find=(nodes:CatalogNode[]):CatalogNode|undefined=>{for(const n of nodes){if(n.path===ancestor)return n;const v=find(n.children);if(v)return v}};visit(find(tree)?.children||[]);return result;
}
