import { update, useStore } from '../lib/store.js';
import { useT, APP_NAME } from '../i18n.js';
import { SYMPTOMS, DOCTOR_QUESTIONS } from '../data/content.js';
import { Field, toast } from '../ui/kit.jsx';
import { Back } from './Health.jsx';
import { dayKey, lastNDays, fmtDate, fmtTime, daysBetween } from '../lib/dates.js';
import { activeSymptoms, adherence, has } from '../lib/logic.js';
import { track } from '../lib/analytics.js';
import { useEffect } from 'preact/hooks';
import { scheduleText } from './Meds.jsx';

export function buildReport(s, t, lang, L) {
  const days = lastNDays(30);
  const lines = [];
  const sym = [];
  for (const id of activeSymptoms(s.profile)) {
    const vals = days.map((d) => s.logs[d]?.[id]).filter((v) => v != null);
    if (!vals.length) continue;
    const hard = vals.filter((v) => v >= 2).length;
    sym.push(`${L(SYMPTOMS.find((x) => x.id === id))}: ${t.reportBadDays(hard, vals.length)}`);
  }
  const hot = s.events.filter((e) => e.type === 'hotflash' && days.includes(e.t.slice(0, 10))).length;
  const heads = s.events.filter((e) => e.type === 'headache' && days.includes(e.t.slice(0, 10)));
  const pkDays = new Set(heads.filter((e) => e.painkiller).map((e) => e.t.slice(0, 10))).size;
  const bp = s.bp.filter((r) => days.includes(r.t.slice(0, 10)));
  const avg = (k) => Math.round(bp.reduce((a, r) => a + r[k], 0) / bp.length);
  const max = bp.reduce((m, r) => (r.sys > m.sys ? r : m), bp[0] || null);
  const qs = Object.keys(DOCTOR_QUESTIONS).filter((k) => has(s.profile, k));
  if (has(s.profile, 'hot') || has(s.profile, 'bones')) qs.push('hrt');

  return { sym, hot, heads: heads.length, pkDays, bp, bpAvg: bp.length ? `${avg('sys')}/${avg('dia')}` : null, bpMax: max ? `${max.sys}/${max.dia}` : null, qs, days };
}

export default function Doctor() {
  const s = useStore();
  const { t, lang, L } = useT();
  const r = buildReport(s, t, lang, L);
  const adh = adherence(s);
  const waist = s.waist.slice(-3);
  useEffect(() => {
    track('doctor_card_opened', { has_visit_date: !!s.visit, symptoms_rows: r.sym.length, has_meds: s.meds.length > 0, has_bp: r.bp.length > 0, questions: r.qs.length });
  }, []);

  const text = [
    `${APP_NAME[lang]} · ${t.report30} (${fmtDate(r.days[0], lang)} — ${fmtDate(r.days[29], lang)})`,
    s.profile.age ? (lang === 'ru' ? `Возраст: ${s.profile.age}` : `Age: ${s.profile.age}`) : '',
    s.profile.lastPeriod != null ? `${t.obPeriod} ${t.obPeriodOpts[s.profile.lastPeriod]}` : '',
    '',
    r.sym.length ? `${t.reportSymptoms}:\n- ${r.sym.join('\n- ')}` : '',
    r.hot ? t.reportHot(r.hot) : '',
    r.heads ? t.reportHead(r.heads, r.pkDays) : '',
    r.bpAvg ? t.reportBp(r.bpAvg, r.bpMax) : '',
    waist.length ? `${t.waist}: ${waist.map((w) => `${w.cm} ${lang === 'ru' ? 'см' : 'cm'} (${fmtDate(w.date, lang, { day: 'numeric', month: 'short' })})`).join(', ')}` : '',
    '',
    s.meds.length ? `${t.reportMeds}:\n- ${s.meds.map((m) => `${m.name}${m.dose ? `, ${m.dose}` : ''} — ${scheduleText(m, t, lang)}`).join('\n- ')}${adh != null ? `\n${t.adherenceVal(adh)}` : ''}` : '',
    '',
    r.qs.length ? `${t.reportQuestions}:\n- ${r.qs.map((k) => L(DOCTOR_QUESTIONS[k])).join('\n- ')}` : '',
    s.doctorNotes ? `\n${s.doctorNotes}` : '',
  ].filter((x) => x !== '').join('\n').replace(/\n{3,}/g, '\n\n');

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ text }); track('doctor_card_shared', { via: 'share_sheet' }); return; }
      catch (e) { track('doctor_card_share_cancelled'); return; }
    }
    copy('share_fallback');
  };
  const copy = async (via = 'copy') => { try { await navigator.clipboard.writeText(text); toast(t.copied); track('doctor_card_shared', { via }); } catch (e) {} };

  return (
    <div class="stack">
      <Back />
      <h1 class="h1">{t.doctor}</h1>
      <p class="sub no-print" style="padding:0 4px">{t.doctorIntro}</p>

      <section class="card no-print">
        <Field label={t.visitDate} hint={t.visitSet} id="vd">
          <input id="vd" class="input" type="date" min={dayKey()} value={s.visit || ''} onInput={(e) => { update({ visit: e.currentTarget.value || null }); track('visit_date_set', { cleared: !e.currentTarget.value, days_until: e.currentTarget.value ? daysBetween(dayKey(), e.currentTarget.value) : undefined }); }} />
        </Field>
      </section>

      <section class="card">
        <p class="kicker">{t.report30}</p>
        {r.sym.length > 0 && <div class="stack-s"><p class="h3">{t.reportSymptoms}</p>{r.sym.map((x) => <p>{x}</p>)}</div>}
        {r.hot > 0 && <p>{t.reportHot(r.hot)}</p>}
        {r.heads > 0 && <p>{t.reportHead(r.heads, r.pkDays)}</p>}
        {r.bpAvg && <p>{t.reportBp(r.bpAvg, r.bpMax)}</p>}
        {waist.length > 0 && <p>{t.waist}: {waist.map((w) => `${w.cm}`).join(' → ')} {lang === 'ru' ? 'см' : 'cm'}</p>}
        {s.meds.length > 0 && (
          <div class="stack-s">
            <p class="h3">{t.reportMeds}</p>
            {s.meds.map((m) => <p>{m.name}{m.dose ? `, ${m.dose}` : ''} — {scheduleText(m, t, lang)}</p>)}
            {adh != null && <p class="small">{t.adherenceVal(adh)}</p>}
          </div>
        )}
        {r.qs.length > 0 && (
          <div class="stack-s">
            <p class="h3">{t.reportQuestions}</p>
            {r.qs.map((k) => <p>— {L(DOCTOR_QUESTIONS[k])}</p>)}
          </div>
        )}
        <Field label={lang === 'ru' ? 'Мои заметки для врача' : 'My notes for the doctor'} id="dn">
          <textarea id="dn" class="input" value={s.doctorNotes || ''} onInput={(e) => update({ doctorNotes: e.currentTarget.value })} />
        </Field>
      </section>

      <div class="row no-print">
        <button class="btn btn-primary" style="flex:1" onClick={share}>{t.share}</button>
        <button class="btn btn-outline" style="flex:1" onClick={() => copy('copy')}>{t.copy}</button>
        <button class="btn btn-outline" style="flex:1" onClick={() => { track('doctor_card_shared', { via: 'print' }); window.print(); }}>{t.print}</button>
      </div>
    </div>
  );
}
