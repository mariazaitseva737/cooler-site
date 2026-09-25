// Builds a calendar reminder file from query parameters (title, times, rrule, start).
// Used only inside Telegram, where the app cannot save a file itself.
// Titles are neutral ("Time for your tablets"); no health data passes through here.
const pad = (n) => String(n).padStart(2, '0');
const stamp = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
const clean = (s = '', max = 80) => String(s).replace(/[\r\n;\\,]/g, ' ').slice(0, max);

export default async (req) => {
  const u = new URL(req.url);
  const title = clean(u.searchParams.get('title') || 'Cooler');
  const times = (u.searchParams.get('times') || '09:00').split(',').filter((t) => /^\d{2}:\d{2}$/.test(t)).slice(0, 6);
  const rr = u.searchParams.get('rrule') || '';
  const rrule = /^[A-Z0-9=;,]{0,80}$/.test(rr) ? rr : '';
  const st = u.searchParams.get('start') || '';
  const day = (/^\d{4}-\d{2}-\d{2}$/.test(st) ? st : new Date().toISOString().slice(0, 10)).replace(/-/g, '');
  const events = (times.length ? times : ['09:00']).map((time, i) => {
    const [h, m] = time.split(':');
    return [
      'BEGIN:VEVENT', `UID:${Date.now()}-${i}@cooler`, `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${day}T${h}${m}00`, 'DURATION:PT10M', rrule ? `RRULE:${rrule}` : '', `SUMMARY:${title}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${title}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT',
    ].filter(Boolean).join('\r\n');
  });
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cooler//EN', ...events, 'END:VCALENDAR'].join('\r\n');
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="cooler-reminder.ics"',
      'Cache-Control': 'no-store',
    },
  });
};
