'use client';
import {generateHTML,type JSONContent} from '@tiptap/core';
import {yXmlFragmentToProsemirrorJSON} from '@tiptap/y-tiptap';
import {documentExtensions} from './document-extensions';
import {outputReport,pdfFileName} from './pdf-print';
import type {DocSession} from './document-client';
export function documentTabs(s:DocSession){return s.doc.getArray<{id:string,title:string}>('tabs').toArray().map(t=>({...t,json:yXmlFragmentToProsemirrorJSON(s.doc.getXmlFragment('tab-'+t.id)) as JSONContent}))}
function download(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)}
export function exportBackup(s:DocSession){import('./document-client').then(({bytes64})=>import('yjs').then(Y=>download(new Blob([JSON.stringify({format:'tc-boden-document-v1',state:bytes64(Y.encodeStateAsUpdate(s.doc))})],{type:'application/json'}),'Dokument-lokal-kopia.json')))}
export async function exportDocument(s:DocSession,format:'pdf'|'print'|'word',onError:(m:string)=>void){
 const meta=s.doc.getMap('meta'),title=String(meta.get('title')||'Dokument'),allTabs=documentTabs(s),tabs=allTabs.filter(t=>JSON.stringify(t.json).includes('\"text\":')||JSON.stringify(t.json).includes('\"image\"')||JSON.stringify(t.json).includes('\"table\"'));
 if(!tabs.length&&allTabs.length)tabs.push(allTabs[0]);
 if(format==='word'){
  const d=await import('docx');const {Paragraph,TextRun,Document,Packer,Table,TableRow,TableCell,ExternalHyperlink,ImageRun}=d;
  type Child=InstanceType<typeof TextRun>|InstanceType<typeof ExternalHyperlink>|InstanceType<typeof ImageRun>;
  function inline(node:JSONContent):Child[]{if(node.type==='hardBreak')return [new TextRun({text:'',break:1})];if(node.type==='image'){const src=String(node.attrs?.src||''),match=/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(src);if(match)return [new ImageRun({type:match[1]==='jpeg'?'jpg':'png',data:Uint8Array.from(atob(match[2]),c=>c.charCodeAt(0)),transformation:{width:460,height:300}})];return []}
   if(node.type==='text'){const marks=node.marks||[],style=marks.find(m=>m.type==='textStyle')?.attrs||{},color=/^#[a-f\d]{6}$/i.test(style.color||'')?style.color.slice(1):undefined;
    const run=new TextRun({text:node.text||'',bold:marks.some(m=>m.type==='bold'),italics:marks.some(m=>m.type==='italic'),underline:marks.some(m=>m.type==='underline')?{}:undefined,strike:marks.some(m=>m.type==='strike'),superScript:marks.some(m=>m.type==='superscript'),subScript:marks.some(m=>m.type==='subscript'),shading:/^#[a-f\d]{6}$/i.test(style.backgroundColor||'')?{fill:style.backgroundColor.slice(1),type:d.ShadingType.CLEAR}:undefined,color,font:style.fontFamily||'Arial',size:style.fontSize?Math.max(12,Math.min(144,parseFloat(style.fontSize)*2)):22});
    const href=marks.find(m=>m.type==='link')?.attrs?.href;return href&&/^(https?:|mailto:)/i.test(href)?[new ExternalHyperlink({link:href,children:[run]})]:[run]}
   return (node.content||[]).flatMap(inline)
  }
  function blocks(nodes:JSONContent[],level=0,list?:'bullet'|'ordered'|'task'):(InstanceType<typeof Paragraph>|InstanceType<typeof Table>)[]{return nodes.flatMap((n):ReturnType<typeof blocks>=>{
   if(n.type==='table')return [new Table({width:{size:100,type:d.WidthType.PERCENTAGE},rows:(n.content||[]).map(row=>new TableRow({children:(row.content||[]).map(cell=>new TableCell({children:blocks(cell.content||[]),columnSpan:cell.attrs?.colspan||1,rowSpan:cell.attrs?.rowspan||1,shading:/^#[a-f\d]{6}$/i.test(cell.attrs?.backgroundColor||'')?{fill:cell.attrs!.backgroundColor.slice(1)}:undefined}))}))})];
   if(['bulletList','orderedList','taskList'].includes(n.type||''))return blocks(n.content||[],level,n.type==='orderedList'?'ordered':n.type==='taskList'?'task':'bullet');
   if(n.type==='listItem'||n.type==='taskItem'){const rows=blocks(n.content||[],level+1);if(rows[0] instanceof Paragraph){const first=n.content?.[0];rows[0]=new Paragraph({children:[new TextRun({text:list==='ordered'?String((nodes.indexOf(n)+1))+'. ':list==='task'?(n.attrs?.checked?'☑ ':'☐ '):'• '}),...inline(first||{})],indent:{left:Math.max(0,level)*360},spacing:{after:100}})}return rows}
   if(n.type==='pageBreak')return [new Paragraph({children:[new d.PageBreak()]})];
   if(n.type==='horizontalRule')return [new Paragraph({text:'────────────────────────────────'})];
   return [new Paragraph({children:inline(n),heading:n.type==='heading'?({1:d.HeadingLevel.HEADING_1,2:d.HeadingLevel.HEADING_2,3:d.HeadingLevel.HEADING_3}[Number(n.attrs?.level) as 1|2|3]||d.HeadingLevel.HEADING_3):undefined,alignment:({left:d.AlignmentType.LEFT,center:d.AlignmentType.CENTER,right:d.AlignmentType.RIGHT,justify:d.AlignmentType.JUSTIFIED} as Record<string,(typeof d.AlignmentType)[keyof typeof d.AlignmentType]>)[n.attrs?.textAlign||'left'],indent:n.attrs?.indent?{left:Math.max(0,Math.min(8,Number(n.attrs.indent)))*360}:undefined,spacing:{after:160,...(n.attrs?.lineHeight?{line:Math.round(Number(n.attrs.lineHeight)*240)}:{})},keepNext:n.type==='heading'})]
  })}
  const word=new Document({creator:'TC Boden',title,sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1000,right:1000,bottom:1000,left:1000}}},children:tabs.flatMap(tab=>blocks(tab.json.content||[]))}]});download(await Packer.toBlob(word),pdfFileName(title,'Dokument').replace(/\.pdf$/,'.docx'));return;
 }
 const report=document.createElement('article');report.className='printreport document-report';
 for(const tab of tabs){const section=document.createElement('section');section.className='printcategory';const body=document.createElement('div');body.innerHTML=generateHTML(tab.json,documentExtensions());for(const child of Array.from(body.children)){const moment=document.createElement('section');moment.className='printmoment document-print-block';moment.append(child);section.append(moment)}report.append(section)}
 document.body.append(report);
 if(format==='pdf')outputReport(pdfFileName(title,'Dokument'),()=>report.remove(),onError);
 else{const done=()=>{report.remove();window.removeEventListener('afterprint',done)};window.addEventListener('afterprint',done);window.print();setTimeout(done,60000)}
}
