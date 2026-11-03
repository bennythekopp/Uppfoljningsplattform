import {secureApi} from '../../../api-security';
import {currentUser,error} from '../../../auth';
import {GET as planningGET} from '../route';
import {planningDate} from '../../../planning-server';
import {PanelError} from '../../../panel-server';
import {addDays} from '../../../grundschema-types';
import {exportRows,calendarExport} from '../../../planning-export-data';
import {requireModule} from '../../../module-access';
import type {PlanningData} from '../../../planning-types';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
export const runtime='nodejs';
export const dynamic='force-dynamic';
async function get(req:Request){try{
 const actor=(await currentUser())!;await requireModule(actor,'planning');
 const p=new URL(req.url).searchParams,from=planningDate(p.get('from')),to=planningDate(p.get('to')),format=p.get('format'),scope=p.get('scope');
 if(from>to||(Date.parse(to)-Date.parse(from))/86400000>366)throw new PanelError('Välj högst 367 dagar.');
 if(!['pdf','xlsx','apple','android'].includes(format||'')||!['mine','all'].includes(scope||''))throw new PanelError('Välj exportformat och innehåll.');
 const url=new URL('/api/planning',req.url);url.search=new URLSearchParams({year:from.slice(0,4),from,to:addDays(to,1)}).toString();
 const response=await planningGET(new Request(url,{headers:req.headers}));if(!response.ok)return response;
 const data:PlanningData=await response.json(),rows=exportRows(data,from,to,actor.email,scope as 'mine'|'all');
 if(!rows.length)throw new PanelError('Det finns ingen planeringskolumn kopplad till ditt konto. Välj samtliga.');
 if(rows.length>20000)throw new PanelError('För många rader. Välj en kortare period.');
 const name='TC-Boden-Planering-'+from+'-'+to;
 let bytes:Uint8Array,type:string,ext:string;
 if(format==='xlsx'){
 const book=new ExcelJS.Workbook(),sheet=book.addWorksheet('Planering');sheet.columns=[{header:'Datum',key:'day',width:14},{header:'Namn / kolumn',key:'name',width:28},{header:'Tur',key:'tour',width:20},{header:'Uppgift / text',key:'task',width:60}];sheet.views=[{state:'frozen',ySplit:1}];sheet.autoFilter='A1:D1';
 sheet.getRow(1).font={bold:true};for(const r of rows){const row=sheet.addRow({day:r.day,name:r.name,tour:r.tour,task:r.task});row.alignment={vertical:'top',wrapText:true};for(const [col,color] of [[3,r.tourColor],[4,r.taskColor]] as const)if(/^#[0-9a-f]{6}$/i.test(color)){const c=row.getCell(col);c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF'+color.slice(1)}};const lum=parseInt(color.slice(1,3),16)*.299+parseInt(color.slice(3,5),16)*.587+parseInt(color.slice(5,7),16)*.114;c.font={color:{argb:lum<145?'FFFFFFFF':'FF17191B'}}}}
 bytes=new Uint8Array(await book.xlsx.writeBuffer());type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';ext='xlsx';
 }else if(format==='pdf'){
 const doc=new PDFDocument({size:'A4',layout:'landscape',margin:28}),chunks:Buffer[]=[];
 const done=new Promise<Uint8Array>((resolve,reject)=>{doc.on('data',c=>chunks.push(c));doc.on('end',()=>resolve(new Uint8Array(Buffer.concat(chunks))));doc.on('error',reject)});
 const xs=[28,105,280,390],widths=[77,175,110,395];let y=0;
 function heading(){doc.fillColor('#17191b').font('Helvetica-Bold').fontSize(16).text('TC Boden – Planering',28,28);doc.font('Helvetica').fontSize(10).text(from+' – '+to,28,50);y=72;['Datum','Namn / kolumn','Tur','Uppgift / text'].forEach((v,i)=>doc.text(v,xs[i]+5,y,{width:widths[i]-10}));y+=22}
 heading();for(const r of rows){const values=[r.day,r.name,r.tour,r.task];doc.font('Helvetica').fontSize(9);const h=Math.max(28,...values.map((v,i)=>doc.heightOfString(v||'–',{width:widths[i]-10})+12));if(h>450)throw new PanelError('En textruta är för lång för PDF. Välj Excel för hela texten.');if(y+h>doc.page.height-28){doc.addPage();heading()}
 values.forEach((v,i)=>{const c=i===2?r.tourColor:i===3?r.taskColor:'';if(/^#[0-9a-f]{6}$/i.test(c))doc.rect(xs[i],y,widths[i],h).fill(c);doc.fillColor(c&&parseInt(c.slice(1,3),16)*.299+parseInt(c.slice(3,5),16)*.587+parseInt(c.slice(5,7),16)*.114<145?'#ffffff':'#17191b').text(v||'–',xs[i]+5,y+5,{width:widths[i]-10});doc.strokeColor('#dddddd').rect(xs[i],y,widths[i],h).stroke()});y+=h}
 doc.end();bytes=await done;type='application/pdf';ext='pdf';
 }else{bytes=new TextEncoder().encode(calendarExport(rows));type='text/calendar; charset=utf-8';ext='ics'}
 return new Response(bytes as BodyInit,{headers:{'Content-Type':type,'Content-Disposition':`attachment; filename="${name}.${ext}"`,'X-Content-Type-Options':'nosniff'}});
 }catch(e){return error(e instanceof PanelError?e.message:'Kunde inte exportera planeringen.',e instanceof PanelError?e.status:503)}}
export const GET=secureApi('/api/planning/export',get);
