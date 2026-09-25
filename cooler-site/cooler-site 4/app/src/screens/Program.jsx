import { useState, useEffect } from 'preact/hooks';
import { update, useStore } from '../lib/store.js';
import { useT } from '../i18n.js';
import { PROGRAM, EXERCISES, nextSession, sessionKey, phaseIndex } from '../data/program.js';
import { VIDEOS } from '../data/videos.js';
import { Icon, Video, toast } from '../ui/kit.jsx';
import { Back } from './Health.jsx';
import { dayKey } from '../lib/dates.js';
import { addToCalendar } from '../lib/ics.js';
import { go } from '../lib/router.js';
import { track } from '../lib/analytics.js';
import { haptic, ask } from '../lib/telegram.js';

const TOTAL = PROGRAM.weeks * PROGRAM.perWeek;

export default function Program() {
  const s = useStore();
  const { t, lang, L } = useT();
  const P = L(PROGRAM);
  const pr = s.program;
  const next = pr ? nextSession(pr.done) : null;

  const start = () => {
    update((st) => { st.program = { id: 'bones', startedAt: dayKey(), done: [], doneDates: [] }; return st; });
    track('program_started', { program: 'bones' });
  };
  const cal = () => {
    addToCalendar({ title: t.calProgramTitle, times: ['10:00'], rrule: `FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=${TOTAL}` });
    track('calendar_reminder_added', { kind: 'program' });
  };

  return (
    <div class="stack">
      <Back />
      <h1 class="h1">{P.title}</h1>
      <section class="card">
        <p style="font-size:19px">{P.about}</p>
        <div class="flag" style="font-weight:400">{P.safety}</div>
        {!pr && <button class="btn btn-primary" onClick={start}>{t.startProgram}</button>}
        {pr && (
          <>
            <div class="bar"><i style={{ width: `${(pr.done.length / TOTAL) * 100}%` }} /></div>
            <p class="sub">{t.progress(pr.done.length, TOTAL)}</p>
            {next && <p class="h3">{t.programWeek(next.week, next.n)}</p>}
            {next && <button class="btn btn-primary" onClick={() => { track('program_session_clicked', { week: next.week, n: next.n, place: 'program' }); go(`health/program/${sessionKey(next.week, next.n)}`); }}><Icon name="dumbbell" /> {t.programStart}</button>}
            {!next && <p class="sub">{t.programDoneAll}</p>}
          </>
        )}
      </section>

      {pr && (
        <section class="card glass">
          <p class="h3">{t.calProgram}</p>
          <p class="sub" style="color:var(--ink-2)">{lang === 'ru' ? 'Понедельник, среда и пятница в 10:00. Время потом можно поменять в календаре.' : 'Monday, Wednesday and Friday at 10:00. You can change the time in your calendar.'}</p>
          <button class="btn btn-outline" onClick={cal}><Icon name="cal" /> {t.calProgram}</button>
        </section>
      )}

      {Array.from({ length: PROGRAM.weeks }, (_, i) => i + 1).map((w) => (
        <section class="card">
          <div class="row between">
            <p class="h3">{lang === 'ru' ? `Неделя ${w}` : `Week ${w}`}</p>
            <span class="small">{P.phases[phaseIndex(w)]}</span>
          </div>
          <div class="row">
            {[1, 2, 3].map((n) => {
              const k = sessionKey(w, n);
              const done = pr?.done.includes(k);
              return (
                <button class={`btn ${done ? 'btn-glass' : 'btn-outline'}`} style="flex:1;min-width:90px" disabled={!pr} onClick={() => go(`health/program/${k}`)}>
                  {done ? '✓ ' : ''}{n}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {pr && <button class="btn btn-ghost" onClick={async () => { if (await ask(t.restartProgram + '?')) start(); }}>{t.restartProgram}</button>}
      <p class="small" style="padding:0 4px">{t.programSoon}</p>
    </div>
  );
}

export function Session({ k }) {
  const s = useStore();
  const { t, lang, L } = useT();
  const m = k.match(/^w(\d+)s(\d+)$/);
  const week = Number(m?.[1] || 1), n = Number(m?.[2] || 1);
  const list = PROGRAM.session(week, n);
  const [checked, setChecked] = useState([]);
  const already = s.program?.done.includes(k);
  const withVideo = list.filter((ex) => { const v = VIDEOS[ex.id] || {}; return v[lang] || v.ru || v.en; }).length;
  useEffect(() => { track('program_session_opened', { week, n, exercises: list.length, with_video: withVideo, repeat: !!already }); }, [k]);

  const finish = () => {
    update((st) => {
      if (!st.program) st.program = { id: 'bones', startedAt: dayKey(), done: [], doneDates: [] };
      if (!st.program.done.includes(k)) st.program.done.push(k);
      st.program.doneDates = [...(st.program.doneDates || []), dayKey()];
      const d = dayKey();
      st.logs[d] = { ...(st.logs[d] || {}), tags: Array.from(new Set([...(st.logs[d]?.tags || []), 'strength'])) };
      return st;
    });
    const doneBefore = s.program?.done.length || 0;
    track('program_session_done', { week, n, checked: checked.length, of: list.length, sessions_done: doneBefore + (already ? 0 : 1), repeat: !!already });
    haptic('medium');
    toast(t.sessionDone);
    go('today');
  };

  return (
    <div class="stack">
      <Back to="health/program" />
      <h1 class="h1">{t.sessionTitle(week, n)}</h1>
      <p class="sub" style="padding:0 4px">{L(PROGRAM).phases[phaseIndex(week)]} · ~15 {lang === 'ru' ? 'минут' : 'minutes'}</p>
      {list.map((ex, i) => {
        const e = EXERCISES[ex.id];
        const v = VIDEOS[ex.id] || {};
        const url = v[lang] || v.ru || v.en || '';
        const on = checked.includes(i);
        return (
          <section class="card">
            <div class="row between">
              <p class="h3">{i + 1}. {L(e).name}</p>
              <span class="kicker">{L(ex.dose)}</span>
            </div>
            <Video url={url} placeholder={t.videoSoon} title={L(e).name} onPlay={() => track('exercise_video_played', { exercise: ex.id, week })} />
            <p style="font-size:18px;color:var(--ink-2)">{L(e).how}</p>
            <button type="button" class="choice" aria-pressed={on ? 'true' : 'false'} onClick={() => { setChecked((c) => (on ? c.filter((x) => x !== i) : [...c, i])); if (!on) track('exercise_checked', { exercise: ex.id, week, has_video: !!url }); }}>
              <span class="tick">{on && <svg width="16" height="16" viewBox="0 0 26 26" fill="none" stroke="#fff" stroke-width="3.2"><path d="M6 13.5l4.5 4.5L20 8" /></svg>}</span>
              <span>{t.done}</span>
            </button>
          </section>
        );
      })}
      <button class="btn btn-primary btn-block" onClick={finish}>{already ? '✓ ' : ''}{t.finishSession}</button>
    </div>
  );
}
