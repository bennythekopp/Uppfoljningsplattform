const fs=require('fs'),assert=require('node:assert/strict'),ts=require('typescript');require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:9,module:1}}).outputText,f);
const {planningYearRange,planningDays,planningRange}=require('../app/planning-dates.ts'),{planningPermissions}=require('../app/planning-permissions.ts'),{isoWeek}=require('../app/grundschema-types.ts');
for(let year=2020;year<=2099;year++){
 const a=planningYearRange(year),b=planningYearRange(year+1),days=planningDays(a.start,a.end);
 assert.equal(new Date(a.start+'T12:00Z').getUTCDay(),1);assert.equal(new Date(a.end+'T12:00Z').getUTCDay(),1);assert.equal(days.length%7,0);assert.equal(new Set(days).size,days.length);assert.ok(days.includes(year+'-01-01')&&days.includes(year+'-12-31'));
 const overlap=days.filter(d=>d>=b.start);assert.ok(overlap.length===0||overlap.length===7);if(overlap.length)assert.deepEqual(overlap,planningDays(b.start,a.end));
}
assert.deepEqual(planningYearRange(2027),{start:'2026-12-28',end:'2028-01-03'});assert.equal(isoWeek('2027-01-03'),53);assert.equal(isoWeek('2027-01-04'),1);
const range=planningRange(2026,true,'2026-12-29');assert.ok(range.end>'2027-12-29');assert.ok(planningDays(range.start,range.end).includes('2027-01-01'));
const settings={editorEmails:['editor'],suggesterEmails:['instructor','chief']};for(const [role,email,want]of[['Administratör','admin',[true,false]],['Instruktör','editor',[true,false]],['Instruktör','instructor',[false,true]],['Chef','chief',[false,true]],['Chef','editor',[false,false]],['Handledare','instructor',[false,false]],['Instruktör','none',[false,false]]]){const p=planningPermissions({role,email},settings);assert.deepEqual([p.canEdit,p.canSuggest],want)}
assert.equal(planningPermissions({role:'Chef',email:'chief'},{...settings,suggesterEmails:[]}).canSuggest,false);
console.log('PASS: complete ISO boundary weeks in both year views (2020–2099), continuous dashboard into next year and per-role permissions.');
