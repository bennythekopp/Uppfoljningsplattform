const fs=require('fs'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:9,module:1}}).outputText,f);
const {backupDue,validOptions}=require('../lib/backup/options.ts'),{addRecentColor,recentColorList}=require('../app/planning-recent-colors.ts'),{noticeTimestamp,noticeLocalTime}=require('../app/notification-time.ts');
const t=s=>Date.parse(s),base={enabled:true,schedule_kind:'interval',interval_hours:24,send_time:'02:15',schedule_anchored:true};
assert.equal(backupDue(base,t('2026-10-31T01:14Z')),false);assert.equal(backupDue(base,t('2026-10-31T01:15Z')),true);
assert.equal(backupDue({...base,last_queued_at:t('2026-10-31T01:17Z')},t('2026-10-31T22:00Z')),false);assert.equal(backupDue({...base,last_queued_at:t('2026-10-31T01:17Z')},t('2026-11-01T01:15Z')),true);
const six={...base,send_time:'02:00',interval_hours:6,last_queued_at:t('2026-10-31T01:03Z')};assert.equal(backupDue(six,t('2026-10-31T06:59Z')),false);assert.equal(backupDue(six,t('2026-10-31T07:00Z')),true);
// DST spring gap catches up once; autumn duplicate hour does not repeat.
assert.equal(backupDue({...base,send_time:'02:30',last_queued_at:t('2026-03-28T01:30Z')},t('2026-03-29T01:00Z')),true);
assert.equal(backupDue({...base,send_time:'02:30',last_queued_at:t('2026-10-25T00:30Z')},t('2026-10-25T01:30Z')),false);
assert.equal(backupDue({...base,enabled:false},t('2026-10-31T07:00Z')),false);
// Legacy schedules retain elapsed-hour behavior until administrator saves a time.
assert.equal(backupDue({...base,schedule_anchored:false,last_queued_at:1000},1000+24*3600000-1),false);assert.equal(backupDue({...base,schedule_anchored:false,last_queued_at:1000},1000+24*3600000),true);
let colors=[];for(const c of ['#111111','#222222','#333333','#444444','#555555','#666666'])colors=addRecentColor(colors,c);assert.deepEqual(colors,['#666666','#555555','#444444','#333333','#222222']);colors=addRecentColor(colors,'#444444');assert.deepEqual(colors,['#444444','#666666','#555555','#333333','#222222']);assert.deepEqual(addRecentColor(colors,''),colors);assert.deepEqual(recentColorList(['#AABBCC','#aabbcc','red',null,'#123456']),['#aabbcc','#123456']);
assert.equal(noticeTimestamp('2026-10-31T12:00'),t('2026-10-31T11:00Z'));assert.equal(noticeTimestamp('2026-07-01T12:00'),t('2026-07-01T10:00Z'));assert.throws(()=>noticeTimestamp('2026-03-29T02:30'));assert.throws(()=>noticeTimestamp('2026-02-30T12:00'));assert.equal(noticeLocalTime(noticeTimestamp('2026-10-25T02:30')),'2026-10-25T02:30');
console.log('PASS v7: anchored backup time/legacy schedules/DST, recent five colors deduplication/order/removal, Swedish datetime parsing.');
