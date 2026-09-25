import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import '@fontsource/onest/400.css';
import '@fontsource/onest/500.css';
import '@fontsource/onest/600.css';
import '@fontsource/onest/700.css';
import '@fontsource/literata/400.css';
import '@fontsource/literata/600.css';
import './styles.css';
import { getState, update, useStore, restoreFromDevice } from './lib/store.js';
import { dayKey, daysBetween } from './lib/dates.js';
import { initTelegram, telegramLang, inTelegram } from './lib/telegram.js';
import { initAnalytics, track, trackFirstOpen, screenName } from './lib/analytics.js';
import { useT } from './i18n.js';
import { Icon, Toaster } from './ui/kit.jsx';
import { go } from './lib/router.js';
import Onboarding from './screens/Onboarding.jsx';
import Today from './screens/Today.jsx';
import Trends from './screens/Trends.jsx';
import Health from './screens/Health.jsx';
import Learn from './screens/Learn.jsx';

// ── Language: ?lang= from the site → saved choice → Telegram → phone settings ──
(function pickLang() {
  const s = getState();
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'ru' || q === 'en') { if (s.lang !== q) update({ lang: q }); return; }
  if (s.lang) return;
  const src = (telegramLang() || navigator.language || 'en').toLowerCase();
  update({ lang: src.startsWith('ru') ? 'ru' : 'en' });
})();

initTelegram();
initAnalytics({ inTelegram });

// ── Retention: one app_open per day with days since install (works without any user id) ──
(function daily() {
  const s = getState();
  const today = dayKey();
  if (!s.lastOpen) trackFirstOpen({ in_telegram: inTelegram });
  if (s.lastOpen === today) return;
  const gap = s.lastOpen ? daysBetween(s.lastOpen, today) : null;
  track('app_open', {
    in_telegram: inTelegram,
    onboarded: s.onboarded,
    days_since_last_open: gap,
    return_bucket: gap == null ? 'new' : gap <= 1 ? 'next_day' : gap <= 7 ? 'within_week' : 'after_week',
  });
  update({ lastOpen: today, prevOpen: s.lastOpen });
})();

// ── Tiny hash router ──
const parse = () => (location.hash.replace(/^#\/?/, '') || 'today').split('/');
function useRoute() {
  const [r, setR] = useState(parse());
  useEffect(() => {
    const on = () => setR(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
}

function Nav({ tab }) {
  const { t } = useT();
  const items = [['today', t.navToday, 'today'], ['trends', t.navTrends, 'trends'], ['health', t.navHealth, 'health'], ['learn', t.navLearn, 'learn']];
  return (
    <nav class="nav" aria-label="Main">
      <div class="nav-in">
        {items.map(([id, label, icon]) => (
          <button aria-current={tab === id ? 'page' : undefined} onClick={() => go(id)}>
            <Icon name={icon} /> <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function App() {
  const s = useStore();
  const { lang } = useT();
  const route = useRoute();
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { restoreFromDevice(); }, []);
  const name = s.onboarded ? screenName(route) : 'onboarding';
  useEffect(() => { if (s.onboarded) track('screen_viewed', { screen: name }); }, [name]);

  if (!s.onboarded) return <><Onboarding /><Toaster /></>;

  const tab = route[0];
  let screen;
  if (tab === 'trends') screen = <Trends />;
  else if (tab === 'health') screen = <Health route={route.slice(1)} />;
  else if (tab === 'learn') screen = <Learn />;
  else screen = <Today />;

  return (
    <>
      <main class="app">{screen}</main>
      <Nav tab={['today', 'trends', 'health', 'learn'].includes(tab) ? tab : 'today'} />
      <Toaster />
    </>
  );
}

render(<App />, document.getElementById('root'));
