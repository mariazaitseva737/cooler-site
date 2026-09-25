// Amplitude product analytics for the app.
//
// Three modes, chosen by the user (onboarding + Settings):
//   'full'  — she said yes. A random analytics id lives on her device, so we can see
//             retention and funnels per person. Still no health values are sent.
//   'basic' — default until she answers, or if she said no. No persistent id at all
//             (a fresh random id per launch), no user properties, sensitive props stripped.
//             Retention is still visible in aggregate via days_since_install.
//   'off'   — nothing is sent.
//
// Never sent in any mode: symptom levels, BP / waist numbers, medicine names or doses,
// free text, dates of periods or visits, IP address.
import * as amplitude from '@amplitude/analytics-browser';
import { getState, update } from './store.js';
import { dayKey, daysBetween } from './dates.js';

const KEY = import.meta.env.PUBLIC_AMPLITUDE_API_KEY || '';
const ZONE = (import.meta.env.PUBLIC_AMPLITUDE_SERVER_ZONE || 'US').toUpperCase() === 'EU' ? 'EU' : 'US';

// Props that describe her health profile. Sent only with 'full' consent.
const SENSITIVE = new Set(['concerns', 'concern', 'concerns_count', 'symptom', 'program', 'topic', 'insight']);

// Screens whose name alone says too much; hidden unless 'full'.
const PRIVATE_SCREENS = new Set(['health/intimate']);

let ready = false;
let mode = 'basic';
const queue = [];

export const analyticsMode = () => getState().analytics || 'basic';

function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Site passes its Amplitude device id as ?aid= so landing → app is one funnel.
function siteDeviceId() {
  const aid = new URLSearchParams(location.search).get('aid');
  return aid && /^[\w-]{8,64}$/.test(aid) ? aid : null;
}

function utm() {
  const q = new URLSearchParams(location.search);
  const out = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) if (q.get(k)) out[k] = q.get(k);
  if (q.get('tgWebAppStartParam')) out.start_param = q.get('tgWebAppStartParam');
  return out;
}

function deviceIdFor(m) {
  const s = getState();
  if (m === 'full') {
    if (!s.analyticsId) update({ analyticsId: siteDeviceId() || uuid() });
    return getState().analyticsId;
  }
  // basic: link to the site visit only on the very first launch; otherwise a throwaway id
  const first = !s.lastOpen && daysBetween(s.installedAt, dayKey()) === 0;
  return (first && siteDeviceId()) || uuid();
}

export function initAnalytics({ inTelegram = false } = {}) {
  mode = analyticsMode();
  if (!KEY || mode === 'off') return;
  amplitude.init(KEY, {
    serverZone: ZONE,
    deviceId: deviceIdFor(mode),
    identityStorage: 'none',          // our own store keeps the id (and mirrors it to Telegram)
    trackingOptions: { ipAddress: false, language: true, platform: true },
    autocapture: {
      attribution: false,             // UTM is added by hand below, only on first open
      pageViews: false,               // hash routes are tracked as screen_viewed
      sessions: true,
      formInteractions: false,        // forms here hold health data
      fileDownloads: false,
      elementInteractions: false,     // would capture on-screen text
      frustrationInteractions: false,
      networkTracking: false,
      webVitals: false,
      pageUrlEnrichment: false,       // the URL hash would name the screen
    },
    remoteConfig: { fetchRemoteConfig: false },
    enableDiagnostics: false,
    appVersion: '1.0.0',
  });
  const s = getState();
  const id = new amplitude.Identify()
    .set('lang', s.lang || 'en')
    .set('in_telegram', inTelegram)
    .set('analytics_mode', mode);
  if (mode === 'full') {
    id.setOnce('install_date', s.installedAt)
      .setOnce('install_week', isoWeek(s.installedAt))
      .set('concerns', s.profile?.concerns || [])
      .set('has_meds', (s.meds || []).length > 0)
      .set('program_started', !!s.program);
  }
  amplitude.identify(id);
  ready = true;
  queue.splice(0).forEach(([e, p]) => send(e, p));
}

function isoWeek(day) {
  const d = new Date(day + 'T12:00:00');
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const n = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - n);
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return `${t.getUTCFullYear()}-W${String(Math.ceil(((t - y) / 86400000 + 1) / 7)).padStart(2, '0')}`;
}

function clean(props) {
  const out = {};
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined) continue;
    if (mode !== 'full' && SENSITIVE.has(k)) continue;
    if (mode !== 'full' && k === 'screen' && PRIVATE_SCREENS.has(v)) { out[k] = 'health/other'; continue; }
    out[k] = v;
  }
  return out;
}

function send(event, props) {
  amplitude.track(event, clean(props));
}

export function track(event, props = {}) {
  if (!KEY || mode === 'off') return;
  const s = getState();
  const p = {
    ...props,
    lang: s.lang,
    days_since_install: daysBetween(s.installedAt, dayKey()),
  };
  if (ready) send(event, p); else queue.push([event, p]);
}

// First open ever: attribution for the funnel.
export function trackFirstOpen(extra = {}) {
  track('app_first_open', { ...utm(), from_site: !!siteDeviceId(), ...extra });
}

export function setAnalyticsMode(next, place = 'settings') {
  const prev = analyticsMode();
  if (prev === next && getState().analyticsAsked) return;
  // Say goodbye in the old mode before switching (so opt-outs are counted, without an id).
  if (KEY && prev !== 'off') track('analytics_consent_changed', { from: prev, to: next, place });
  update({ analytics: next, analyticsAsked: true });
  mode = next;
  if (!KEY) return;
  if (next === 'off') { amplitude.setOptOut(true); return; }
  if (!ready) { initAnalytics(); return; }
  amplitude.setOptOut(false);
  amplitude.setDeviceId(deviceIdFor(next));
  const id = new amplitude.Identify().set('analytics_mode', next);
  if (next === 'full') {
    const s = getState();
    id.setOnce('install_date', s.installedAt).setOnce('install_week', isoWeek(s.installedAt)).set('concerns', s.profile?.concerns || []);
  }
  amplitude.identify(id);
}

// Keep 'full' user properties fresh after meaningful changes.
export function setUserProps(obj) {
  if (!KEY || !ready || mode !== 'full') return;
  const id = new amplitude.Identify();
  for (const [k, v] of Object.entries(obj)) id.set(k, v);
  amplitude.identify(id);
}

// Screen names are route templates, never ids (health/meds/:id).
export function screenName(route) {
  const r = route.slice();
  if (r[0] === 'health' && r[1] === 'meds' && r[2] && r[2] !== 'new') r[2] = 'edit';
  if (r[0] === 'health' && r[1] === 'program' && r[2]) r[2] = 'session';
  return r.join('/') || 'today';
}
