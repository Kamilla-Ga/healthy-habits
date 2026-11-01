import test from 'node:test';
import assert from 'node:assert/strict';
import {blank,load,getDay,setDay,validate,weekSummary,KEY} from './model.js';
function store(entries){const m=new Map(entries);return {getItem:k=>m.get(k)??null,key:i=>[...m.keys()][i],get length(){return m.size;}};}
test('migrates original checkmarks without deleting history',()=>{const s=load(store([['healthy-habits:2026-10-31','["water","sleep"]']]));assert.deepEqual(s.days['2026-10-31'].completed,['water','sleep']);assert.equal(s.days['2026-10-31'].habitIds.length,5);validate(s);});
test('separates missing days from recorded days and preserves past habits',()=>{let s=blank();s=setDay(s,'2026-11-01',{completed:['water'],values:{water:8,sleep:7}});s.habits.push({id:'custom-one',title:'Йога',icon:'✨',unit:'',target:1});assert.equal(getDay(s,'2026-11-01').habitIds.length,5);assert.equal(getDay(s,'2026-11-02').habitIds.length,6);assert.equal(s.days['2026-10-31'],undefined);const w=weekSummary(s,'2026-11-01');assert.equal(w.recorded,1);assert.equal(w.percent,20);assert.equal(w.averages.sleep,7);assert.equal(w.averages.activity,null);});
test('backup round trip and malformed backup rejection',()=>{const s=blank();s.profile.firstName='Камилла';assert.deepEqual(load(store([[KEY,JSON.stringify(s)]])),s);assert.throws(()=>validate({version:2}));const bad=blank();bad.days['2026-11-01']={completed:['bad'],habitIds:['water'],values:{},note:'',mood:''};assert.throws(()=>validate(bad));});
test('converts minute-based goals and history to hours exactly once, including backups',()=>{
 const s=blank();
 for(const h of s.habits)if(['activity','learning'].includes(h.id)){h.unit='минут';h.target=h.id==='activity'?30:90;}
 const old=setDay(s,'2026-11-01',{completed:['activity'],values:{activity:45,learning:120,sleep:8},note:'История'});
 const migrated=load(store([[KEY,JSON.stringify(old)]]));
 assert.equal(migrated.habits.find(h=>h.id==='activity').target,0.5);
 assert.equal(migrated.habits.find(h=>h.id==='learning').target,1.5);
 assert.deepEqual(migrated.days['2026-11-01'].values,{activity:0.75,learning:2,sleep:8});
 assert.deepEqual(migrated.days['2026-11-01'].completed,['activity']);
 assert.equal(migrated.days['2026-11-01'].note,'История');
 assert.equal(old.days['2026-11-01'].values.activity,45);
 assert.deepEqual(validate(migrated),migrated);
 assert.deepEqual(load(store([[KEY,JSON.stringify(migrated)]])),migrated);
 assert.deepEqual(validate(JSON.parse(JSON.stringify(old))),migrated);
});
