import {secureApi} from '../../../api-security';
import {currentUser,error} from '../../../auth';
import {GET as planningGET} from '../route';
import {planningDate} from '../../../planning-server';
import {PanelError} from '../../../panel-server';
import {addDays} from '../../../grundschema-types';
import {exportRows,calendarExport} from '../../../planning-export-data';
import {requireModule} from '../../../module-access';
import type {PlanningData} from '../../../planning-types';
import {gridExcel,gridPdf,planningExportGrid} from '../../../planning-export-grid';
import {parseColumnLayout} from '../../../planning-column-layout';
export const runtime='nodejs';
export const dynamic='force-dynamic';
async function get(req:Request){try{
 const actor=(await currentUser())!;await requireModule(actor,'planning');
 const p=new URL(req.url).searchParams,from=planningDate(p.get('from')),to=planningDate(p.get('to')),format=p.get('format'),scope=p.get('scope');
 if(from>to||(Date.parse(to)-Date.parse(from))/86400000>366)throw new PanelError('Välj högst 367 dagar.');
 if(!['pdf','xlsx','apple','android'].includes(format||'')||!['mine','all'].includes(scope||''))throw new PanelError('Välj exportformat och innehåll.');
 const parts:{data:PlanningData,rows:ReturnType<typeof exportRows>,from:string,to:string}[]=[];
 for(let year=Number(from.slice(0,4));year<=Number(to.slice(0,4));year++){
  const start=from>year+'-01-01'?from:year+'-01-01',end=to<year+'-12-31'?to:year+'-12-31';
  const url=new URL('/api/planning',req.url);url.search=new URLSearchParams({year:String(year),from:start,to:addDays(end,1),view:'export'}).toString();
  const response=await planningGET(new Request(url,{headers:req.headers}));if(!response.ok)return response;
  const data:PlanningData=await response.json();parts.push({data,rows:exportRows(data,start,end,actor.email,scope as 'mine'|'all'),from:start,to:end});
 }
 const rows=parts.flatMap(p=>p.rows);
 if(!rows.length)throw new PanelError('Det finns ingen planeringskolumn kopplad till ditt konto. Välj samtliga.');
 if(rows.length>20000)throw new PanelError('För många rader. Välj en kortare period.');
 const name='TC-Boden-Planering-'+from+'-'+to;
 let bytes:Uint8Array,type:string,ext:string;
 if(format==='xlsx'||format==='pdf'){
  const raw=req.headers.get('x-tc-column-layout');
  const layout=parseColumnLayout(raw?decodeURIComponent(raw):null);
  const grid=parts.filter(p=>p.rows.length).map(p=>planningExportGrid(p.data,p.rows,p.from,p.to,layout,req.headers.get('x-tc-app')==='planning'));
  const dark=req.headers.get('x-tc-planning-theme')==='dark';
  bytes=format==='xlsx'?await gridExcel(grid,dark):await gridPdf(grid,dark);
  type=format==='xlsx'?'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'application/pdf';
  ext=format;
 }else{bytes=new TextEncoder().encode(calendarExport(rows));type='text/calendar; charset=utf-8';ext='ics'}
 return new Response(bytes as BodyInit,{headers:{'Content-Type':type,'Content-Disposition':`attachment; filename="${name}.${ext}"`,'X-Content-Type-Options':'nosniff'}});
 }catch(e){return error(e instanceof PanelError?e.message:'Kunde inte exportera planeringen.',e instanceof PanelError?e.status:503)}}
export const GET=secureApi('/api/planning/export',get);
