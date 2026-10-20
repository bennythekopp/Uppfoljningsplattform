'use client';
import {generateJSON,type JSONContent} from '@tiptap/core';
import {documentExtensions} from './document-extensions';

const tags=new Set('P H1 H2 H3 H4 H5 H6 BR STRONG B EM I U S SUB SUP BLOCKQUOTE UL OL LI TABLE THEAD TBODY TR TH TD A IMG HR SPAN DIV PRE CODE'.split(' '));
const images=/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;
const safeLink=/^(https?:\/\/|mailto:)/i;
export const supportedDocuments='.docx,.html,.htm,.txt';

function cleanHTML(html:string){
 const parsed=new DOMParser().parseFromString(html,'text/html');
 for(const el of [...parsed.body.querySelectorAll('*')]){
  if(['SCRIPT','STYLE','SVG','IFRAME','OBJECT','EMBED','FORM','META','LINK'].includes(el.tagName)){el.remove();continue}
  if(!tags.has(el.tagName)){el.replaceWith(...Array.from(el.childNodes));continue}
  const href=el.getAttribute('href')||'',src=el.getAttribute('src')||'',rawStyle=el.getAttribute('style')||'';
  for(const attr of [...el.attributes])el.removeAttribute(attr.name);
  if(el.tagName==='A'&&safeLink.test(href))el.setAttribute('href',href.slice(0,1000));
  if(el.tagName==='IMG'){
   if(images.test(src)&&src.length<900000)el.setAttribute('src',src);
   else el.remove();
  }
  if(rawStyle&&rawStyle.length<500&&!/url\s*\(|expression\s*\(/i.test(rawStyle)){
   const filtered=rawStyle.split(';').map(s=>s.trim()).filter(s=>/^(color|background-color|font-size|font-family|text-align|text-decoration|font-weight|font-style|margin-left|line-height)\s*:/i.test(s));
   if(filtered.length)el.setAttribute('style',filtered.join(';'));
  }
 }
 return parsed.body.innerHTML;
}
export async function readDocumentFile(file:File):Promise<{title:string,content:JSONContent}>{
 if(file.size>2000000)throw Error('Välj en fil under 2 MB.');
 const extension=file.name.toLowerCase().split('.').pop(),title=file.name.replace(/\.(docx|html?|txt)$/i,'').trim().slice(0,300)||'Importerat dokument';
 let html='';
 if(extension==='docx'){
  try{
   const mammoth=await import('mammoth/mammoth.browser');
   const converted=await mammoth.convertToHtml({arrayBuffer:await file.arrayBuffer()});html=converted.value;
  }catch{throw Error('Word-filen kunde inte läsas. Kontrollera att den är i DOCX-format.')}
 }else if(extension==='html'||extension==='htm')html=await file.text();
 else if(extension==='txt')html=(await file.text()).split(/\r?\n/).map(line=>'<p>'+line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</p>').join('');
 else throw Error('Välj en Word-fil (DOCX), HTML-fil eller textfil (TXT).');
 if(html.length>2500000)throw Error('Dokumentet är för stort efter konvertering.');
 const content=generateJSON(cleanHTML(html),documentExtensions()) as JSONContent;
 if(!content.content?.length)content.content=[{type:'paragraph'}];
 return {title,content};
}
