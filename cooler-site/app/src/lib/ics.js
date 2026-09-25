// Reminders without a server: we create repeating events for the phone's own calendar.
// Titles are neutral on purpose: nothing about medicines or symptoms appears on the lock screen.
import { pad } from './dates.js';
import { inTelegram, tg } from './telegram.js';

const stampUtc = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

export function buildIcs({ title, times = ['09:00'], rrule = '', start }) {
  const day = (start || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
  const events = times.map((time, i) => {
    const [h, m] = time.split(':');
    return [
      'BEGIN:VEVENT', `UID:${Date.now()}-${i}@cooler`, `DTSTAMP:${stampUtc(new Date())}`,
      `DTSTART:${day}T${h}${m}00`, 'DURATION:PT10M', rrule ? `RRULE:${rrule}` : '', `SUMMARY:${title}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${title}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT',
    ].filter(Boolean).join('\r\n');
  });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cooler//EN', ...events, 'END:VCALENDAR'].join('\r\n');
}

// Browser: download the .ics file. Telegram: open a link that returns the file (Netlify function).
export function addToCalendar({ title, times, rrule, start }) {
  if (inTelegram) {
    const q = new URLSearchParams({ title, times: times.join(','), rrule: rrule || '', start: start || '' });
    const url = `${location.origin}/.netlify/functions/ics?${q}`;
    try { tg.openLink(url); } catch (e) { window.open(url, '_blank'); }
    return;
  }
  const blob = new Blob([buildIcs({ title, times, rrule, start })], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'cooler-reminder.ics';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
