const fs=require('fs'),assert=require('node:assert/strict'),ts=require('typescript'),path=require('path');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:9,module:1,jsx:4,esModuleInterop:true}}).outputText,f);
require.extensions['.css']=()=>{};
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{PlanningMailDialog}=require('../app/planning-suggestions.tsx'),ModuleAccessSettings=require('../app/module-access-settings.tsx').default;
const initial={enabled:true,recipientUser:'qa@test',recipientEmail:'qa@example.invalid',cadence:'daily',sendTime:'08:30',configured:true,lastError:'',needsReview:false,lastSentAt:0,revision:7};
const markup=renderToStaticMarkup(React.createElement(PlanningMailDialog,{initial,users:[{email:'qa@test',name:'Exempel Person'}],inline:true,onClose(){},async onSaved(){}}));
assert.ok(!markup.includes('modalback')&&!markup.includes('role="dialog"')&&!markup.includes('aria-label="Stäng"'));
for(const text of ['Mailinställningar','Mottagande instruktör','Mailadress','Skicka klockan (svensk tid)','08:30','qa@example.invalid','Återställ ändringar'])assert.ok(markup.includes(text),text);
const moduleMarkup=renderToStaticMarkup(React.createElement(ModuleAccessSettings,{}));assert.ok(moduleMarkup.includes('admin-module-access')&&!moduleMarkup.includes('modalback'));
// Verify all native cancel buttons carry shared styling and cannot submit a form.
let count=0;
for(const file of fs.readdirSync(path.join(__dirname,'../app')).filter(f=>f.endsWith('.tsx'))){const text=fs.readFileSync(path.join(__dirname,'../app',file),'utf8'),tree=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);function walk(n){if(ts.isJsxElement(n)&&n.openingElement.tagName.getText(tree)==='button'&&n.children.some(c=>ts.isJsxText(c)&&c.text.trim()==='Avbryt')){const attrs=n.openingElement.attributes.properties;const cl=attrs.find(a=>a.name?.getText(tree)==='className'),type=attrs.find(a=>a.name?.getText(tree)==='type');assert.ok(cl?.initializer?.getText(tree).includes('cancel-button'),file);assert.equal(type?.initializer?.text,'button',file);count++}ts.forEachChild(n,walk)}walk(tree)}
assert.ok(count>=29);console.log('PASS v7: real inline forms preserve mail fields, no extra popup; '+count+' native cancel buttons styled and non-submitting.');
