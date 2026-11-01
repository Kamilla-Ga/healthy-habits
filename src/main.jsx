import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { dayKey, readDay, writeDay } from './storage.js';
import './style.css';

const habits = [
  { id: 'water', icon: '💧', title: 'Вода', detail: 'Выпить достаточно воды за день', tag: 'Глоток свежести', color: 'blue' },
  { id: 'sleep', icon: '😴', title: 'Сон', detail: 'Поспать не менее 7–9 часов', tag: 'Время восстановиться', color: 'purple' },
  { id: 'activity', icon: '🏃‍♀️', title: 'Активность', detail: 'Выполнить тренировку или выйти на прогулку', tag: 'Движение — это жизнь', color: 'green' },
  { id: 'skincare', icon: '🧴', title: 'Skincare', detail: 'Выполнить ежедневный уход за кожей', tag: 'Немного нежности', color: 'pink' },
  { id: 'learning', icon: '📚', title: 'Обучение', detail: 'Уделить время изучению нового', tag: 'Пища для ума', color: 'sand' },
];
function load(day) {
  try { return { day, completed: readDay(localStorage, day), error: false }; }
  catch { return { day, completed: [], error: true }; }
}
function App() {
  const [data, setData] = useState(() => load(dayKey()));
  useEffect(() => {
    const sync = () => setData(old => old.day === dayKey() ? old : load(dayKey()));
    const external = e => { if (e.key === null || e.key === `healthy-habits:${dayKey()}`) setData(load(dayKey())); };
    const timer = setInterval(sync, 1000);
    window.addEventListener('focus', sync);
    window.addEventListener('storage', external);
    document.addEventListener('visibilitychange', sync);
    return () => { clearInterval(timer); window.removeEventListener('focus', sync); window.removeEventListener('storage', external); document.removeEventListener('visibilitychange', sync); };
  }, []);
  function toggle(id) {
    const current = data.day === dayKey() ? data : load(dayKey());
    const completed = current.completed.includes(id) ? current.completed.filter(x => x !== id) : [...current.completed, id];
    let error = false;
    try { writeDay(localStorage, current.day, completed); } catch { error = true; }
    setData({ ...current, completed, error });
  }
  const count = data.completed.length;
  const percent = count * 20;
  const date = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long', weekday: 'long' }).format(new Date(`${data.day}T12:00:00`));
  return <div className="shell">
    <header className="header"><a className="brand" href="./" aria-label="Healthy Habits — главная"><span className="brand-icon">✳</span> Healthy Habits<span className="brand-dot">.</span></a><span className="header-note">Твоя забота о себе, каждый день</span></header>
    <main>
      <section className="intro"><div><span className="eyebrow"><span/> МАЛЕНЬКИЕ ШАГИ. БОЛЬШИЕ ПЕРЕМЕНЫ.</span><h1>Хороший день начинается<br/>с <em>заботы о себе.</em></h1><p>Не нужно менять всё сразу. Просто выбери себя сегодня —<br className="desktop-break"/> и сделай пять маленьких шагов к хорошему самочувствию.</p></div><div className="plant" aria-hidden="true"><div className="plant-circle"/><span className="stem"/><i className="leaf one"/><i className="leaf two"/><i className="leaf three"/><i className="leaf four"/><span className="plant-caption">расти в своём ритме</span></div></section>
      <div className="dashboard"><section className="habits-section" aria-labelledby="habits-title"><div className="section-heading"><h2 id="habits-title">Мои привычки</h2><span className="today">Сегодня <span>·</span> {date}</span></div><div className="habit-list">{habits.map(h => { const done = data.completed.includes(h.id); return <label className={`habit ${done ? 'done' : ''}`} key={h.id}><span className={`habit-icon ${h.color}`} aria-hidden="true">{h.icon}</span><span className="habit-copy"><span className="habit-title">{h.title}</span><span className="habit-detail">{h.detail}</span></span><span className="habit-tag">{done ? 'Готово!' : h.tag}</span><input type="checkbox" checked={done} onChange={() => toggle(h.id)} aria-label={`${h.title}: выполнено`}/><span className="check" aria-hidden="true">{done && '✓'}</span></label>; })}</div><p className="save-note">{data.error ? 'Не удалось сохранить отметки. Разреши хранение данных в браузере — иначе после обновления они исчезнут.' : '✓ Отметки сохраняются автоматически в этом браузере'}</p></section>
      <aside className="sidebar"><section className="progress-card" aria-labelledby="progress-title"><span className="eyebrow">ТВОЙ ПРОГРЕСС</span><h2 id="progress-title">Каждый шаг важен</h2><div className="ring" role="progressbar" aria-label="Выполненные привычки за день" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} style={{ '--progress': `${percent}%` }}><div><strong>{percent}<span>%</span></strong><span>заботы о себе</span></div></div><div className="progress-copy" aria-live="polite"><h3>{count} из 5 привычек выполнено</h3><p>{count === 5 ? 'Отличная работа! Сегодня ты позаботилась о себе' : count === 0 ? 'Начни с одной маленькой привычки. Ты уже на верном пути.' : 'Ты делаешь для себя что-то хорошее. Продолжай в своём ритме.'}</p></div><div className="progress-dots" aria-hidden="true">{habits.map((h,i) => <span key={h.id} className={i < count ? 'filled' : ''}/>)}</div></section><section className="quote-card"><span aria-hidden="true">✧</span><p>Забота о себе — это не награда.<br/>Это твоя ежедневная основа.</p><span className="quote-caption">ПОЗВОЛЬ СЕБЕ БЫТЬ В ПРИОРИТЕТЕ</span></section></aside></div>
      <div className="bottom-note"><span aria-hidden="true">☀</span><p>Новый день — новая возможность.<span>Завтра начнём с чистого листа, сохранив сегодняшний результат.</span></p></div>
    </main><footer><span>Healthy Habits <span className="footer-dot">✳</span> С любовью к себе</span><span>Маленькие привычки для большой жизни</span></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
