'use client';

type Block={element:HTMLElement,newPage:boolean,heading:boolean};

/** Lay out real page elements before rasterisation; never slice through a card. */
export function paginateReport(report:HTMLElement,size={width:190,height:275}){
 const doc=report.ownerDocument,win=doc.defaultView!,pages:HTMLElement[]=[];
 const blocks:Block[]=[];
 for(const child of Array.from(report.children) as HTMLElement[]){
  const children=Array.from(child.children) as HTMLElement[];
  if(child.matches('.printcategory,.personnelprintsection')&&children.length){
   const margin=win.getComputedStyle(child).marginTop;
   let manualBreak=false;
   children.forEach((part,index)=>{
    if(part.matches('[data-page-break]')||part.querySelector('[data-page-break]')){manualBreak=true;return}
    const wrapper=child.cloneNode(false) as HTMLElement;
    wrapper.style.setProperty('margin',index===0?`${margin} 0 0`:'0','important');
    wrapper.style.display='flow-root';wrapper.append(part.cloneNode(true));
    blocks.push({element:wrapper,newPage:manualBreak||index===0&&win.getComputedStyle(child).breakBefore==='page',heading:/^H[1-6]$/.test(part.tagName)||!!part.querySelector(':scope > h1,:scope > h2,:scope > h3')});manualBreak=false;
   });
  }else blocks.push({element:child.cloneNode(true) as HTMLElement,newPage:false,heading:/^H[1-6]$/.test(child.tagName)});
 }
 function newPage(){
  const page=report.cloneNode(false) as HTMLElement;page.classList.add('pdf-export-page');
  page.style.cssText=`display:flow-root!important;box-sizing:border-box!important;width:${size.width}mm!important;height:${size.height}mm!important;min-height:0!important;padding:0!important;margin:0!important;overflow:visible!important`;
  doc.body.append(page);pages.push(page);return page;
 }
 let page=newPage();
 function fits(){
  const bounds=page.getBoundingClientRect();
  return Array.from(page.children).every(child=>{
   const style=win.getComputedStyle(child);
   return child.getBoundingClientRect().bottom+Math.max(0,parseFloat(style.marginBottom)||0)<=bounds.bottom-2;
  });
 }
 let measuredHeight=0;
 function tryAppend(element:HTMLElement){
  page.append(element);measuredHeight=element.getBoundingClientRect().height+Math.max(0,parseFloat(win.getComputedStyle(element).marginBottom)||0);
  if(fits())return true;element.remove();return false;
 }
 function advance(){
  const last=page.lastElementChild as HTMLElement|null;
  const heading=last?.dataset.pdfKeepNext==='true'?last:null;
  heading?.remove();
  if(!page.children.length){page.remove();pages.pop()}
  page=newPage();if(heading)page.append(heading);
 }
 function fitWholeMoment(element:HTMLElement){
  // A moment larger than the printable area still stays in one piece.
  const holder=doc.createElement('div');
  holder.style.cssText='position:relative;display:flow-root;width:100%;margin:0;padding:0';
  page.append(holder);holder.append(element);
  element.style.setProperty('margin','0','important');
  const original=element.getBoundingClientRect(),position=holder.getBoundingClientRect(),bounds=page.getBoundingClientRect();
  const available=bounds.bottom-position.top-3;
  if(available<=0||original.height<=0)throw Error('Momentet kunde inte placeras på PDF-sidan.');
  element.style.position='absolute';element.style.top='0';
  element.style.left='0';
  // Reflow at the scaled width so the whole moment still uses the page width.
  let low=.01,high=1;
  for(let attempt=0;attempt<18;attempt++){
   const scale=(low+high)/2;element.style.width=`${position.width/scale}px`;
   if(element.getBoundingClientRect().height*scale<=available)low=scale;else high=scale;
  }
  const scale=low;element.style.width=`${position.width/scale}px`;
  holder.style.height=`${element.getBoundingClientRect().height*scale}px`;
  element.style.transformOrigin='top left';element.style.transform=`scale(${scale})`;
 }
 function chunks(block:HTMLElement,build:(start:number,end:number,continuation:boolean)=>HTMLElement,count:number){
  let start=0;
  while(start<count){
   let low=start+1,high=count,best:HTMLElement|null=null,end=start;
   while(low<=high){
    const middle=Math.floor((low+high)/2),candidate=build(start,middle,start>0);
    if(tryAppend(candidate)){candidate.remove();best=candidate;end=middle;low=middle+1}else high=middle-1;
   }
   if(!best){
    if(Array.from(page.children).some(child=>(child as HTMLElement).dataset.pdfKeepNext!=='true')){advance();continue}
    throw Error('Ett moment kunde inte sidindelas utan att kapa innehåll. Prova att korta momentets rubrik eller bild.');
   }
   page.append(best);start=end;if(start<count)advance();
  }
 }
 function splitLarge(block:HTMLElement){
  const tbody=block.querySelector('tbody'),rows=tbody?Array.from(tbody.rows):[];
  if(rows.length>1){
   chunks(block,(start,end)=>{
    const copy=block.cloneNode(true) as HTMLElement;
    copy.querySelector('tbody')!.replaceChildren(...rows.slice(start,end).map(row=>row.cloneNode(true)));
    return copy;
   },rows.length);return;
  }
  const target=block.matches('.printmoment')?block:block.querySelector<HTMLElement>('.printmoment')||block;
  const head=target.querySelector<HTMLElement>(':scope > .printmomenthead,:scope > h2');
  const body=doc.createElement('div');
  for(const node of Array.from(target.childNodes))if(node!==head)body.append(node.cloneNode(true));
  const walker=doc.createTreeWalker(body,NodeFilter.SHOW_TEXT),ends:{node:Node,offset:number}[]=[];
  let node:Node|null;
  while((node=walker.nextNode())){
   const text=node.textContent||'';
   for(const match of text.matchAll(/\S+\s*/g)){
    const finish=match.index!+match[0].length;
    for(let offset=match.index!+40;offset<finish;offset+=40)ends.push({node,offset});
    ends.push({node,offset:finish});
   }
  }
  if(!ends.length)throw Error('En bild eller ruta är större än en A4-sida och kunde inte sidindelas.');
  chunks(block,(start,end,continuation)=>{
   const range=doc.createRange();
   if(start)range.setStart(ends[start-1].node,ends[start-1].offset);else range.setStart(body,0);
   if(end===ends.length)range.setEnd(body,body.childNodes.length);else range.setEnd(ends[end-1].node,ends[end-1].offset);
   const copy=block.cloneNode(true) as HTMLElement;
   const destination=target===block?copy:copy.querySelector<HTMLElement>('.printmoment')!;
   const repeated=head?.cloneNode(true) as HTMLElement|undefined;
   if(repeated&&continuation){const title=repeated.querySelector('h3')||repeated;title.append(doc.createTextNode(' (fortsättning)'))}
   destination.replaceChildren(...(repeated?[repeated]:[]),range.cloneContents());
   return copy;
  },ends.length);
 }
 for(const block of blocks){
  if(block.newPage&&page.children.length)advance();
  if(block.heading)block.element.dataset.pdfKeepNext='true';
  if(tryAppend(block.element))continue;
  if(block.element.matches('.printmoment')||block.element.querySelector('.printmoment')){
   if(page.children.length)advance();
   if(!tryAppend(block.element))fitWholeMoment(block.element);
   continue;
  }
  if(measuredHeight>page.getBoundingClientRect().height-2){splitLarge(block.element);continue}
  if(page.children.length)advance();
  if(tryAppend(block.element))continue;
  splitLarge(block.element);
 }
 // Do not leave an isolated section heading on the final page.
 if(!page.children.length){page.remove();pages.pop()}
 report.remove();return pages;
}
