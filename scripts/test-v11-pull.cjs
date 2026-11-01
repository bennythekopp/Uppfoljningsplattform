const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
let effects=[],refs=[],sets=[],handlers={},modal=false,targetKind='',nestedTop=0,refreshes=0,release;
const root={addEventListener:(n,f)=>handlers[n]=f,removeEventListener:n=>delete handlers[n],scrollTop:0},target={closest:s=>targetKind==='input'?{}:null,get scrollTop(){return nestedTop},parentElement:root};
const react={useRef(v){const ref={current:v===null?root:v};refs.push(ref);return ref},useEffect:f=>effects.push(f),useState:v=>[v,n=>sets.push(n)]};
const exported={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/pull-refresh.tsx','utf8'),{compilerOptions:{module:1,target:9,jsx:4}}).outputText,{exports:exported,require:n=>n==='react'?react:n==='react/jsx-runtime'?{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})}:{default:()=>null},window:{innerWidth:390,scrollY:0},document:{querySelector:()=>modal?{}:null},Promise,setTimeout,clearTimeout,Error});
exported.PullRefresh({onRefresh:()=>{refreshes++;return new Promise(r=>release=r)},children:'full page'});const clean=effects.map(f=>f());
const event=(x,y)=>({target,touches:[{clientX:x,clientY:y}],cancelable:true,preventDefault(){}}),settle=()=>new Promise(r=>setImmediate(r));
(async()=>{
function drag(dx,dy){handlers.touchstart(event(10,10));handlers.touchmove(event(10+dx,10+dy));handlers.touchend()}
nestedTop=4;drag(0,200);await settle();assert.equal(refreshes,0);nestedTop=0;
targetKind='input';drag(0,200);await settle();assert.equal(refreshes,0);targetKind='';
modal=true;drag(0,200);await settle();assert.equal(refreshes,0);modal=false;
drag(170,30);await settle();assert.equal(refreshes,0);drag(0,90);await settle();assert.equal(refreshes,0);
drag(0,160);await settle();assert.equal(refreshes,1);assert.ok(sets.includes(72),'drag translates the complete wrapped content');assert.ok(sets.includes(48),'released state retains spinner gap');drag(0,200);await settle();assert.equal(refreshes,1,'no concurrent refresh');release();await settle();await new Promise(r=>setTimeout(r,450));assert.equal(sets.at(-3)===0||sets.includes(0),true);clean.forEach(f=>f?.());assert.equal(Object.keys(handlers).length,0);
console.log('PASS pull gesture: nested scroll boundary, input/modal exclusion, horizontal gesture, threshold, whole-content offset, no concurrent refresh and listener cleanup.');
})().catch(e=>{console.error(e);process.exitCode=1});
