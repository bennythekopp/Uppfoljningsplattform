const fs=require('fs'),Module=require('module'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:1,target:9,esModuleInterop:true}}).outputText,f);
const orig=Module._load;Module._load=function(name){if(name==='server-only')return {};if(name==='pg')return {__esModule:true,default:{types:{setTypeParser(){}},Pool:class{}}};return orig.apply(this,arguments)};
(async()=>{
 const {importedDocumentState}=require('../app/document-import.ts'),{decodeDocument,wordFromState,documentBlocks,pdf}=require('../lib/backup/render.ts');
 const src='data:image/png;base64,'+fs.readFileSync('public/document-art/train.png').toString('base64');
 const state=importedDocumentState('Bild och högtid',{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Jul 🎄, påsk 🐣 och Halloween 🎃'}]},{type:'image',attrs:{src,alt:'Tåg',width:120,height:60,align:'right'}}]});
 const image=decodeDocument(state).tabs[0].json.content.find(n=>n.type==='image');assert.equal(image.attrs.width,120);assert.equal(image.attrs.align,'right');
 const word=await wordFromState(state),zip=await require('jszip').loadAsync(word),xml=await zip.file('word/document.xml').async('string');assert.match(xml,/Jul 🎄/);assert.match(xml,/cx="1143000" cy="571500"/);assert.ok(Object.keys(zip.files).some(n=>n.startsWith('word/media/')));
 const blocks=documentBlocks(state);assert.equal(blocks.find(b=>b.image).imageWidth,120);assert.equal(blocks.find(b=>b.image).imageAlign,'right');assert.ok((await pdf('Dokument',blocks)).subarray(0,5).toString()==='%PDF-');
 const ext=require('../app/document-extensions.ts').documentExtensions().find(e=>e.name==='image');const attrs=ext.config.renderHTML({HTMLAttributes:image.attrs})[1];assert.equal(attrs.width,120);assert.ok(attrs.style.includes('margin-left:auto'));assert.equal(ext.config.renderHTML({HTMLAttributes:{src:'https://tracking.test/image.png'}})[1].src,'');
 assert.throws(()=>importedDocumentState('Nej',{type:'doc',content:[{type:'image',attrs:{src:'https://tracking.test/pixel'}}]}));
 console.log('PASS V20 documents: embedded gallery PNGs, emoji text, image dimensions/alignment through collaboration/import, Word image/text, backup PDF and rejection of remote images.');
})().catch(e=>{console.error(e);process.exitCode=1});
