import {Extension} from '@tiptap/core';
import {Plugin,PluginKey} from '@tiptap/pm/state';
import {Decoration,DecorationSet} from '@tiptap/pm/view';
import type {Editor} from '@tiptap/core';
import {pageGeometry,type DocumentPageSettings} from './document-page-settings';
const key=new PluginKey<DecorationSet>('tc-page-layout');
export const DocumentPagination=Extension.create({name:'documentPagination',addProseMirrorPlugins(){return [new Plugin({key,state:{init:()=>DecorationSet.empty,apply(tr,old){const next=tr.getMeta(key);return next===undefined?old.map(tr.mapping,tr.doc):next}},props:{decorations:state=>key.getState(state)}})]}});
export function pageGap(top:number,bottom:number,height:number,offset:number,size:number){const stride=height+24,page=Math.max(0,Math.floor((offset-top)/stride)),limit=page*stride+height-bottom;return offset+size>limit+.5?(page+1)*stride+top-offset:0}
// Decorations live only in the view: no page-break transactions, undo entries or Yjs writes.
export function paginateEditor(editor:Editor,paper:HTMLElement,settings:DocumentPageSettings,onPages:(n:number)=>void){let timer:ReturnType<typeof setTimeout>|undefined,dead=false;const g=pageGeometry(settings),px=96/25.4,top=Math.max(settings.top,settings.header?15:0)*px,bottom=Math.max(settings.bottom,settings.footer||settings.pageNumbers?15:0)*px,height=g.height*px,stride=height+24;
 const layout=()=>{if(dead||editor.isDestroyed||editor.view.composing)return;const view=editor.view,root=view.dom;const old=Array.from(root.querySelectorAll<HTMLElement>('[data-pagination-gap]'));old.forEach(n=>n.style.display='none');const origin=paper.getBoundingClientRect().top,scale=paper.getBoundingClientRect().width/paper.offsetWidth||1;const lines:{pos:number,top:number,size:number,row?:boolean,manual?:boolean}[]=[];
 try{editor.state.doc.descendants((node,pos)=>{
  if(node.type.name==='tableRow'){const dom=view.nodeDOM(pos) as HTMLElement|null;if(dom){const rect=dom.getBoundingClientRect();if(rect.height/scale>height-top-bottom)return true;lines.push({pos,top:(rect.top-origin)/scale,size:rect.height/scale,row:true})}return false}
  if(node.type.name==='pageBreak'){const dom=view.nodeDOM(pos) as HTMLElement|null;if(dom)lines.push({pos,top:(dom.getBoundingClientRect().top-origin)/scale,size:1,manual:true});return false}
  if(node.isTextblock){let lastY=-Infinity; if(!node.content.size){const dom=view.nodeDOM(pos) as HTMLElement|null;if(dom){const rect=dom.getBoundingClientRect();lines.push({pos,top:(rect.top-origin)/scale,size:rect.height/scale})}return false}
   let i=0;while(i<node.content.size){const p=pos+1+i;try{const at=view.coordsAtPos(p,1),y=(at.top-origin)/scale;if(Math.abs(y-lastY)>2){lines.push({pos:p,top:y,size:(at.bottom-at.top)/scale});lastY=y}let lo=i+1,hi=node.content.size;while(lo<hi){const mid=Math.floor((lo+hi)/2),probe=view.coordsAtPos(pos+1+mid,1);if(probe.top<=at.top+2*scale)lo=mid+1;else hi=mid}i=Math.max(i+1,lo)}catch{i++}}

   return false;
  }
  if(node.isAtom&&node.isBlock){const dom=view.nodeDOM(pos) as HTMLElement|null;if(dom){const rect=dom.getBoundingClientRect();lines.push({pos,top:(rect.top-origin)/scale,size:rect.height/scale})}return false}return true;
 });}finally{old.forEach(n=>n.style.display='')}
 lines.sort((a,b)=>a.top-b.top||a.pos-b.pos);const decorations:Decoration[]=[];let shift=0,end=top;
 for(let i=0;i<lines.length;){const group=[lines[i++]];while(i<lines.length&&Math.abs(lines[i].top-group[0].top)<2&&!lines[i].manual&&!group[0].manual)group.push(lines[i++]);const line={...group[0],size:Math.max(...group.map(v=>v.size))};const position=line.top+shift;let gap=line.manual?(Math.floor((position-top)/stride)+1)*stride+top-position:pageGap(top,bottom,height,position,line.size);if(gap>1&&line.size<=height-top-bottom){shift+=gap;for(const member of group)decorations.push(Decoration.widget(member.pos,()=>{const el=document.createElement(member.row?'tr':'span');el.dataset.paginationGap='true';el.contentEditable='false';el.setAttribute('aria-hidden','true');el.className='document-pagination-gap';el.style.cssText=`display:${member.row?'table-row':'block'};height:${gap}px;min-height:${gap}px;pointer-events:none;user-select:none`;if(member.row){const td=document.createElement('td');td.colSpan=100;td.style.cssText=`height:${gap}px;padding:0;border:0`;el.append(td)}return el},{side:-1,ignoreSelection:true,key:'gap-'+member.pos+'-'+gap.toFixed(1)}))}end=Math.max(end,line.top+shift+line.size)}
 const decos=DecorationSet.create(editor.state.doc,decorations);view.dispatch(editor.state.tr.setMeta(key,decos).setMeta('addToHistory',false));onPages(Math.max(1,Math.ceil((end+bottom)/stride)));
 };
 const schedule=()=>{if(timer)clearTimeout(timer);timer=setTimeout(layout,120)};editor.on('update',schedule);const observer=new ResizeObserver(schedule);observer.observe(paper);rootImages();function rootImages(){paper.addEventListener('load',schedule,true)}window.addEventListener('resize',schedule);document.fonts?.ready.then(schedule);document.fonts?.addEventListener('loadingdone',schedule);schedule();
 return()=>{dead=true;clearTimeout(timer);observer.disconnect();editor.off('update',schedule);window.removeEventListener('resize',schedule);paper.removeEventListener('load',schedule,true);document.fonts?.removeEventListener('loadingdone',schedule)};
}
