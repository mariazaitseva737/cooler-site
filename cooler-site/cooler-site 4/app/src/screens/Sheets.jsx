import { useEffect, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { getState, update } from '../lib/store.js';
import { useT } from '../i18n.js';
import { Sheet, Scale, toast } from '../ui/kit.jsx';
import { bpLevel, localIso, painkillerDaysThisMonth, eventsOn } from '../lib/logic.js';
import { dayKey, fmtTime, fmtDate } from '../lib/dates.js';
import { track } from '../lib/analytics.js';
import { haptic } from '../lib/telegram.js';

// ── "Hot flash started": logs the event and opens 2 minutes of paced breathing ──
export function Breathing({ onClose: close, place = 'today' }) {
  const { t, lang } = useT();
  const [left, setLeft] = useState(120);
  const [time] = useState(() => {
    const iso = localIso();
    update((s) => { s.events.push({ t: iso, type: 'hotflash' }); return s; });
    track('hotflash_logged', { place });
    haptic('medium');
    return iso.slice(11, 16);
  });
  useEffect(() => {
    const id = setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { clearInterval(id); document.body.style.overflow = prev; };
  }, []);
  const onClose = (how = 'close') => {
    const seconds = 120 - left;
    track(left === 0 ? 'breathing_completed' : 'breathing_closed_early', { seconds, how });
    close();
  };
  const m = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  const count = eventsOn(getState().events, dayKey(), 'hotflash').length;
  return createPortal(
    <div class="breath" role="dialog" aria-modal="true" aria-label={t.qHot}>
      <div class="row between">
        <span style="font-size:17px;color:#BFDCD4">{t.hotLogged(fmtTime(time, lang))} · {t.hotToday(count)}</span>
        <button class="btn" style="min-height:44px;border:1.5px solid #4E8583;color:#F3F7F5;background:transparent;font-size:17px" onClick={() => onClose('close')}>{t.close}</button>
      </div>
      <div class="center">
        <div class="orb-wrap">
          <div class="orb" /><div class="orb in2" />
          <div class="orb-label"><span class="lab-in">{t.inhale}</span><span class="lab-out">{t.exhale}</span></div>
        </div>
        <p class="wave-text">{t.wave}</p>
        <p style="font-size:18px;color:#BFDCD4">{t.rhythm}</p>
      </div>
      <p style="text-align:center;font-size:20px;font-variant-numeric:tabular-nums" aria-live="off">{left > 0 ? t.timeLeft(m) : t.twoMinDone}</p>
      <button class="btn btn-glass btn-block" style="min-height:62px;font-size:21px" onClick={() => onClose('better')}>{t.better}</button>
    </div>,
    document.body,
  );
}

// ── Headache ──
export function HeadacheSheet({ onClose, onBp }) {
  const { t } = useT();
  const [level, setLevel] = useState(null);
  const [pill, setPill] = useState(false);
  const [saved, setSaved] = useState(false);
  const save = () => {
    update((s) => { s.events.push({ t: localIso(), type: 'headache', level: (level ?? 0) + 1, painkiller: pill }); return s; });
    // Also reflect it in today's log so trends and insights see it.
    update((s) => { const d = dayKey(); s.logs[d] = { ...(s.logs[d] || {}), head: Math.max(s.logs[d]?.head ?? 0, (level ?? 0) + 1) }; return s; });
    track('headache_logged', { level_given: level != null });
    setSaved(true);
  };
  const days = painkillerDaysThisMonth(getState());
  return (
    <Sheet title={t.headTitle} onClose={onClose} closeLabel={t.close}>
      {!saved ? (
        <>
          <div class="stack-s">
            <p class="h3">{t.headHow}</p>
            <Scale labels={t.headLevels} value={level} onChange={setLevel} label={t.headHow} />
          </div>
          <button type="button" class="choice" aria-pressed={pill ? 'true' : 'false'} onClick={() => setPill(!pill)}>
            <span class="tick">{pill && <svg width="16" height="16" viewBox="0 0 26 26" fill="none" stroke="#fff" stroke-width="3.2"><path d="M6 13.5l4.5 4.5L20 8" /></svg>}</span>
            <span>{t.headPill}</span>
          </button>
          <button class="btn btn-primary btn-block" onClick={save}>{t.save}</button>
          <div class="flag">{t.headFlag}</div>
        </>
      ) : (
        <>
          <div class="okbox">{t.headSaved}. {t.painkillerDays(days)}</div>
          {days > 10 && <div class="flag">{t.painkillerWarn}</div>}
          <button class="btn btn-outline btn-block" onClick={() => { track('headache_to_bp_clicked'); onClose(); onBp(); }}>{t.headBp}</button>
          <button class="btn btn-ghost" onClick={onClose}>{t.done}</button>
        </>
      )}
    </Sheet>
  );
}

// ── Blood pressure ──
export function BpSheet({ onClose }) {
  const { t, lang } = useT();
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [pulse, setPulse] = useState('');
  const [result, setResult] = useState(null);
  const valid = Number(sys) >= 60 && Number(sys) <= 260 && Number(dia) >= 30 && Number(dia) <= 180;
  const save = () => {
    const rec = { t: localIso(), sys: Number(sys), dia: Number(dia), pulse: pulse ? Number(pulse) : null };
    update((s) => { s.bp.push(rec); return s; });
    track('bp_logged', { pulse_given: !!pulse });
    setResult(bpLevel(rec.sys, rec.dia));
  };
  const last = getState().bp.slice(-5).reverse();
  return (
    <Sheet title={t.bpTitle} onClose={onClose} closeLabel={t.close}>
      {!result ? (
        <>
          <p class="sub">{t.bpHint}</p>
          <div class="num3">
            <label class="field"><span class="small">{t.bpSys}</span><input class="input" inputmode="numeric" type="number" value={sys} onInput={(e) => setSys(e.currentTarget.value)} /></label>
            <label class="field"><span class="small">{t.bpDia}</span><input class="input" inputmode="numeric" type="number" value={dia} onInput={(e) => setDia(e.currentTarget.value)} /></label>
            <label class="field"><span class="small">{t.bpPulse}</span><input class="input" inputmode="numeric" type="number" value={pulse} onInput={(e) => setPulse(e.currentTarget.value)} /></label>
          </div>
          <button class="btn btn-primary btn-block" disabled={!valid} onClick={save}>{t.save}</button>
        </>
      ) : (
        <>
          {result === 'crisis' && <div class="flag">{t.bpCrisis}</div>}
          {result === 'high' && <div class="okbox">{t.bpHigh}</div>}
          {result === 'ok' && <div class="okbox">{t.bpOk}</div>}
          <button class="btn btn-primary btn-block" onClick={onClose}>{t.done}</button>
        </>
      )}
      {last.length > 0 && (
        <div class="stack-s">
          <p class="h3">{t.bpLast}</p>
          {last.map((r) => (
            <div class="row between small" style="font-size:17px">
              <span>{fmtDate(r.t.slice(0, 10), lang, { day: 'numeric', month: 'short' })}, {fmtTime(r.t.slice(11, 16), lang)}</span>
              <b style="color:var(--ink)">{r.sys}/{r.dia}{r.pulse ? ` · ${r.pulse}` : ''}</b>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}

// ── Waist ──
export function WaistSheet({ onClose }) {
  const { t } = useT();
  const [cm, setCm] = useState('');
  const save = () => {
    update((s) => { s.waist.push({ date: dayKey(), cm: Number(cm) }); return s; });
    track('waist_logged');
    toast(t.bpOk);
    onClose();
  };
  return (
    <Sheet title={t.waist} onClose={onClose} closeLabel={t.close}>
      <p class="sub">{t.waistIntro}</p>
      <label class="field"><span>{t.waistCm}</span><input class="input" inputmode="decimal" type="number" value={cm} onInput={(e) => setCm(e.currentTarget.value)} /></label>
      <button class="btn btn-primary btn-block" disabled={!(Number(cm) > 40 && Number(cm) < 200)} onClick={save}>{t.save}</button>
    </Sheet>
  );
}
