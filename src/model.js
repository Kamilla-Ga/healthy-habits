import { dayKey } from './storage.js';
export const KEY = 'healthy-habits:v2';
export const defaults = [
 {id:'water',title:'Вода',icon:'💧',unit:'л',target:2,color:'blue'},
 {id:'sleep',title:'Сон',icon:'🌙',unit:'часов',target:8,color:'lavender'},
 {id:'activity',title:'Активность',icon:'👟',unit:'часов',target:1,color:'lime'},
 {id:'skincare',title:'Skincare',icon:'🧴',unit:'',target:1,color:'pink'},
 {id:'learning',title:'Обучение',icon:'📚',unit:'часов',target:1,color:'peach'},
 {id:'meditation',title:'Медитация',icon:'🧘‍♀️',unit:'часов',target:0.25,color:'lavender'},
 {id:'reading',title:'Чтение книг',icon:'📖',unit:'часов',target:0.5,color:'pink'},
];
export const blank = () => ({version:2,profile:{firstName:'',lastName:'',goal:''},habits:defaults.map(h=>({...h})),days:{}});
export function load(storage) {
 const raw=storage.getItem(KEY);
 if(raw) return addWellnessHabits(validate(JSON.parse(raw)));
 const state=blank();
 for(let i=0;i<storage.length;i++) {
  const key=storage.key(i);
  if(!/^healthy-habits:\d{4}-\d{2}-\d{2}$/.test(key)) continue;
  let ids; try { ids=JSON.parse(storage.getItem(key)); } catch { continue; }
  if(!Array.isArray(ids)) continue;
  const completed=ids.filter(id=>defaults.some(h=>h.id===id));
  state.days[key.slice(15)]={completed,values:{},mood:'',note:'',habitIds:defaults.slice(0,5).map(h=>h.id)};
 }
 return addWellnessHabits(state);
}
export function addWellnessHabits(state,today=dayKey()) {
 const additions=defaults.filter(h=>['meditation','reading'].includes(h.id)&&!state.habits.some(x=>x.id===h.id));
 if(!additions.length)return state;
 const days={...state.days};
 for(const [date,d] of Object.entries(days))if(date>=today)days[date]={...d,habitIds:[...d.habitIds,...additions.map(h=>h.id)]};
 return {...state,habits:[...state.habits,...additions.map(h=>({...h}))],days};
}
export function validate(s) {
 if(!s||s.version!==2||!s.profile||!Array.isArray(s.habits)||!s.habits.length||s.habits.length>32||!s.days||typeof s.days!=='object'||Array.isArray(s.days)) throw Error('Неверный формат копии');
 for(const f of ['firstName','lastName','goal']) if(typeof s.profile[f]!=='string'||s.profile[f].length>1000) throw Error('Неверный профиль');
 const ids=new Set();
 for(const h of s.habits) { if(!h||typeof h.id!=='string'||!/^[-\w]+$/.test(h.id)||ids.has(h.id)||typeof h.title!=='string'||!h.title.trim()||h.title.length>80||typeof h.icon!=='string'||h.icon.length>16||typeof h.unit!=='string'||h.unit.length>30||!Number.isFinite(h.target)||h.target<=0||h.target>10000) throw Error('Неверные привычки'); ids.add(h.id); }
 for(const [date,d] of Object.entries(s.days)) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!d||!Array.isArray(d.completed)||!Array.isArray(d.habitIds)||d.habitIds.some(id=>!ids.has(id))||new Set(d.habitIds).size!==d.habitIds.length||d.completed.some(id=>!d.habitIds.includes(id))||new Set(d.completed).size!==d.completed.length||typeof d.values!=='object'||d.values===null||Array.isArray(d.values)||Object.values(d.values).some(v=>!Number.isFinite(v)||v<0||v>10000)||typeof d.note!=='string'||d.note.length>5000||!['','great','good','okay','low','tired'].includes(d.mood)) throw Error('Неверные записи дней');
 }
 for(const d of Object.values(s.days)) {
  for(const field of ['activities','dailyGoals','dayWins','dayMisses','dayExtra']) if(d[field]!==undefined&&(typeof d[field]!=='string'||d[field].length>5000)) throw Error('Неверный дневник');
  if(d.skincare!==undefined&&(!d.skincare||typeof d.skincare.morning!=='boolean'||typeof d.skincare.evening!=='boolean'))throw Error('Неверная рутина');
 }
 const glass=s.habits.some(h=>h.id==='water'&&h.unit==='стаканов');
 if(glass) s={...s,waterConverted:true,habits:s.habits.map(h=>h.id==='water'?{...h,unit:'л',target:h.target*0.25}:h),days:Object.fromEntries(Object.entries(s.days).map(([date,d])=>[date,{...d,values:{...d.values,...(Number.isFinite(d.values.water)?{water:d.values.water*0.25}:{})}}]))};
 // Unit metadata makes this conversion safe to repeat, including older backups.
 const minuteIds=s.habits.filter(h=>['activity','learning'].includes(h.id)&&h.unit==='минут').map(h=>h.id);
 if(!minuteIds.length)return s;
 return {...s,habits:s.habits.map(h=>minuteIds.includes(h.id)?{...h,unit:'часов',target:h.target/60}:h),days:Object.fromEntries(Object.entries(s.days).map(([date,d])=>[date,{...d,values:Object.fromEntries(Object.entries(d.values).map(([id,v])=>[id,minuteIds.includes(id)?v/60:v]))}]))};
}
export function getDay(state,date) { return state.days[date] || {completed:[],values:{},mood:'',note:'',habitIds:state.habits.map(h=>h.id)}; }
export function setDay(state,date,patch) {return {...state,days:{...state.days,[date]:{...getDay(state,date),...patch}}};}
export function shiftDay(date,n) {const d=new Date(`${date}T12:00:00`);d.setDate(d.getDate()+n);return dayKey(d);}
export function weekSummary(state,today) {
 const days=Array.from({length:7},(_,i)=>shiftDay(today,i-6));
 const recorded=days.filter(date=>state.days[date]);
 const completed=recorded.reduce((sum,date)=>sum+state.days[date].completed.length,0);
 const possible=recorded.reduce((sum,date)=>sum+state.days[date].habitIds.length,0);
 const averages={};
 for(const id of state.habits.filter(h=>h.unit).map(h=>h.id)) { const values=recorded.map(date=>state.days[date].values[id]).filter(Number.isFinite); averages[id]=values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length*10)/10:null; }
 return {days,recorded:recorded.length,completed,percent:possible?Math.round(completed/possible*100):0,averages};
}
