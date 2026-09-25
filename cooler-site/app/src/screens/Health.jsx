import { useState } from 'preact/hooks';
import { update, useStore, exportData, importData, wipe } from '../lib/store.js';
import { useT } from '../i18n.js';
import { CHECKUPS, CONCERNS, KNOWLEDGE } from '../data/content.js';
import { Icon, Choice, toast } from '../ui/kit.jsx';
import { WaistSheet } from './Sheets.jsx';
import { checkupStatus, has } from '../lib/logic.js';
import { dayKey, fmtDate } from '../lib/dates.js';
import { go } from '../lib/router.js';
import { ask } from '../lib/telegram.js';
import { articleUrl } from '../config.js';
import { track, analyticsMode, setAnalyticsMode, setUserProps } from '../lib/analytics.js';
import Meds, { MedForm } from './Meds.jsx';
import Program, { Session } from './Program.jsx';
import Doctor from './Doctor.jsx';

export default function Health({ route }) {
  const [a, b] = route;
  if (a === 'meds' && b === 'new') return <MedForm />;
  if (a === 'meds' && b) return <MedForm id={b} />;
  if (a === 'meds') return <Meds />;
  if (a === 'program' && b) return <Session k={b} />;
  if (a === 'program') return <Program />;
  if (a === 'checkups') return <Checkups />;
  if (a === 'doctor') return <Doctor />;
  if (a === 'intimate') return <Intimate />;
  if (a === 'settings') return <Settings />;
  return <Hub />;
}

export function Back({ to = 'health' }) {
  const { t } = useT();
  return (
    <header class="top" style="justify-content:flex-start">
      <button class="btn btn-ghost" style="padding:0 4px;text-decoration:none" onClick={() => go(to)}><Icon name="back" /> {t.back}</button>
    </header>
  );
}

function Hub() {
  const s = useStore();
  const { t, lang } = useT();
  const [waist, setWaist] = useState(false);
  const lastWaist = s.waist[s.waist.length - 1];
  const rows = [
    ['meds', 'pill', t.meds, s.meds.length ? String(s.meds.length) : ''],
    ['program', 'dumbbell', t.programs, s.program ? `${s.program.done.length}/24` : ''],
    ['checkups', 'cal', t.checkups, ''],
    ['doctor', 'doc', t.doctor, s.visit ? fmtDate(s.visit, lang, { day: 'numeric', month: 'short' }) : ''],
  ];
  return (
    <div class="stack">
      <header class="top"><h1 class="h1" style="padding:0">{t.healthTitle}</h1></header>
      <nav class="list">
        {rows.map(([id, icon, label, val]) => (
          <button onClick={() => go(`health/${id}`)}>
            <span class="row"><Icon name={icon} /> {label}</span>
            <span class="row"><span class="val">{val}</span><span class="chev"><Icon name="chev" size={20} /></span></span>
          </button>
        ))}
        <button onClick={() => { setWaist(true); track('waist_sheet_opened', { place: 'health' }); }}>
          <span class="row"><Icon name="ruler" /> {t.waist}</span>
          <span class="row"><span class="val">{lastWaist ? `${lastWaist.cm} ${lang === 'ru' ? 'см' : 'cm'}` : ''}</span><span class="chev"><Icon name="chev" size={20} /></span></span>
        </button>
      </nav>
      <nav class="list">
        <button onClick={() => go('health/intimate')}>
          <span class="row"><Icon name="lock" /> {t.intimate}</span><span class="chev"><Icon name="chev" size={20} /></span>
        </button>
        <button onClick={() => go('health/settings')}>
          <span class="row"><Icon name="gear" /> {t.settings}</span><span class="chev"><Icon name="chev" size={20} /></span>
        </button>
      </nav>
      {waist && <WaistSheet onClose={() => setWaist(false)} />}
    </div>
  );
}

function Checkups() {
  const s = useStore();
  const { t, lang, L } = useT();
  const setRec = (id, patch) => update((st) => { st.checkups[id] = { ...(st.checkups[id] || {}), ...patch }; return st; });
  return (
    <div class="stack">
      <Back />
      <h1 class="h1">{t.checkups}</h1>
      <p class="sub" style="padding:0 4px">{t.checkupsIntro}</p>
      {CHECKUPS.map((c) => {
        const st = checkupStatus(s, c.id);
        const rec = s.checkups[c.id] || {};
        return (
          <section class="card">
            <div class="row between">
              <p class="h3">{L(c)}</p>
              {st.next && <span class="small" style={st.due ? 'color:var(--brick-ink);font-weight:600' : ''}>{st.due ? t.overdue : t.dueOn(fmtDate(st.next, lang, { month: 'short', year: 'numeric' }))}</span>}
            </div>
            <div class="row" style="flex-wrap:nowrap">
              <label class="field" style="flex:1;min-width:0"><span class="small">{t.lastDone}</span>
                <input class="input" type="date" max={dayKey()} value={rec.last || ''} onInput={(e) => { setRec(c.id, { last: e.currentTarget.value || null }); track('checkup_date_set', { checkup: c.id, cleared: !e.currentTarget.value }); }} />
              </label>
              <label class="field" style="width:96px;flex-shrink:0"><span class="small">{t.every}, {t.months}</span>
                <input class="input" type="number" min="1" max="120" value={st.every} onInput={(e) => setRec(c.id, { every: Number(e.currentTarget.value) || c.every })} />
              </label>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Intimate() {
  const { t, lang, L } = useT();
  const [open, setOpen] = useState(false);
  const k = KNOWLEDGE.find((x) => x.id === 'intimate');
  return (
    <div class="stack">
      <Back />
      <h1 class="h1">{t.intimate}</h1>
      <div class="okbox">{t.intimateIntro}</div>
      {!open ? (
        <button class="btn btn-primary" onClick={() => { setOpen(true); track('intimate_opened'); }}><Icon name="lock" /> {t.intimateOpen}</button>
      ) : (
        <section class="card">
          <p class="h3">{L(k).q}</p>
          <p style="font-size:18px">{L(k).a}</p>
          <a class="btn btn-ghost" style="justify-self:start" href={articleUrl(k.slug[lang], lang)} target="_blank" rel="noopener" onClick={() => track('article_link_clicked', { place: 'intimate' })}>{t.fullArticle}</a>
          <p class="small">{lang === 'ru' ? 'Скоро здесь: план увлажнения с незаметными напоминаниями и программа для тазового дна.' : 'Coming soon: a moisturizing plan with discreet reminders and a pelvic floor program.'}</p>
        </section>
      )}
    </div>
  );
}

function Settings() {
  const s = useStore();
  const { t, lang, L } = useT();
  const toggle = (id) => update((st) => {
    const c = st.profile.concerns || [];
    st.profile.concerns = c.includes(id) ? c.filter((x) => x !== id) : [...c, id];
    track('concerns_changed', { concern: id, on: !c.includes(id), concerns: st.profile.concerns });
    setUserProps({ concerns: st.profile.concerns });
    return st;
  });
  const [amode, setAmode] = useState(analyticsMode());
  const pickMode = (m) => { setAnalyticsMode(m, 'settings'); setAmode(m); toast(t.savedToast); };
  const setLang = (l) => { if (l !== lang) { track('lang_changed', { to: l, place: 'settings' }); update({ lang: l }); } };
  const doExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cooler-backup-${dayKey()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    track('data_exported');
  };
  const doImport = (e) => {
    const f = e.currentTarget.files?.[0];
    if (!f) return;
    f.text().then((txt) => { try { importData(txt); toast(t.savedToast); track('data_imported'); } catch { toast(lang === 'ru' ? 'Не получилось прочитать файл' : 'Couldn’t read the file'); } });
  };
  return (
    <div class="stack">
      <Back />
      <h1 class="h1">{t.settings}</h1>
      <section class="card">
        <p class="h3">{t.lang}</p>
        <div class="row">
          <Choice on={lang === 'ru'} onClick={() => setLang('ru')}>Русский</Choice>
          <Choice on={lang === 'en'} onClick={() => setLang('en')}>English</Choice>
        </div>
      </section>
      <section class="card">
        <p class="h3">{t.concerns}</p>
        {CONCERNS.map((c) => <Choice multi on={has(s.profile, c.id)} onClick={() => toggle(c.id)}>{L(c)}</Choice>)}
      </section>
      <section class="card">
        <p class="h3">{t.addToHome}</p>
        <p class="sub">{t.addToHomeText}</p>
      </section>
      <section class="card">
        <p class="h3">{t.analyticsTitle}</p>
        <p class="sub">{t.analyticsText}</p>
        {['full', 'basic', 'off'].map((m) => <Choice on={amode === m} onClick={() => pickMode(m)}>{t.analyticsOpts[m]}</Choice>)}
      </section>
      <section class="card">
        <p class="h3">{t.data}</p>
        <p class="sub">{t.privacyNote}</p>
        <button class="btn btn-outline" onClick={doExport}>{t.exportData}</button>
        <label class="btn btn-outline" style="cursor:pointer">{t.importData}<input type="file" accept="application/json" hidden onChange={doImport} /></label>
        <button class="btn btn-danger" onClick={async () => { if (await ask(t.wipeConfirm)) { track('data_wiped'); wipe(); go('today'); } }}>{t.wipe}</button>
      </section>
    </div>
  );
}
