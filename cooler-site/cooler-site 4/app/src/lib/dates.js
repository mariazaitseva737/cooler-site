// Dates are stored as local YYYY-MM-DD strings so a day means the woman's own calendar day.
export const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseDay = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (k, n) => { const d = parseDay(k); d.setDate(d.getDate() + n); return dayKey(d); };
export const daysBetween = (a, b) => Math.round((parseDay(b) - parseDay(a)) / 86400000);
export const lastNDays = (n, end = dayKey()) => Array.from({ length: n }, (_, i) => addDays(end, i - n + 1));
export const addMonths = (k, n) => { const d = parseDay(k); d.setMonth(d.getMonth() + n); return dayKey(d); };

export function fmtDate(k, lang, opts = { day: 'numeric', month: 'long' }) {
  return parseDay(k).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', opts);
}
export function fmtWeekday(k, lang) {
  const s = parseDay(k).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
export function fmtTime(t, lang) {
  if (lang === 'ru') return t;
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'pm' : 'am';
  return `${((h + 11) % 12) + 1}:${pad(m)} ${ap}`;
}
