import { useState } from 'preact/hooks';
import { update, useStore, uid } from '../lib/store.js';
import { useT } from '../i18n.js';
import { Icon, Chip, Field, toast } from '../ui/kit.jsx';
import { Back } from './Health.jsx';
import { dayKey, fmtTime } from '../lib/dates.js';
import { adherence } from '../lib/logic.js';
import { addToCalendar } from '../lib/ics.js';
import { go } from '../lib/router.js';
import { track } from '../lib/analytics.js';

const BYDAY = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

export function rruleFor(schedule) {
  const s = schedule || {};
  if (s.type === 'weekly') return `FREQ=WEEKLY;BYDAY=${BYDAY[Number(s.weekday || 0)]}`;
  if (s.type === 'monthly') return `FREQ=MONTHLY;BYMONTHDAY=${Number(s.monthday || 1)}`;
  if (s.type === 'course') return `FREQ=DAILY;COUNT=${Number(s.days || 7)}`;
  return 'FREQ=DAILY';
}

export function scheduleText(m, t, lang) {
  const s = m.schedule || {};
  const times = (s.times || []).map((x) => fmtTime(x, lang)).join(', ');
  if (s.type === 'weekly') return `${t.weekdays[Number(s.weekday || 0)]}, ${times}`;
  if (s.type === 'monthly') return `${lang === 'ru' ? `${s.monthday} числа` : `day ${s.monthday}`}, ${times}`;
  if (s.type === 'course') return `${t.medSchedOpts.course.toLowerCase()} · ${s.days} ${lang === 'ru' ? 'дн.' : 'days'}, ${times}`;
  return `${t.medSchedOpts.daily}, ${times}`;
}

export default function Meds() {
  const s = useStore();
  const { t, lang } = useT();
  const adh = adherence(s);
  return (
    <div class="stack">
      <Back />
      <h1 class="h1">{t.meds}</h1>
      {s.meds.length === 0 && <p class="sub" style="padding:0 4px">{t.medsEmpty}</p>}
      {s.meds.length > 0 && (
        <nav class="list">
          {s.meds.map((m) => (
            <button onClick={() => go(`health/meds/${m.id}`)}>
              <span class="stack-s" style="gap:2px">
                <span style="font-weight:600">{m.name}{m.dose ? ` · ${m.dose}` : ''}</span>
                <span class="val">{scheduleText(m, t, lang)}</span>
                {m.stock != null && <span class="val" style={m.stock <= 5 ? 'color:var(--brick-ink)' : ''}>{lang === 'ru' ? `Осталось: ${m.stock}` : `Left: ${m.stock}`}</span>}
              </span>
              <span class="chev"><Icon name="chev" size={20} /></span>
            </button>
          ))}
        </nav>
      )}
      <button class="btn btn-primary" onClick={() => { track('med_add_started', { meds_total: s.meds.length }); go('health/meds/new'); }}><Icon name="plus" /> {t.addMed}</button>
      {adh != null && <p class="sub" style="padding:0 4px">{t.adherenceVal(adh)}</p>}
      <p class="small" style="padding:0 4px">{t.medNote}</p>
    </div>
  );
}

export function MedForm({ id }) {
  const s = useStore();
  const { t, lang } = useT();
  const existing = s.meds.find((m) => m.id === id);
  const [m, setM] = useState(() => existing ? structuredClone(existing) : {
    id: uid(), name: '', dose: '', instructions: '', stock: null, painkiller: false, startDate: dayKey(),
    schedule: { type: 'daily', times: ['09:00'], weekday: 0, monthday: 1, days: 7 },
  });
  const set = (k, v) => setM((x) => ({ ...x, [k]: v }));
  const setS = (k, v) => setM((x) => ({ ...x, schedule: { ...x.schedule, [k]: v } }));
  const setTime = (i, v) => setS('times', m.schedule.times.map((x, j) => (j === i ? v : x)));

  const save = () => {
    update((st) => {
      const i = st.meds.findIndex((x) => x.id === m.id);
      if (i >= 0) st.meds[i] = m; else st.meds.push(m);
      return st;
    });
    track(existing ? 'med_edited' : 'med_added', {
      schedule: m.schedule.type, times_per_day: m.schedule.times.length,
      has_dose: !!m.dose, has_instructions: !!m.instructions, tracks_stock: m.stock != null, painkiller: m.painkiller,
      meds_total: s.meds.length + (existing ? 0 : 1),
    });
    toast(t.savedToast);
    go('health/meds');
  };
  const remove = () => {
    update((st) => { st.meds = st.meds.filter((x) => x.id !== m.id); return st; });
    track('med_deleted', { schedule: m.schedule.type, meds_total: s.meds.length - 1 });
    go('health/meds');
  };
  const cal = () => {
    addToCalendar({ title: t.medCalTitle, times: m.schedule.times, rrule: rruleFor(m.schedule), start: m.startDate });
    track('calendar_reminder_added', { kind: 'med', schedule: m.schedule.type, times_per_day: m.schedule.times.length });
  };

  return (
    <div class="stack">
      <Back to="health/meds" />
      <h1 class="h1">{existing ? existing.name : t.addMed}</h1>
      <section class="card">
        <Field label={t.medName} hint={t.medNameHint} id="mn"><input id="mn" class="input" value={m.name} onInput={(e) => set('name', e.currentTarget.value)} /></Field>
        <Field label={t.medDose} hint={t.medDoseHint} id="md"><input id="md" class="input" value={m.dose} onInput={(e) => set('dose', e.currentTarget.value)} /></Field>
      </section>

      <section class="card">
        <p class="h3">{t.medSchedule}</p>
        <div class="chips">
          {Object.entries(t.medSchedOpts).map(([k, label]) => <Chip on={m.schedule.type === k} onClick={() => setS('type', k)}>{label}</Chip>)}
        </div>
        {m.schedule.type === 'weekly' && (
          <Field label={t.medWeekday} id="wd">
            <select id="wd" class="input" value={m.schedule.weekday} onChange={(e) => setS('weekday', Number(e.currentTarget.value))}>
              {t.weekdays.map((d, i) => <option value={i}>{d}</option>)}
            </select>
          </Field>
        )}
        {m.schedule.type === 'monthly' && (
          <Field label={t.medMonthday} id="mdd"><input id="mdd" class="input" type="number" min="1" max="28" value={m.schedule.monthday} onInput={(e) => setS('monthday', Number(e.currentTarget.value) || 1)} /></Field>
        )}
        {m.schedule.type === 'course' && (
          <Field label={t.medCourseDays} id="cd"><input id="cd" class="input" type="number" min="1" max="365" value={m.schedule.days} onInput={(e) => setS('days', Number(e.currentTarget.value) || 1)} /></Field>
        )}
        <div class="stack-s">
          <p class="h3">{t.medTimes}</p>
          {m.schedule.times.map((time, i) => (
            <div class="row" style="flex-wrap:nowrap">
              <input class="input" type="time" value={time} onInput={(e) => setTime(i, e.currentTarget.value)} aria-label={t.medTimes} />
              {m.schedule.times.length > 1 && <button class="btn btn-ghost" aria-label={t.delete} onClick={() => setS('times', m.schedule.times.filter((_, j) => j !== i))}><Icon name="close" /></button>}
            </div>
          ))}
          {m.schedule.times.length < 6 && <button class="btn btn-ghost" style="justify-self:start" onClick={() => setS('times', [...m.schedule.times, '20:00'])}><Icon name="plus" size={22} /> {t.addTime}</button>}
        </div>
      </section>

      <section class="card">
        <Field label={t.medInstr} hint={t.medInstrHint} id="mi"><textarea id="mi" class="input" value={m.instructions} onInput={(e) => set('instructions', e.currentTarget.value)} /></Field>
        <Field label={t.medStock} hint={t.medStockHint} id="ms"><input id="ms" class="input" type="number" min="0" value={m.stock ?? ''} onInput={(e) => set('stock', e.currentTarget.value === '' ? null : Number(e.currentTarget.value))} /></Field>
        <button type="button" class="choice" aria-pressed={m.painkiller ? 'true' : 'false'} onClick={() => set('painkiller', !m.painkiller)}>
          <span class="tick">{m.painkiller && <svg width="16" height="16" viewBox="0 0 26 26" fill="none" stroke="#fff" stroke-width="3.2"><path d="M6 13.5l4.5 4.5L20 8" /></svg>}</span>
          <span>{t.medPainkiller}</span>
        </button>
      </section>

      <section class="card glass">
        <p class="h3">{t.medCalendar}</p>
        <p class="sub" style="color:var(--ink-2)">{t.medCalendarHint}</p>
        <button class="btn btn-outline" onClick={cal}><Icon name="cal" /> {t.medCalendar}</button>
      </section>

      <button class="btn btn-primary btn-block" disabled={!m.name.trim()} onClick={save}>{t.save}</button>
      {existing && <button class="btn btn-danger btn-block" onClick={remove}>{t.delete}</button>}
      <p class="small" style="padding:0 4px">{t.medNote}</p>
    </div>
  );
}
