// All data lives on the device: localStorage in the browser, plus Telegram DeviceStorage inside Telegram.
// Nothing here is ever sent to a server. (Analytics sends only event names, see lib/analytics.js.)
import { useEffect, useState } from 'preact/hooks';
import { dayKey } from './dates.js';
import { deviceLoad, deviceSave } from './telegram.js';

const KEY = 'cooler.v1';

export const emptyState = () => ({
  version: 1,
  lang: null,
  onboarded: false,
  installedAt: dayKey(),
  lastOpen: null,
  profile: { age: null, lastPeriod: null, concerns: [], remindVia: null },
  logs: {},        // 'YYYY-MM-DD' -> { sleep, energy, mood, head, joints, hot: 0..3, tags: [] }
  events: [],      // { t: ISO, type: 'hotflash' | 'headache', level?: 1..3, painkiller?: bool }
  bp: [],          // { t: ISO, sys, dia, pulse }
  meds: [],        // see screens/Meds.jsx
  medLog: {},      // 'YYYY-MM-DD' -> { '<medId>@<time>': 'taken' | 'skipped' }
  program: null,   // { id: 'bones', startedAt: 'YYYY-MM-DD', done: ['w1s1', ...] }
  waist: [],       // { date, cm }
  checkups: {},    // key -> { last: 'YYYY-MM-DD', every: months }
  visit: null,     // 'YYYY-MM-DD' of the next doctor's appointment
  seenInsights: [],
  analytics: null,       // null (not asked → basic) | 'full' | 'basic' | 'off'
  analyticsAsked: false,
  analyticsId: null,     // random id, only created with 'full' consent
});

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...emptyState(), ...JSON.parse(raw) };
  } catch (e) {}
  return emptyState();
}

function persist() {
  const raw = JSON.stringify(state);
  try { localStorage.setItem(KEY, raw); } catch (e) {}
  deviceSave(KEY, raw);
}

// If the browser storage was wiped but Telegram still has a copy, bring it back.
export async function restoreFromDevice() {
  if (state.onboarded) return;
  const raw = await deviceLoad(KEY);
  if (!raw) return;
  try {
    state = { ...emptyState(), ...JSON.parse(raw) };
    persist();
    listeners.forEach((l) => l(state));
  } catch (e) {}
}

export const getState = () => state;

export function update(fn) {
  const next = typeof fn === 'function' ? fn(structuredClone(state)) : { ...state, ...fn };
  state = next || state;
  persist();
  listeners.forEach((l) => l(state));
}

export function useStore() {
  const [s, set] = useState(state);
  useEffect(() => {
    listeners.add(set);
    return () => listeners.delete(set);
  }, []);
  return s;
}

export function exportData() {
  return JSON.stringify(state, null, 2);
}
export function importData(text) {
  const parsed = JSON.parse(text);
  if (!parsed || parsed.version !== 1) throw new Error('bad file');
  state = { ...emptyState(), ...parsed };
  persist();
  listeners.forEach((l) => l(state));
}
export function wipe() {
  const lang = state.lang;
  state = { ...emptyState(), lang };
  persist();
  listeners.forEach((l) => l(state));
}

export const uid = () => Math.random().toString(36).slice(2, 10);
