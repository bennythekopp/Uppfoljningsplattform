'use client';
import {paginateReport} from './pdf-pagination';

/** Direct PDF export uses the existing A4 report and the assessment date. */
export function pdfFileName(name:string,kind:string,date?:string|number){
 const iso=typeof date==='number'?new Date(date).toLocaleDateString('sv-SE',{timeZone:'Europe/Stockholm'}):date||new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Stockholm'});
 const compact=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
 const stamp=compact?compact[1].slice(-2)+compact[2]+compact[3]:new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Stockholm'}).replace(/^(\d{4})-(\d{2})-(\d{2})$/,(_,y,m,d)=>y.slice(-2)+m+d);
 const safe=(value:string)=>value.trim().replace(/[\\/:*?"<>|\x00-\x1f]/g,'').replace(/\s+/g,' ');
 return `${safe(name)}_${safe(kind)}_${stamp}.pdf`;
}

type PdfDocument={addPage():void,addImage(image:string,type:string,x:number,y:number,width:number,height:number):void,output(type:'blob'):Blob,getNumberOfPages():number};
type PdfWorker={set(options:Record<string,unknown>):PdfWorker,from(element:HTMLElement):PdfWorker,toCanvas():PdfWorker,toPdf():PdfWorker,get(key:'canvas'):Promise<HTMLCanvasElement>,get(key:'pdf'):Promise<PdfDocument>};
type PdfWindow=Window&{html2pdf:()=>PdfWorker};
let exporting=false;

// Canvas text baselines differ from browser printing. Render the small status labels
// as SVG images in the export copy so their text stays optically centred.
async function renderPdfBadges(report:HTMLElement){
 const doc=report.ownerDocument,win=doc.defaultView!;
 const context=doc.createElement('canvas').getContext('2d');
 const ns='http://www.w3.org/2000/svg';
 await Promise.all(Array.from(report.querySelectorAll<HTMLElement>('.printlevel,.followupoutcome')).map(async badge=>{
  const style=win.getComputedStyle(badge),bounds=badge.getBoundingClientRect(),label=badge.textContent?.trim()||'';
  if(!bounds.width||!bounds.height)return;
  const svg=doc.createElementNS(ns,'svg');
  svg.setAttribute('width',String(bounds.width));svg.setAttribute('height',String(bounds.height));
  svg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
  const border=parseFloat(style.borderTopWidth)||0,rect=doc.createElementNS(ns,'rect');
  for(const [key,value] of Object.entries({x:border/2,y:border/2,width:bounds.width-border,height:bounds.height-border,rx:parseFloat(style.borderTopLeftRadius)||0,fill:style.backgroundColor,stroke:style.borderTopColor,'stroke-width':border}))rect.setAttribute(key,String(value));
  const text=doc.createElementNS(ns,'text');
  if(context)context.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const metrics=context?.measureText(label),ascent=metrics?.actualBoundingBoxAscent??parseFloat(style.fontSize)*.75,descent=metrics?.actualBoundingBoxDescent??0;
  for(const [key,value] of Object.entries({x:bounds.width/2,y:bounds.height/2+(ascent-descent)/2,'text-anchor':'middle','font-family':style.fontFamily,'font-size':style.fontSize,'font-weight':style.fontWeight,fill:style.color}))text.setAttribute(key,String(value));
  text.textContent=label;svg.append(rect,text);
  const image=doc.createElement('img');image.alt=label;
  image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(svg));
  image.style.cssText=`display:inline-block;vertical-align:middle;flex:none;width:${bounds.width}px;height:${bounds.height}px;max-width:none;margin:${style.margin}`;
  await image.decode();badge.replaceWith(image);
 }));
}

// Apply the actual print rules inside an isolated document, leaving the workspace visible.
function printStyles(){
 const rules=(list:CSSRuleList):string=>Array.from(list).map(rule=>{
  if(rule instanceof CSSMediaRule&&rule.conditionText.includes('print'))return rules(rule.cssRules);
  return rule.cssText;
 }).join('\n');
 return Array.from(document.styleSheets).map(sheet=>{
  try{return rules(sheet.cssRules)}catch{throw Error('Utskriftsstilen kunde inte läsas. Ladda om sidan och försök igen.')}
 }).join('\n');
}

export function outputReport(filename:string|null,done:()=>void,onError:(message:string)=>void){
 if(exporting){onError('En PDF skapas redan. Vänta tills den är klar.');done();return}
 if(!filename){try{window.print()}catch{onError('Utskriftsdialogen kunde inte öppnas.');done()}return}
 void downloadReport(filename).catch(e=>onError((e as Error).message||'PDF-filen kunde inte skapas.')).finally(done);
}

async function downloadReport(filename:string){
 const report=document.querySelector<HTMLElement>('body > .printreport:last-of-type')||document.querySelector<HTMLElement>('.app .printreport');
 if(!report)throw Error('Protokollet kunde inte läsas. Försök igen.');
 exporting=true;
 const frame=document.createElement('iframe');
 const progress=document.createElement('div');
 progress.setAttribute('role','status');progress.setAttribute('aria-live','polite');
 progress.textContent='Skapar PDF…';
 progress.style.cssText='position:fixed;inset:0;z-index:1000;background:#ffffffdb;display:grid;place-items:center;font:bold 18px Arial;color:#292929;cursor:wait';
 frame.setAttribute('aria-hidden','true');frame.title='PDF-export';
 frame.style.cssText='position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;pointer-events:none';
 try{
  const styles=printStyles();
  document.body.append(progress,frame);
  const doc=frame.contentDocument!;
  doc.open();doc.write('<!doctype html><html lang="sv"><head><meta charset="utf-8"></head><body></body></html>');doc.close();
  const style=doc.createElement('style');style.textContent=styles+'\nhtml,body{margin:0!important;padding:0!important;background:white!important;width:190mm!important;min-height:0!important}.printreport{display:block!important;width:190mm!important;max-width:none!important;margin:0!important;padding-bottom:6mm!important}.printmoment,.printcomment{overflow-wrap:anywhere}';doc.head.append(style);
  const clone=doc.importNode(report,true);doc.body.append(clone);
  await doc.fonts.ready;
  await renderPdfBadges(clone);
  await Promise.all(Array.from(clone.querySelectorAll('img')).map(img=>img.decode().catch(()=>undefined)));
  await new Promise<void>((resolve,reject)=>{const script=doc.createElement('script');script.src=new URL('/vendor/html2pdf-0.14.0.bundle.min.js',location.href).href;script.onload=()=>resolve();script.onerror=()=>reject(Error('PDF-funktionen kunde inte laddas. Kontrollera anslutningen och försök igen.'));doc.head.append(script)});
  const pages=paginateReport(clone);
  let pdf:PdfDocument|undefined;
  for(const [index,page] of pages.entries()){
   progress.textContent=`Skapar PDF… sida ${index+1} av ${pages.length}`;
   const worker=(frame.contentWindow as PdfWindow).html2pdf().set({
    margin:10,image:{type:'jpeg',quality:0.98},
    jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:[]},
    html2canvas:{scale:2,backgroundColor:'#ffffff',useCORS:true,logging:false,windowWidth:794}
   }).from(page).toCanvas();
   const canvas=await worker.get('canvas');
   if(!pdf){
    await worker.toPdf();pdf=await worker.get('pdf');
    if(pdf.getNumberOfPages()!==1)throw Error('PDF-sidans mått kunde inte bevaras. Försök igen.');
   }else{
    pdf.addPage();pdf.addImage(canvas.toDataURL('image/jpeg',.98),'JPEG',10,10,190,canvas.height/canvas.width*190);
   }
  }
  if(!pdf)throw Error('Det finns inget protokoll att spara.');
  const blob=pdf.output('blob');
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),60000);
 }finally{frame.remove();progress.remove();exporting=false}
}
