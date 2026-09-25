import { useEffect } from 'preact/hooks';
import { useStore } from '../lib/store.js';
import { track } from '../lib/analytics.js';
import { useT } from '../i18n.js';
import { SYMPTOMS } from '../data/content.js';
import { Bars } from '../ui/kit.jsx';
import { lastNDays, fmtDate } from '../lib/dates.js';
import { activeSymptoms, insights, weekSummary, adherence, painkillerDaysThisMonth } from '../lib/logic.js';

export default function Trends() {
  const s = useStore();
  const { t, lang, L } = useT();
  const days = lastNDays(14);
  const logged = days.filter((d) => s.logs[d]).length;
  const hot = days.map((d) => s.events.filter((e) => e.type === 'hotflash' && e.t.startsWith(d)).length);
  const heads = days.map((d) => s.events.filter((e) => e.type === 'headache' && e.t.startsWith(d)).length);
  const ins = insights(s, lang);
  const adh = adherence(s);
  const bp = s.bp.slice(-10);
  useEffect(() => { track('trends_viewed', { days_logged_14: logged, insights_count: ins.length, has_bp: s.bp.length > 0, has_adherence: adh != null }); }, []);
  const axis = <div class="axis"><span>{fmtDate(days[0], lang, { day: 'numeric', month: 'short' })}</span><span>{t.today}</span></div>;

  return (
    <div class="stack">
      <header class="top"><h1 class="h1" style="padding:0">{t.trendsTitle}</h1></header>
      {logged === 0 && s.events.length === 0 && s.bp.length === 0 && <div class="card"><p class="sub">{t.noData}</p></div>}

      {ins.length > 0 && (
        <section class="card glass">
          <p class="kicker" style="color:var(--lagoon-dark)">{t.insightsTitle}</p>
          {ins.map((i) => <div class="stack-s"><p style="font-size:19px">{i.text}</p><p class="small">{i.basis}</p></div>)}
        </section>
      )}

      {logged > 0 && (
        <section class="card">
          <p class="kicker">{t.weekTitle}</p>
          {weekSummary(s, lang).map((l) => <p style="font-size:18px">{l}</p>)}
        </section>
      )}

      {logged > 0 && activeSymptoms(s.profile).map((id) => (
        <section class="card chart">
          <p class="h3">{L(SYMPTOMS.find((x) => x.id === id))}</p>
          <Bars values={days.map((d) => s.logs[d]?.[id] ?? null)} />
          {axis}
        </section>
      ))}

      {hot.some(Boolean) && (
        <section class="card chart">
          <p class="h3">{t.hotCount}</p>
          <Bars values={hot.map((v) => v || null)} max={Math.max(3, ...hot)} />
          {axis}
        </section>
      )}

      {heads.some(Boolean) && (
        <section class="card chart">
          <p class="h3">{t.headCount}</p>
          <Bars values={heads.map((v) => v || null)} max={Math.max(2, ...heads)} />
          {axis}
          <p class="sub">{t.painkillerDays(painkillerDaysThisMonth(s))}</p>
        </section>
      )}

      {bp.length > 0 && (
        <section class="card">
          <p class="h3">{t.bpChart}</p>
          <BpChart data={bp} />
          {bp.slice(-3).reverse().map((r) => (
            <div class="row between"><span class="small">{fmtDate(r.t.slice(0, 10), lang, { day: 'numeric', month: 'short' })}</span><b>{r.sys}/{r.dia}</b></div>
          ))}
        </section>
      )}

      {adh != null && (
        <section class="card">
          <p class="h3">{t.adherence}</p>
          <div class="bar"><i style={{ width: `${adh}%` }} /></div>
          <p class="sub">{t.adherenceVal(adh)}</p>
        </section>
      )}
    </div>
  );
}

// Two lines (top and bottom numbers) with 140/90 guide lines.
function BpChart({ data }) {
  const W = 320, H = 150, pad = 24;
  const lo = 50, hi = Math.max(190, ...data.map((d) => d.sys + 10));
  const x = (i) => pad + (data.length === 1 ? (W - 2 * pad) / 2 : (i * (W - 2 * pad)) / (data.length - 1));
  const y = (v) => H - pad - ((v - lo) / (hi - lo)) * (H - 2 * pad);
  const line = (k) => data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[k]).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Blood pressure chart">
      {[140, 90].map((g) => (
        <g><line x1={pad} x2={W - pad} y1={y(g)} y2={y(g)} stroke="#E58A4E" stroke-dasharray="4 4" stroke-width="1.2" />
          <text x={W - pad} y={y(g) - 4} text-anchor="end" font-size="11" fill="#6E1F14">{g}</text></g>
      ))}
      <path d={line('sys')} fill="none" stroke="#0B4F52" stroke-width="2.5" />
      <path d={line('dia')} fill="none" stroke="#2E8A86" stroke-width="2.5" />
      {data.map((d, i) => <g><circle cx={x(i)} cy={y(d.sys)} r="3.5" fill="#0B4F52" /><circle cx={x(i)} cy={y(d.dia)} r="3.5" fill="#2E8A86" /></g>)}
    </svg>
  );
}
