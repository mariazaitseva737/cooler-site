import { useEffect, useRef, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';

export function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <circle cx="17" cy="17" r="15.5" stroke="#0B5C5E" stroke-width="2" />
      <path d="M7 14c3.3-2.6 6.7-2.6 10 0s6.7 2.6 10 0" stroke="#0B5C5E" stroke-width="2" stroke-linecap="round" />
      <path d="M7 20c3.3-2.6 6.7-2.6 10 0s6.7 2.6 10 0" stroke="#0B5C5E" stroke-width="2" stroke-linecap="round" opacity=".55" />
    </svg>
  );
}

const P = {
  today: <><circle cx="13" cy="13" r="9" /><circle cx="13" cy="13" r="3.5" fill="currentColor" stroke="none" /></>,
  trends: <path d="M4 20V13M10 20V7M16 20V11M22 20V5" />,
  health: <path d="M13 21.5s-8-4.7-8-10.8A4.5 4.5 0 0 1 13 8a4.5 4.5 0 0 1 8 2.7c0 6.1-8 10.8-8 10.8z" />,
  learn: <><path d="M4 5.5C7.5 4.5 10.5 5 13 7c2.5-2 5.5-2.5 9-1.5V20c-3.5-1-6.5-.5-9 1.5C10.5 19.5 7.5 19 4 20z" /><path d="M13 7v14" /></>,
  wave: <><path d="M3 10c3-2.6 6-2.6 9 0s6 2.6 9 0" /><path d="M3 16c3-2.6 6-2.6 9 0s6 2.6 9 0" /></>,
  head: <><circle cx="13" cy="11" r="7" /><path d="M9 22c1-2.5 7-2.5 8 0" /><path d="M10 9.5l6 3M16 9.5l-6 3" /></>,
  bp: <><path d="M13 22s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 20 12c0 5.5-7 10-7 10z" /><path d="M8 13h3l1.5-3 2 5 1.5-2h2" /></>,
  pill: <><rect x="4" y="9" width="18" height="8" rx="4" /><path d="M13 9v8" /></>,
  plus: <path d="M13 6v14M6 13h14" />,
  check: <path d="M6 13.5l4.5 4.5L20 8" />,
  chev: <path d="M10 6l7 7-7 7" />,
  back: <path d="M16 6l-7 7 7 7" />,
  close: <path d="M7 7l12 12M19 7L7 19" />,
  cal: <><rect x="4" y="6" width="18" height="16" rx="3" /><path d="M4 11h18M9 4v4M17 4v4" /></>,
  dumbbell: <path d="M3 13h20M6 9v8M9 7v12M17 7v12M20 9v8" />,
  doc: <><path d="M7 3h9l5 5v15H7z" /><path d="M16 3v5h5M10 13h8M10 17h8" /></>,
  ruler: <><rect x="3" y="9" width="20" height="8" rx="2" /><path d="M7 9v3M11 9v4M15 9v3M19 9v4" /></>,
  lock: <><rect x="6" y="11" width="14" height="10" rx="2" /><path d="M9 11V8a4 4 0 0 1 8 0v3" /></>,
  gear: <><circle cx="13" cy="13" r="3.5" /><path d="M13 3v3M13 20v3M3 13h3M20 13h3M5.9 5.9l2.1 2.1M18 18l2.1 2.1M5.9 20.1L8 18M18 8l2.1-2.1" /></>,
  list: <path d="M9 7h12M9 13h12M9 19h12M5 7h.01M5 13h.01M5 19h.01" />,
};
export function Icon({ name, size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      {P[name]}
    </svg>
  );
}

export function Scale({ value, onChange, labels, label }) {
  return (
    <div class={`scale ${labels.length === 3 ? 's3' : ''}`} role="group" aria-label={label}>
      {labels.map((l, i) => (
        <button type="button" class={`l${labels.length === 3 ? i + 1 : i}`} aria-pressed={value === i ? 'true' : 'false'} onClick={() => onChange(value === i ? null : i)}>{l}</button>
      ))}
    </div>
  );
}

export function Chip({ on, onClick, children }) {
  return <button type="button" class="chip" aria-pressed={on ? 'true' : 'false'} onClick={onClick}>{children}</button>;
}

export function Choice({ on, onClick, children, multi }) {
  return (
    <button type="button" class="choice" aria-pressed={on ? 'true' : 'false'} onClick={onClick}>
      {multi && <span class="tick">{on && <svg width="16" height="16" viewBox="0 0 26 26" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.5l4.5 4.5L20 8" /></svg>}</span>}
      <span>{children}</span>
    </button>
  );
}

export function Sheet({ title, onClose, children, closeLabel = 'Закрыть' }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, []);
  return createPortal(
    <div class="sheet-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div class="sheet-head">
          <h2 class="h2">{title}</h2>
          <button class="btn btn-ghost" onClick={onClose} aria-label={closeLabel}><Icon name="close" /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

let toastSet = null;
export function toast(msg) { toastSet?.(msg); }
export function Toaster() {
  const [msg, setMsg] = useState(null);
  useEffect(() => { toastSet = (m) => { setMsg(m); setTimeout(() => setMsg(null), 2600); }; }, []);
  return msg ? <div class="toast" role="status">{msg}</div> : null;
}

// Embeds YouTube / Vimeo / .mp4 links; shows a placeholder when the link is empty.
export function Video({ url, placeholder, title, onPlay }) {
  if (!url) {
    return <div class="video"><div class="stack-s" style="padding:16px"><Icon name="dumbbell" size={34} /><span>{placeholder}</span></div></div>;
  }
  let src = null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (yt) src = `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0`;
  else if (vm) src = `https://player.vimeo.com/video/${vm[1]}`;
  if (src) return <FrameVideo src={src} title={title} onPlay={onPlay} />;
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return <div class="video"><video src={url} controls playsInline preload="metadata" onPlay={onPlay} /></div>;
  return <div class="video"><a class="btn btn-primary" href={url} target="_blank" rel="noopener" onClick={onPlay}>▶ {title}</a></div>;
}

// Iframe players don't expose play events without their JS APIs.
// When the page loses focus to this iframe, the user tapped the player: count it as a play (once).
function FrameVideo({ src, title, onPlay }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!onPlay) return;
    let fired = false;
    const on = () => setTimeout(() => {
      if (!fired && document.activeElement === ref.current) { fired = true; onPlay(); }
    }, 0);
    window.addEventListener('blur', on);
    return () => window.removeEventListener('blur', on);
  }, [src]);
  return <div class="video"><iframe ref={ref} src={src} title={title} allow="fullscreen; picture-in-picture" allowFullScreen loading="lazy" /></div>;
}

export function Field({ label, hint, children, id }) {
  return (
    <div class="field">
      <label for={id}>{label}</label>
      {hint && <span class="hint">{hint}</span>}
      {children}
    </div>
  );
}

export function Bars({ values, max = 3 }) {
  return (
    <div class="bars" aria-hidden="true">
      {values.map((v) => <i class={v == null ? 'empty' : ''} style={{ height: v == null ? '3px' : `${Math.max(6, (v / max) * 100)}%` }} />)}
    </div>
  );
}
