const fs=require('fs'),assert=require('node:assert/strict'),ts=require('typescript');require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:9,module:1}}).outputText,f);
const {backupDue,validOptions,catalogTree,selectedPath,toggleSelection}=require('../lib/backup/options.ts');
const base={enabled:true,schedule_kind:'daily',send_time:'07:00',interval_hours:24,week_day:1};
assert.equal(backupDue(base,Date.parse('2026-10-30T05:59Z')),false);assert.equal(backupDue(base,Date.parse('2026-10-30T06:00Z')),true);assert.equal(backupDue({...base,last_queued_at:Date.parse('2026-10-30T06:00Z')},Date.parse('2026-10-30T20:00Z')),false);
assert.equal(backupDue({...base,enabled:false},Date.parse('2026-10-30T09:00Z')),false);
assert.equal(backupDue({...base,schedule_kind:'weekly'},Date.parse('2026-11-02T06:00Z')),true);assert.equal(backupDue({...base,schedule_kind:'weekly'},Date.parse('2026-11-03T06:00Z')),false);
// Swedish summer/winter transition: clock jumps forward run after threshold, repeated hour does not duplicate.
assert.equal(backupDue({...base,send_time:'02:30'},Date.parse('2026-03-29T01:00Z')),true);
assert.equal(backupDue({...base,send_time:'02:30',last_queued_at:Date.parse('2026-10-25T00:30Z')},Date.parse('2026-10-25T01:30Z')),false);
assert.equal(backupDue({...base,schedule_kind:'interval',interval_hours:6,last_queued_at:1000},1000+6*3600000),true);
const options={copyMode:'selected',selectedPaths:['Personal'],scheduleKind:'daily',intervalHours:24,sendTime:'07:00',weekDay:1};assert.equal(validOptions(options),true);for(const selectedPaths of [[],['../Personal'],['Personal/../Elever'],['Personal/'],['Personal','Personal']])assert.equal(validOptions({...options,selectedPaths}),false);
const files=[{path:'Personal/A/Operativ/2026',kind:'protocol'},{path:'Personal/A/Simulator/2026',kind:'protocol'},{path:'Personal/B/Operativ/2026',kind:'protocol'},{path:'Elever/A/Examen',kind:'protocol'}],tree=catalogTree(files);
let paths=toggleSelection([],'Personal',true,tree);assert.ok(selectedPath(files[0].path,paths));paths=toggleSelection(paths,'Personal/A/Simulator',false,tree);assert.ok(!selectedPath(files[1].path,paths));assert.ok(selectedPath(files[0].path,paths));assert.ok(selectedPath(files[2].path,paths));assert.ok(!selectedPath(files[3].path,paths));assert.ok(!selectedPath('Personal2/Examen',['Personal']));
console.log('PASS backup frequency/DST, weekly timing, selection validation and folder/individual exclusions.');
