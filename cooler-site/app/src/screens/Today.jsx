import { useState, useEffect } from 'preact/hooks';
import { update, useStore } from '../lib/store.js';
import { useT, APP_NAME } from '../i18n.js';
import { SYMPTOMS, LEVELS, SLEEP_LEVELS, TAGS, TIPS, RED_FLAGS } from '../data/content.js';
import { PROGRAM, nextSession, sessionKey } from '../data/program.js';
import { Logo, Icon, Scale, Chip } from '../ui/kit.jsx';
import { Breathing, HeadacheSheet, BpSheet, WaistSheet } from './Sheets.jsx';
import { dayKey, addDays, fmtWeekday, fmtTime, fmtDate, daysBetween, parseDay } from '../lib/dates.js';
import {
  activeSymptoms, has, dosesOn, worstSymptom, insights, weekSummary, waistDue,
  checkupsSoon, checkupStatus, visitSoon, knowledgeOfDay, symptomName, eventsOn,
} from '../lib/logic.js';
import { track } from '../lib/analytics.js';
import { go } from '../lib/router.js';
import { FEEDBACK_URL, articleUrl } from '../config.js';
import { haptic } from '../lib/telegram.js';

export default function Today() {
  const s = useStore();
  const { t, lang, L } = useT();
  const today = dayKey();
  const [sheet, setSheet] = useState(null);
  const p = s.profile;
  const syms = activeSymptoms(p);
  const doses = dosesOn(s.meds, today);
  const todayLog = s.logs[today];
  const logCount = Object.keys(s.logs).length;
  const ins = logCount >= 5 ? insights(s, lang) : [];
  const weekday = parseDay(today).getDay(); // 0 = Sunday
  const showWeek = daysBetween(s.installedAt, today) >= 6 && (weekday === 0 || weekday === 1);
  const away = s.prevOpen && daysBetween(s.prevOpen, today) >= 3;
  const wantsProgram = s.program || has(p, 'bones') || has(p, 'weight') || has(p, 'joints');
  const next = s.program ? nextSession(s.program.done) : null;
  const soon = checkupsSoon(s).filter((c) => !checkupStatus(s, c.id).due || true).slice(0, 1);
  const k = knowledgeOfDay(s);
  const open = (kind, place) => { setSheet(kind); track('quick_log_opened', { kind, place }); };
  const [hotPlace, setHotPlace] = useState('today_big_button');
  // Cards that appeared today (once per day per card, for "seen → used" funnels)
  const cards = [
    visitSoon(s) && 'visit_soon', doses.length > 0 && 'meds_today', logCount >= 5 && 'insights',
    showWeek && 'week_summary', waistDue(s) && 'waist_due', soon.length > 0 && 'checkup_soon', wantsProgram && 'program', k && 'knowledge_of_day',
  ].filter(Boolean);
  useEffect(() => {
    const seen = (() => { try { return JSON.parse(sessionStorage.getItem('cooler.cards') || '{}'); } catch { return {}; } })();
    const fresh = cards.filter((c) => seen[c] !== today);
    if (!fresh.length) return;
    track('today_cards_shown', { cards: fresh, insights_count: logCount >= 5 ? ins.length : undefined, away_days: away ? daysBetween(s.prevOpen, today) : undefined });
    fresh.forEach((c) => { seen[c] = today; });
    try { sessionStorage.setItem('cooler.cards', JSON.stringify(seen)); } catch {}
  }, [cards.join(',')]);

  return (
    <div class="stack">
      <header class="top">
        <div class="brand"><Logo /> {APP_NAME[lang]}</div>
      </header>
      <div>
        <p class="date">{fmtWeekday(today, lang)}</p>
        <h1 class="h1">{away ? t.welcomeBack : t.hello}</h1>
      </div>

      {visitSoon(s) && (
        <section class="card deep">
          <p class="kicker">{t.visitSoon(fmtDate(s.visit, lang))}</p>
          <p class="h2" style="color:#fff">{t.visitPrep}</p>
          <button class="btn btn-glass" onClick={() => { track('card_clicked', { card: 'visit_soon' }); go('health/doctor'); }}>{t.openCard}</button>
        </section>
      )}

      {doses.length > 0 && <MedsToday doses={doses} />}

      {has(p, 'hot') && (
        <section class="card">
          <button class="big-hot" onClick={() => { setHotPlace('today_big_button'); open('hot', 'today_big_button'); }}>
            <Icon name="wave" size={38} />
            <b>{lang === 'ru' ? 'Начался прилив' : 'Hot flash started'}</b>
            <span>{lang === 'ru' ? '2 минуты спокойного дыхания' : '2 minutes of calm breathing'}</span>
          </button>
          {eventsOn(s.events, today, 'hotflash').length > 0 && <p class="sub">{t.hotToday(eventsOn(s.events, today, 'hotflash').length)}</p>}
        </section>
      )}

      <CheckIn syms={syms} />

      <section class="stack-s">
        <p class="h3" style="padding:0 4px">{t.quick}</p>
        <div class="quick">
          {!has(p, 'hot') && <button onClick={() => { setHotPlace('quick_row'); open('hot', 'quick_row'); }}><Icon name="wave" /><span>{t.qHot}</span></button>}
          <button onClick={() => open('head', 'quick_row')}><Icon name="head" /><span>{t.qHead}</span></button>
          <button onClick={() => open('bp', 'quick_row')}><Icon name="bp" /><span>{t.qBp}</span></button>
          {has(p, 'hot') && <button onClick={() => open('waist', 'quick_row')}><Icon name="ruler" /><span>{t.waist}</span></button>}
        </div>
      </section>

      {wantsProgram && (
        <section class="card">
          <p class="kicker">{t.programCard} · {L(PROGRAM).title}</p>
          {!s.program && <p class="sub">{L(PROGRAM).about}</p>}
          {s.program && next && <p class="h3">{t.programWeek(next.week, next.n)}</p>}
          {s.program && !next && <p class="sub">{t.programDoneAll}</p>}
          {s.program && (
            <div class="bar" aria-hidden="true"><i style={{ width: `${(s.program.done.length / (PROGRAM.weeks * PROGRAM.perWeek)) * 100}%` }} /></div>
          )}
          {s.program && next
            ? <button class="btn btn-primary" onClick={() => { track('card_clicked', { card: 'program', action: 'start_session', week: next.week }); go(`health/program/${sessionKey(next.week, next.n)}`); }}><Icon name="dumbbell" /> {t.programStart}</button>
            : <button class="btn btn-outline" onClick={() => { track('card_clicked', { card: 'program', action: 'about' }); go('health/program'); }}>{t.programAbout}</button>}
        </section>
      )}

      {logCount >= 5 ? (
        <section class="card">
          <p class="kicker">{t.insightsTitle}</p>
          {ins.length === 0 && <p class="sub">{t.insightsNone}</p>}
          {ins.slice(0, 2).map((i) => (
            <div class="stack-s">
              <p style="font-size:19px">{i.text}</p>
              <p class="small">{i.basis}</p>
            </div>
          ))}
        </section>
      ) : (
        <section class="card dashed">
          <p class="h3">{t.insightsTitle}</p>
          <div class="bar" aria-hidden="true"><i style={{ width: `${(logCount / 5) * 100}%` }} /></div>
          <p class="sub">{t.insightsWait(5 - logCount)}</p>
        </section>
      )}

      {showWeek && (
        <section class="card glass">
          <p class="kicker" style="color:var(--lagoon-dark)">{t.weekTitle}</p>
          {weekSummary(s, lang).map((l) => <p style="font-size:18px">{l}</p>)}
        </section>
      )}

      {waistDue(s) && (
        <section class="card">
          <p class="h3">{t.waistDue}</p>
          <p class="sub">{t.waistDueText}</p>
          <button class="btn btn-outline" onClick={() => open('waist', 'waist_due_card')}><Icon name="ruler" /> {t.measure}</button>
        </section>
      )}

      {soon.length > 0 && (
        <section class="card">
          <p class="kicker">{t.checkupDue}</p>
          <p class="h3">{L(soon[0])}</p>
          <p class="sub">{t.dueOn(fmtDate(checkupStatus(s, soon[0].id).next, lang))}</p>
          <button class="btn btn-outline" onClick={() => { track('card_clicked', { card: 'checkup_soon', checkup: soon[0].id }); go('health/checkups'); }}>{t.openCard}</button>
        </section>
      )}

      {k && (
        <section class="card">
          <p class="kicker">{t.learnOfDay}</p>
          <p class="h3">{L(k).q}</p>
          <p style="font-size:18px;color:var(--ink-2)">{L(k).a}</p>
          {k.slug && <a class="btn btn-ghost" style="justify-self:start" href={articleUrl(k.slug[lang], lang)} target="_blank" rel="noopener" onClick={() => track('article_link_clicked', { place: 'knowledge_of_day', topic: k.id })}>{t.fullArticle}</a>}
        </section>
      )}

      <a class="btn btn-ghost" style="justify-self:center" href={FEEDBACK_URL} target="_blank" rel="noopener" onClick={() => track('feedback_clicked', { place: 'today' })}>{t.feedback}</a>

      {sheet === 'hot' && <Breathing place={hotPlace} onClose={() => setSheet(null)} />}
      {sheet === 'head' && <HeadacheSheet onClose={() => setSheet(null)} onBp={() => setSheet('bp')} />}
      {sheet === 'bp' && <BpSheet onClose={() => setSheet(null)} />}
      {sheet === 'waist' && <WaistSheet onClose={() => setSheet(null)} />}
    </div>
  );
}

function lateMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const now = new Date();
  return Math.round((now.getHours() * 60 + now.getMinutes()) - (h * 60 + m));
}

// ── Medicines due today ──
function MedsToday({ doses }) {
  const s = useStore();
  const { t, lang } = useT();
  const today = dayKey();
  const log = s.medLog[today] || {};
  const mark = (d, status) => {
    update((st) => {
      st.medLog[today] = { ...(st.medLog[today] || {}) };
      const prev = st.medLog[today][d.key];
      const m = st.meds.find((x) => x.id === d.med.id);
      if (status === null) {
        delete st.medLog[today][d.key];
        if (prev === 'taken' && m && m.stock != null) m.stock += 1;
      } else {
        st.medLog[today][d.key] = status;
        if (status === 'taken' && prev !== 'taken' && m && m.stock != null) m.stock = Math.max(0, m.stock - 1);
      }
      return st;
    });
    if (status === 'taken') haptic();
    const after = { ...log, [d.key]: status };
    if (status === null) delete after[d.key];
    track(status === null ? 'dose_undone' : status === 'taken' ? 'dose_taken' : 'dose_skipped', {
      schedule: d.med.schedule?.type, doses_today: doses.length, marked_today: Object.keys(after).length,
      late_minutes: status === 'taken' ? lateMinutes(d.time) : undefined,
    });
    if (status && doses.every((x) => after[x.key])) track('meds_all_marked_today', { doses_today: doses.length });
  };
  const allDone = doses.every((d) => log[d.key]);
  return (
    <section class="card">
      <p class="kicker">{t.medsToday}</p>
      {doses.map((d) => {
        const st = log[d.key];
        return (
          <div class="dose">
            <div>
              <p class="name">{d.med.name}</p>
              <p class="meta">{fmtTime(d.time, lang)}{d.med.dose ? ` · ${d.med.dose}` : ''}</p>
              {d.med.instructions && <p class="meta">{d.med.instructions}</p>}
              {d.med.stock != null && d.med.stock <= 5 && <p class="meta" style="color:var(--brick-ink)">{t.lowStock(d.med.stock)}</p>}
            </div>
            {st ? (
              <div class="status">
                <span class="done">{st === 'taken' ? `✓ ${t.taken}` : t.skipped}</span>
                <button class="btn btn-ghost" style="min-height:44px;font-size:16px" onClick={() => mark(d, null)}>{t.undo}</button>
              </div>
            ) : (
              <div class="actions">
                <button class="btn btn-primary" onClick={() => mark(d, 'taken')}>{t.take}</button>
                <button class="btn btn-outline" onClick={() => mark(d, 'skipped')}>{t.skipDose}</button>
              </div>
            )}
          </div>
        );
      })}
      {allDone && <p class="sub">{t.allTaken}</p>}
    </section>
  );
}

// ── Daily check-in ──
function CheckIn({ syms }) {
  const s = useStore();
  const { t, lang, L } = useT();
  const today = dayKey();
  const saved = s.logs[today]?.saved;
  const [editing, setEditing] = useState(!saved);
  const [draft, setDraft] = useState(() => ({ tags: [], ...(s.logs[today] || {}) }));
  const yesterday = s.logs[addDays(today, -1)];

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const toggleTag = (id) => setDraft((d) => ({ ...d, tags: d.tags?.includes(id) ? d.tags.filter((x) => x !== id) : [...(d.tags || []), id] }));

  function save(values, method = 'form') {
    const savedDays = Object.keys(s.logs).filter((d) => s.logs[d].saved);
    const first = savedDays.length === 0;
    const wasSaved = !!s.logs[today]?.saved;
    update((st) => { st.logs[today] = { ...(st.logs[today] || {}), ...values, saved: true }; return st; });
    let streak = 1;
    while (s.logs[addDays(today, -streak)]?.saved) streak++;
    track('checkin_saved', {
      first, method, edit: wasSaved, streak_days: streak, total_days: savedDays.length + (wasSaved ? 0 : 1),
      filled: syms.filter((id) => values[id] != null).length, of: syms.length, tags_count: (values.tags || []).length,
    });
    if (first) track('first_checkin');
    haptic();
    setEditing(false);
  }
  function sameAsYesterday() {
    const v = { tags: yesterday.tags || [] };
    syms.forEach((id) => { if (yesterday[id] != null) v[id] = yesterday[id]; });
    setDraft(v);
    save(v, 'same_as_yesterday');
  }

  if (!editing) {
    const log = s.logs[today];
    const worst = worstSymptom(log);
    const tip = TIPS[worst || 'calm'];
    return (
      <section class="card">
        <div class="row between">
          <p class="kicker">✓ {t.daySaved}</p>
          <button class="btn btn-ghost" style="min-height:40px" onClick={() => { setDraft({ tags: [], ...log }); setEditing(true); track('checkin_edit_started'); }}>{t.editDay}</button>
        </div>
        <div class="tipbox">
          <p class="kicker" style="color:var(--lagoon-dark)">{t.tipTitle}</p>
          {worst && <p style="font-size:18px">{t.hardest}<b>{symptomName(worst, lang).toLowerCase()}</b></p>}
          <p style="font-size:19px;line-height:1.5">{L(tip)}</p>
        </div>
        {log.mood === 3 && <div class="flag">{RED_FLAGS[lang][4]}</div>}
        {log.head === 3 && <div class="flag">{RED_FLAGS[lang][2]}</div>}
      </section>
    );
  }

  return (
    <section class="card">
      <div class="stack-s">
        <h2 class="h2">{t.checkin}</h2>
        <p class="sub">{t.checkinSub}</p>
      </div>
      {yesterday?.saved && !saved && (
        <button class="btn btn-outline btn-block" onClick={sameAsYesterday}>{t.sameAsYesterday}</button>
      )}
      {syms.map((id) => {
        const sym = SYMPTOMS.find((x) => x.id === id);
        return (
          <div class="stack-s">
            <p class="h3">{L(sym)}</p>
            <Scale labels={(id === 'sleep' ? SLEEP_LEVELS : LEVELS)[lang]} value={draft[id] ?? null} onChange={(v) => set(id, v)} label={L(sym)} />
          </div>
        );
      })}
      <div class="stack-s">
        <p class="h3">{t.whatToday}</p>
        <div class="chips">
          {TAGS.map((tag) => <Chip on={draft.tags?.includes(tag.id)} onClick={() => toggleTag(tag.id)}>{L(tag)}</Chip>)}
        </div>
      </div>
      <button class="btn btn-dark btn-block" onClick={() => save(draft)}>{t.saveDay}</button>
    </section>
  );
}
