import StarterKit from '@tiptap/starter-kit';
import {TextStyleKit} from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import {TableKit} from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
// Embedded raster images only: no remote tracking image, SVG script, or fetch on export.
const SafeImage=Image.extend({renderHTML({HTMLAttributes}){const src=String(HTMLAttributes.src||'');return ['img',{src:/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(src)?src:'',alt:String(HTMLAttributes.alt||''),title:String(HTMLAttributes.title||'')}]}});
export function documentExtensions(){return [StarterKit.configure({undoRedo:false,link:{openOnClick:false,defaultProtocol:'https',protocols:['https','http','mailto']}}),TextStyleKit,TextAlign.configure({types:['heading','paragraph']}),TableKit.configure({table:{resizable:true}}),SafeImage.configure({allowBase64:true}),TaskList,TaskItem.configure({nested:true})]}
