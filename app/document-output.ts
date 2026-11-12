'use client';
import {Editor,type JSONContent} from '@tiptap/core';
import {documentExtensions} from './document-extensions';
import {paginateEditor} from './document-pagination';
import {pageGeometry,type DocumentPageSettings} from './document-page-settings';
export async function outputDocument(tabs:{json:JSONContent}[],settings:DocumentPageSettings,filename:string|null){
 const g=pageGeometry(settings),frame=document.createElement('iframe');frame.title='Dokumentutskrift';frame.dataset.documentOutput='true';frame.style.cssText=`position:fixed;left:-20000px;top:0;width:${g.width*96/25.4}px;height:${g.height*96/25.4}px;border:0`;document.body.append(frame);
 let printing=false;const remove=()=>frame.remove();
 try{const doc=frame.contentDocument!;doc.open();doc.write('<!doctype html><html lang="sv"><head><meta charset="utf-8"></head><body></body></html>');doc.close();
 // Copy authored document styles only; app print rules must not override page geometry.
 for(const sheet of Array.from(document.styleSheets)){try{const style=doc.createElement('style');style.textContent=Array.from(sheet.cssRules).map(r=>r.cssText).join('\n');doc.head.append(style)}catch{throw Error('Dokumentstilen kunde inte läsas. Ladda om sidan och försök igen.')}}
 const style=doc.createElement('style');style.textContent=`@page{size:${g.width}mm ${g.height}mm;margin:0}html,body{margin:0!important;padding:0!important;background:#fff!important;width:${g.width}mm!important;color:#292929}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.output-page{position:relative!important;display:block!important;box-sizing:border-box;width:${g.width}mm!important;height:${g.height}mm!important;padding:0!important;margin:0!important;break-after:page;page-break-after:always;overflow:hidden!important}.output-page:last-child{break-after:auto;page-break-after:auto}.output-page .document-paper{position:absolute!important;margin:0!important;left:0;outline:0!important;box-shadow:none!important}.output-page .document-page-sheet{display:block!important;box-shadow:none!important;border:0!important}`;doc.head.append(style);
 await renderDocumentPages(doc,tabs,settings);
 if(!filename){printing=true;frame.contentWindow!.addEventListener('afterprint',remove,{once:true});frame.contentWindow!.focus();frame.contentWindow!.print();setTimeout(remove,120000);return}
 await new Promise<void>((resolve,reject)=>{const script=doc.createElement('script');script.src=new URL('/vendor/html2pdf-0.14.0.bundle.min.js',location.href).href;script.onload=()=>resolve();script.onerror=()=>reject(Error('PDF-funktionen kunde inte laddas.'));doc.head.append(script)});
 let pdf:any;for(const sheet of Array.from(doc.querySelectorAll<HTMLElement>('.output-page'))){const worker=(frame.contentWindow as any).html2pdf().set({margin:0,image:{type:'jpeg',quality:.98},jsPDF:{unit:'mm',format:[g.width,g.height],orientation:settings.orientation},pagebreak:{mode:[]},html2canvas:{scale:2,foreignObjectRendering:true,backgroundColor:'#fff',useCORS:true,logging:false,windowWidth:Math.ceil(g.width*96/25.4)}}).from(sheet).toCanvas();const canvas=await worker.get('canvas');if(!pdf){await worker.toPdf();pdf=await worker.get('pdf');while(pdf.getNumberOfPages()>1)pdf.deletePage(pdf.getNumberOfPages());pdf.setPage(1);pdf.addImage(canvas.toDataURL('image/jpeg',.98),'JPEG',0,0,g.width,g.height)}else{pdf.addPage();pdf.addImage(canvas.toDataURL('image/jpeg',.98),'JPEG',0,0,g.width,g.height)}}
 if(!pdf)throw Error('Dokumentet är tomt.');const url=URL.createObjectURL(pdf.output('blob')),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 }finally{if(!printing)remove()}
}

export async function renderDocumentPages(doc:Document,tabs:{json:JSONContent}[],settings:DocumentPageSettings){
 const g=pageGeometry(settings);
 // Use the editor's exact layout engine and freeze its measured DOM before printing.
 // Each output sheet clips one viewport of that layout; print media cannot reflow it.
 await doc.fonts.ready;
 for(const tab of tabs){
  const paper=doc.createElement('div');paper.className='document-paper paginated';
  const variables:Record<string,string>={'--doc-width':g.width+'mm','--doc-height':g.height+'mm','--doc-top':Math.max(settings.top,settings.header?15:0)+'mm','--doc-right':settings.right+'mm','--doc-bottom':Math.max(settings.bottom,settings.footer||settings.pageNumbers?15:0)+'mm','--doc-left':settings.left+'mm'};
  for(const [name,value] of Object.entries(variables))paper.style.setProperty(name,value);
  doc.body.append(paper);const mount=doc.createElement('div');paper.append(mount);
  const editor=new Editor({element:mount,extensions:documentExtensions(),content:tab.json,editable:false,editorProps:{attributes:{class:'document-prose'}}});
  let stop=()=>{};
  try{await doc.fonts.ready;await Promise.all(Array.from(paper.querySelectorAll('img')).map(i=>i.decode().catch(()=>undefined)));
   const count=await new Promise<number>((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Sidlayouten kunde inte beräknas. Försök igen.')),10000);stop=paginateEditor(editor,paper,settings,n=>{clearTimeout(timeout);resolve(n)})});stop();
   paper.style.setProperty('--doc-pages',String(count));
   for(let i=0;i<count;i++){const bg=doc.createElement('div');bg.className='document-page-sheet';bg.style.top=i*(g.height*96/25.4+24)+'px';const header=doc.createElement('header');header.textContent=settings.header;const footer=doc.createElement('footer');const label=doc.createElement('span');label.textContent=settings.footer;footer.append(label);if(settings.pageNumbers){const number=doc.createElement('span');number.textContent=String(i+1);footer.append(number)}bg.append(header,footer);paper.prepend(bg)}
   // Freeze computed values so print-only CSS cannot change line wrapping or spacing.
   const frozen=paper.cloneNode(true) as HTMLElement;const source=[paper,...Array.from(paper.querySelectorAll<HTMLElement>('*'))],target=[frozen,...Array.from(frozen.querySelectorAll<HTMLElement>('*'))];
   source.forEach((el,i)=>{const computed=doc.defaultView!.getComputedStyle(el);for(const prop of Array.from(computed)){if(/^(TABLE|TBODY|THEAD|TFOOT|TR|TD|TH)$/.test(el.tagName)&&/^(height|min-height|max-height|width|min-width|max-width)$/.test(prop))continue;target[i].style.setProperty(prop,/^(break-|page-break-)/.test(prop)?'auto':computed.getPropertyValue(prop),'important')}});
   for(let i=0;i<count;i++){const sheet=doc.createElement('div');sheet.className='output-page';const slice=frozen.cloneNode(true) as HTMLElement;slice.style.setProperty('position','absolute','important');slice.style.setProperty('top',-(i*(g.height*96/25.4+24))+'px','important');slice.style.setProperty('margin','0','important');sheet.append(slice);doc.body.append(sheet)}
  }finally{stop();editor.destroy();paper.remove()}
 }
}
