import * as Y from 'yjs';
import {getSchema} from '@tiptap/core';
import {prosemirrorJSONToYXmlFragment} from '@tiptap/y-tiptap';
import {documentExtensions} from './document-extensions';
import {PanelError,short} from './panel-server';

/** Convert the editor's validated document JSON to a fresh collaborative document. */
export function importedDocumentState(title:string,content:unknown){
 const serialized=JSON.stringify(content);
 if(!serialized||serialized.length>2600000)throw new PanelError('Filen är för stor att importera',413);
 let blocks=0;
 function inspect(value:any,depth=0):void{
  if(!value||typeof value!=='object'||depth>40)throw new PanelError('Ogiltigt dokumentinnehåll');
  if(++blocks>50000)throw new PanelError('Dokumentet innehåller för många delar',413);
  if(value.type==='image'&&!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value.attrs?.src||''))throw new PanelError('Bilder måste vara inbäddade PNG, JPEG eller WebP');
  for(const mark of value.marks||[])if(mark.type==='link'&&!/^(https?:\/\/|mailto:)/i.test(mark.attrs?.href||''))throw new PanelError('Ogiltig länk i dokumentet');
  if(value.content){if(!Array.isArray(value.content))throw new PanelError('Ogiltigt dokumentinnehåll');value.content.forEach((child:unknown)=>inspect(child,depth+1))}
 }
 if((content as any)?.type!=='doc')throw new PanelError('Ogiltigt dokumentinnehåll');
 inspect(content);
 const schema=getSchema(documentExtensions());let node;
 try{node=schema.nodeFromJSON(content);node.check()}catch{throw new PanelError('Dokumentets format kunde inte läsas')}
 const doc=new Y.Doc(),tabId=crypto.randomUUID();
 try{
  doc.getMap('meta').set('title',short(title)||'Importerat dokument');doc.getMap('meta').set('tabsVersion',1);
  doc.getArray('tabs').push([{id:tabId,title:'Översikt'}]);
  prosemirrorJSONToYXmlFragment(schema,node.toJSON(),doc.getXmlFragment('tab-'+tabId));
  const encoded=Buffer.from(Y.encodeStateAsUpdate(doc)).toString('base64');
  if(encoded.length>3500000)throw new PanelError('Det importerade dokumentet är för stort',413);
  return encoded;
 }finally{doc.destroy()}
}
