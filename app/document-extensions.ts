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
const SafeImage=Image.extend({renderHTML({HTMLAttributes}){const src=String(HTMLAttributes.src||'');return ['img',{src:/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(src)?src:'',alt:String(HTMLAttributes.alt||''),title:String(HTMLAttributes.title||'')}]}});
const ColoredCell=TableCell.extend({addAttributes(){return {...this.parent?.(),backgroundColor:{default:null,parseHTML:e=>e.style.backgroundColor||null,renderHTML:a=>a.backgroundColor?{style:`background-color:${a.backgroundColor}`}:{}}}}});
const ColoredHeader=TableHeader.extend({addAttributes(){return {...this.parent?.(),backgroundColor:{default:null,parseHTML:e=>e.style.backgroundColor||null,renderHTML:a=>a.backgroundColor?{style:`background-color:${a.backgroundColor}`}:{}}}}});
const BlockStyle=Extension.create({name:'blockStyle',addGlobalAttributes(){return [{types:['paragraph','heading'],attributes:{indent:{default:0,parseHTML:e=>Math.max(0,Math.min(8,parseFloat(e.style.marginLeft)/24||0)),renderHTML:a=>a.indent?{style:`margin-left:${Math.max(0,Math.min(8,Number(a.indent)||0))*24}px`}:{}},lineHeight:{default:null,parseHTML:e=>e.style.lineHeight||null,renderHTML:a=>/^\d(\.\d+)?$/.test(a.lineHeight||'')?{style:`line-height:${a.lineHeight}`}:{}}}}]}});
const PageBreak=Node.create({name:'pageBreak',group:'block',atom:true,parseHTML(){return [{tag:'div[data-page-break]'}]},renderHTML({HTMLAttributes}){return ['div',mergeAttributes(HTMLAttributes,{'data-page-break':'true',class:'document-page-break',style:'break-after:page;page-break-after:always'} )]}});
export function documentExtensions(){return [BlockStyle,PageBreak,Subscript,Superscript,StarterKit.configure({undoRedo:false,link:{openOnClick:false,defaultProtocol:'https',protocols:['https','http','mailto']}}),TextStyleKit,TextAlign.configure({types:['heading','paragraph']}),TableKit.configure({table:{resizable:true},tableCell:false,tableHeader:false}),ColoredCell,ColoredHeader,SafeImage.configure({allowBase64:true}),TaskList,TaskItem.configure({nested:true})]}
