// Pure functions over the stored data: what is due today, what we noticed, weekly summary.
import { SYMPTOMS, TAGS, CHECKUPS, KNOWLEDGE } from '../data/content.js';
import { dayKey, addDays, addMonths, lastNDays, parseDay, daysBetween } from './dates.js';

export const symptomName = (id, lang) => SYMPTOMS.find((s) => s.id === id)?.[lang] ?? id;

// Symptoms she logs daily = symptoms she chose in onboarding (or a sensible default set).
export function activeSymptoms(profile) {
  const chosen = (profile?.concerns || []).filter((c) => SYMPTOMS.some((s) => s.id === c));
  return chosen.length ? chosen : ['sleep', 'energy', 'mood', 'hot'];
}
export const has = (profile, id) => (profile?.concerns || []).includes(id);

// ── Medicines ───────────────────────────────────────────────
export function dosesOn(meds, day) {
  const d = parseDay(day);
  const weekday = (d.getDay() + 6) % 7; // Monday = 0
  const out = [];
  for (const m of meds) {
    if (m.startDate && day < m.startDate) continue;
    const s = m.schedule || { type: 'daily', times: ['09:00'] };
    let on = false;
    if (s.type === 'daily') on = true;
    if (s.type === 'weekly') on = weekday === Number(s.weekday ?? 0);
    if (s.type === 'monthly') on = d.getDate() === Number(s.monthday ?? 1);
    if (s.type === 'course') on = daysBetween(m.startDate || day, day) < Number(s.days || 7);
    if (!on) continue;
    for (const time of s.times?.length ? s.times : ['09:00']) out.push({ med: m, time, key: `${m.id}@${time}` });
  }
  return out.sort((a, b) => a.time.localeCompare(b.time));
}

export function adherence(state, days = 30) {
  let planned = 0, taken = 0;
  const today = dayKey();
  for (const day of lastNDays(days)) {
    for (const d of dosesOn(state.meds, day)) {
      if (day === today) {
        const st = state.medLog[day]?.[d.key];
        if (!st) continue; // today's future doses don't count yet
      }
      planned++;
      if (state.medLog[day]?.[d.key] === 'taken') taken++;
    }
  }
  return planned ? Math.round((taken / planned) * 100) : null;
}

export function painkillerDaysThisMonth(state) {
  const now = new Date();
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const days = new Set();
  state.events.filter((e) => e.type === 'headache' && e.painkiller && e.t.startsWith(prefix)).forEach((e) => days.add(e.t.slice(0, 10)));
  const pk = state.meds.filter((m) => m.painkiller).map((m) => m.id);
  Object.entries(state.medLog).forEach(([day, log]) => {
    if (!day.startsWith(prefix)) return;
    if (Object.entries(log).some(([k, v]) => v === 'taken' && pk.includes(k.split('@')[0]))) days.add(day);
  });
  return days.size;
}

// ── Day log ─────────────────────────────────────────────────
const ORDER = ['head', 'hot', 'sleep', 'mood', 'energy', 'fog', 'joints'];
export function worstSymptom(log) {
  if (!log) return null;
  let best = null, lvl = 0;
  for (const id of ORDER) if ((log[id] ?? 0) > lvl) { best = id; lvl = log[id]; }
  return best;
}

export const eventsOn = (events, day, type) => events.filter((e) => e.type === type && e.t.slice(0, 10) === day);
export const localIso = () => {
  const d = new Date();
  return `${dayKey(d)}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// ── Insights: "noticed in your logs" ────────────────────────
const PHRASE = {
  ru: {
    worse: { hot: 'приливы в среднем сильнее', energy: 'усталость в среднем сильнее', head: 'голова в среднем болит сильнее', mood: 'настроение в среднем хуже', fog: 'туман в голове в среднем сильнее', joints: 'суставы в среднем беспокоят больше', sleep: 'сон в среднем хуже' },
    better: { hot: 'приливы в среднем слабее', energy: 'сил в среднем больше', head: 'голова в среднем болит меньше', mood: 'настроение в среднем лучше', fog: 'голова в среднем яснее', joints: 'суставы в среднем беспокоят меньше', sleep: 'сон в среднем лучше' },
  },
  en: {
    worse: { hot: 'hot flashes tend to be stronger', energy: 'you tend to feel more tired', head: 'headaches tend to be worse', mood: 'your mood tends to be lower', fog: 'brain fog tends to be worse', joints: 'your joints tend to bother you more', sleep: 'your sleep tends to be worse' },
    better: { hot: 'hot flashes tend to be milder', energy: 'you tend to have more energy', head: 'headaches tend to be milder', mood: 'your mood tends to be better', fog: 'your head tends to be clearer', joints: 'your joints tend to bother you less', sleep: 'your sleep tends to be better' },
  },
};

const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;

export function insights(state, lang) {
  const logs = Object.entries(state.logs);
  const out = [];
  const syms = activeSymptoms(state.profile);
  const tagName = (id) => TAGS.find((t) => t.id === id)?.[lang] ?? id;
  for (const tag of TAGS) {
    for (const s of syms) {
      const withTag = logs.filter(([, l]) => l[s] != null && (l.tags || []).includes(tag.id)).map(([, l]) => l[s]);
      const without = logs.filter(([, l]) => l[s] != null && !(l.tags || []).includes(tag.id)).map(([, l]) => l[s]);
      if (withTag.length < 3 || without.length < 3) continue;
      const diff = mean(withTag) - mean(without);
      if (Math.abs(diff) < 0.6) continue;
      const worse = diff > 0;
      const n = withTag.length + without.length;
      out.push({
        id: `${tag.id}:${s}`, strength: Math.abs(diff),
        text: lang === 'ru'
          ? `В дни с отметкой «${tagName(tag.id)}» ${PHRASE.ru[worse ? 'worse' : 'better'][s]}.`
          : `On days with “${tagName(tag.id)}”, ${PHRASE.en[worse ? 'worse' : 'better'][s]}.`,
        basis: lang === 'ru' ? `Замечено по ${n} ${n % 10 === 1 && n % 100 !== 11 ? 'отметке' : 'отметкам'}. Это наблюдение, а не доказательство.` : `Based on ${n} check-ins. An observation, not proof.`,
      });
    }
  }
  // Bad sleep → next-day tiredness or mood
  for (const s of ['energy', 'mood']) {
    if (!syms.includes('sleep') || !syms.includes(s)) continue;
    const after = [], normal = [];
    for (const [day, l] of logs) {
      const prev = state.logs[addDays(day, -1)];
      if (l[s] == null || !prev || prev.sleep == null) continue;
      (prev.sleep >= 2 ? after : normal).push(l[s]);
    }
    if (after.length >= 3 && normal.length >= 3 && mean(after) - mean(normal) >= 0.6) {
      out.push({
        id: `sleep→${s}`, strength: mean(after) - mean(normal),
        text: lang === 'ru'
          ? `После плохой ночи ${s === 'energy' ? 'на следующий день сил заметно меньше' : 'на следующий день настроение хуже'}. Сон стоит беречь в первую очередь.`
          : `After a bad night, ${s === 'energy' ? 'you have noticeably less energy the next day' : 'your mood is lower the next day'}. Sleep is worth protecting first.`,
        basis: lang === 'ru' ? 'Замечено по вашим отметкам. Это наблюдение, а не доказательство.' : 'Based on your check-ins. An observation, not proof.',
      });
    }
  }
  return out.sort((a, b) => b.strength - a.strength).slice(0, 4);
}

// ── Weekly summary ──────────────────────────────────────────
export function weekSummary(state, lang) {
  const today = dayKey();
  const cur = lastNDays(7, today), prev = lastNDays(7, addDays(today, -7));
  const lines = [];
  for (const s of activeSymptoms(state.profile)) {
    const a = cur.map((d) => state.logs[d]?.[s]).filter((v) => v != null);
    const b = prev.map((d) => state.logs[d]?.[s]).filter((v) => v != null);
    if (a.length < 3 || b.length < 3) continue;
    const diff = mean(a) - mean(b);
    if (Math.abs(diff) < 0.4) continue;
    const name = symptomName(s, lang);
    lines.push(lang === 'ru'
      ? `${name}: ${diff < 0 ? 'легче' : 'тяжелее'}, чем на прошлой неделе`
      : `${name}: ${diff < 0 ? 'easier' : 'harder'} than the week before`);
  }
  const logged = cur.filter((d) => state.logs[d]).length;
  lines.unshift(lang === 'ru' ? `Отмечено дней: ${logged} из 7` : `Days logged: ${logged} of 7`);
  if (state.program) {
    const sessions = (state.program.doneDates || []).filter((d) => cur.includes(d)).length;
    lines.push(lang === 'ru' ? `Занятий для костей: ${sessions}` : `Bone sessions: ${sessions}`);
  }
  const hot = state.events.filter((e) => e.type === 'hotflash' && cur.includes(e.t.slice(0, 10))).length;
  const hotPrev = state.events.filter((e) => e.type === 'hotflash' && prev.includes(e.t.slice(0, 10))).length;
  if (hot || hotPrev) lines.push(lang === 'ru' ? `Приливов: ${hot} (на прошлой неделе — ${hotPrev})` : `Hot flashes: ${hot} (week before: ${hotPrev})`);
  return lines;
}

// ── Checkups, waist, visit ──────────────────────────────────
export function checkupStatus(state, id) {
  const c = CHECKUPS.find((x) => x.id === id);
  const rec = state.checkups[id] || {};
  const every = Number(rec.every || c.every);
  if (!rec.last) return { every, next: null, due: false, soon: false };
  const next = addMonths(rec.last, every);
  const today = dayKey();
  return { every, next, due: next <= today, soon: next <= addDays(today, 30) };
}
export const checkupsSoon = (state) => CHECKUPS.filter((c) => checkupStatus(state, c.id).soon);

export function waistDue(state) {
  if (!has(state.profile, 'weight') && !has(state.profile, 'heart')) return false;
  const last = state.waist[state.waist.length - 1];
  return !last || daysBetween(last.date, dayKey()) >= 30;
}

export function visitSoon(state) {
  if (!state.visit) return false;
  const d = daysBetween(dayKey(), state.visit);
  return d >= 0 && d <= 2;
}

// ── Knowledge of the day ────────────────────────────────────
const TOPIC_FOR = { hot: 'hot', sleep: 'sleep', head: 'head', energy: 'sleep', mood: 'mood', fog: 'mood', joints: 'bones' };
export function knowledgeOfDay(state) {
  const days = Object.keys(state.logs).sort();
  const worst = worstSymptom(state.logs[days[days.length - 1]]);
  const id = TOPIC_FOR[worst];
  if (id) return KNOWLEDGE.find((k) => k.id === id);
  const i = Math.floor(Date.now() / 86400000) % KNOWLEDGE.length;
  return KNOWLEDGE[i];
}

// ── BP helpers ──────────────────────────────────────────────
export function bpLevel(sys, dia) {
  if (sys >= 180 || dia >= 120) return 'crisis';
  if (sys >= 140 || dia >= 90) return 'high';
  return 'ok';
}
