import {DocumentPagination} from './document-pagination';
import {Extension,Node,mergeAttributes} from '@tiptap/core';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import StarterKit from '@tiptap/starter-kit';
import {TextStyleKit} from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import {TableCell,TableHeader,TableKit} from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
// Embedded raster images only: no remote tracking image, SVG script, or fetch on export.
const SafeImage=Image.extend({
 addAttributes(){return {...this.parent?.(),width:{default:null,parseHTML:e=>Number(e.getAttribute('width'))||null},height:{default:null,parseHTML:e=>Number(e.getAttribute('height'))||null},align:{default:'left',parseHTML:e=>e.getAttribute('data-align')||'left'}}},
 renderHTML({HTMLAttributes}){const src=String(HTMLAttributes.src||''),width=Number(HTMLAttributes.width)>0?Math.max(24,Math.min(1600,Number(HTMLAttributes.width))):null,height=Number(HTMLAttributes.height),align=['left','center','right'].includes(HTMLAttributes.align)?HTMLAttributes.align:'left';return ['img',{src:/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(src)?src:'',alt:String(HTMLAttributes.alt||''),title:String(HTMLAttributes.title||''),...(width?{width}:{}),...(height>0&&height<=5000?{height}:{}),'data-align':align,style:`width:${width?width+'px':'auto'};max-width:100%;height:auto;display:block;margin-left:${align==='left'?'0':'auto'};margin-right:${align==='right'?'0':'auto'}`} ]}
});
const ColoredCell=TableCell.extend({addAttributes(){return {...this.parent?.(),backgroundColor:{default:null,parseHTML:e=>e.style.backgroundColor||null,renderHTML:a=>a.backgroundColor?{style:`background-color:${a.backgroundColor}`}:{}}}}});
const ColoredHeader=TableHeader.extend({addAttributes(){return {...this.parent?.(),backgroundColor:{default:null,parseHTML:e=>e.style.backgroundColor||null,renderHTML:a=>a.backgroundColor?{style:`background-color:${a.backgroundColor}`}:{}}}}});
const BlockStyle=Extension.create({name:'blockStyle',addGlobalAttributes(){return [{types:['paragraph','heading'],attributes:{documentStyle:{default:'p',parseHTML:e=>e.getAttribute('data-document-style')||'p',renderHTML:a=>a.documentStyle==='title'?{'data-document-style':'title',style:'font-size:32pt;font-weight:400;line-height:1.2'}:a.documentStyle==='subtitle'?{'data-document-style':'subtitle',style:'font-size:18pt;color:#777;line-height:1.3'}:{}},...Object.fromEntries(['spaceBefore','spaceAfter'].map((key,index)=>[key,{default:null,parseHTML:(e:HTMLElement)=>{const v=index?e.style.marginBottom:e.style.marginTop;return v?parseFloat(v):null},renderHTML:(a:Record<string,unknown>)=>a[key]!==null&&Number.isFinite(Number(a[key]))?{style:`margin-${index?'bottom':'top'}:${Math.max(0,Math.min(120,Number(a[key])))}pt`}:{}}])),indent:{default:0,parseHTML:e=>Math.max(0,Math.min(8,parseFloat(e.style.marginLeft)/24||0)),renderHTML:a=>a.indent?{style:`margin-left:${Math.max(0,Math.min(8,Number(a.indent)||0))*24}px`}:{}},lineHeight:{default:null,parseHTML:e=>e.style.lineHeight||null,renderHTML:a=>/^\d(\.\d+)?$/.test(a.lineHeight||'')?{style:`line-height:${a.lineHeight}`}:{}}}}]}});
const PageBreak=Node.create({name:'pageBreak',group:'block',atom:true,parseHTML(){return [{tag:'div[data-page-break]'}]},renderHTML({HTMLAttributes}){return ['div',mergeAttributes(HTMLAttributes,{'data-page-break':'true',class:'document-page-break',style:'break-after:page;page-break-after:always'} )]}});
export function documentExtensions(){return [DocumentPagination,BlockStyle,PageBreak,Subscript,Superscript,StarterKit.configure({undoRedo:false,link:{openOnClick:false,defaultProtocol:'https',protocols:['https','http','mailto']}}),TextStyleKit,TextAlign.configure({types:['heading','paragraph']}),TableKit.configure({table:{resizable:true},tableCell:false,tableHeader:false}),ColoredCell,ColoredHeader,SafeImage.configure({allowBase64:true}),TaskList,TaskItem.configure({nested:true})]}
