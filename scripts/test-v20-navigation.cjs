const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
let cursor=0,slots=[],effects=[],renderedValue={tab:'instructor',hubView:'overview',docLocation:{document:'',documentTab:''}},owner='a',fail=false,error='',restored=0;
const listeners=new Map(),stack=[{state:{__NA:true},url:'https://tcboden.se/'}];let index=0;
const location={get href(){return stack[index].url}};
const window={addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
const history={get state(){return stack[index].state},replaceState:(state,_,url)=>{stack[index]={state:structuredClone(state),url:String(url)}},pushState:(state,_,url)=>{stack.splice(index+1);stack.push({state:structuredClone(state),url:String(url)});index++},go:n=>{if(index+n<0||index+n>=stack.length)return;index+=n;void listeners.get('popstate')?.({state:history.state})}};
const react={useRef:v=>{const i=cursor++;return slots[i]??=( {current:v})},useEffect:(f,deps)=>{const i=cursor++,old=slots[i];if(!old||deps.some((v,j)=>v!==old.deps[j])){effects.push(()=>{old?.cleanup?.();slots[i]={deps,cleanup:f()}})}}};
const exportsObject={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/navigation-history.ts','utf8'),{compilerOptions:{module:1,target:9}}).outputText,{exports:exportsObject,require:()=>react,history,window,location,URL});
function render(){cursor=0;effects=[];exportsObject.useNavigationHistory(owner,true,renderedValue,value=>{renderedValue=value;restored++},async()=>{if(fail)throw Error('offline')},m=>error=m);for(const effect of effects)effect()}
const settle=()=>new Promise(r=>setImmediate(r));
(async()=>{
 render();assert.equal(stack.length,1);assert.equal(history.state.__NA,true);
 renderedValue={...renderedValue,hubView:'documents',docLocation:{document:'doc1',documentTab:'tab1'}};history.replaceState(history.state,'','https://tcboden.se/?document=doc1&documentTab=tab1');render();assert.equal(stack.length,2);assert.equal(stack[0].url,'https://tcboden.se/','previous URL survives child replaceState');render();assert.equal(stack.length,2,'no duplicate rerender entry');
 renderedValue={...renderedValue,tab:'students',hubView:'overview',docLocation:{document:'',documentTab:''}};render();assert.equal(index,2);
 history.go(-1);await settle();render();assert.equal(renderedValue.docLocation.document,'doc1');assert.equal(index,1);assert.equal(stack.length,3);
 history.go(1);await settle();render();assert.equal(renderedValue.tab,'students');assert.equal(index,2);
 fail=true;history.go(-1);await settle();render();assert.equal(index,2,'failed flush reverts movement without dropping edits');assert.match(error,/offline/);assert.equal(renderedValue.tab,'students');fail=false;
 owner='b';render();assert.equal(history.state.tcNavigation.owner,'b');const before=restored;history.go(-1);await settle();assert.equal(restored,before,'other account history never restores private state');
 console.log('PASS V20 navigation: actual hook, back/forward, no duplicate entries, document URLs, flush failure, account isolation and Next state preservation.');
})().catch(e=>{console.error(e);process.exitCode=1});
