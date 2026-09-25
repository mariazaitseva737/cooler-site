import { useState } from 'preact/hooks';
import { update } from '../lib/store.js';
import { useT, APP_NAME } from '../i18n.js';
import { CONCERNS } from '../data/content.js';
import { Choice, Logo } from '../ui/kit.jsx';
import { track, setAnalyticsMode, setUserProps } from '../lib/analytics.js';
import { useEffect } from 'preact/hooks';
import { go } from '../lib/router.js';

export default function Onboarding() {
  const { t, lang, L } = useT();
  const [step, setStep] = useState(0);
  const [age, setAge] = useState('');
  const [period, setPeriod] = useState(null);
  const [concerns, setConcerns] = useState([]);
  const [meds, setMeds] = useState(null);
  const [consent, setConsent] = useState(null);
  const STEPS = ['welcome', 'age', 'period', 'concerns', 'meds', 'ready'];
  useEffect(() => { track('onboarding_step_viewed', { step: STEPS[step], step_index: step }); }, [step]);
  const total = 4;

  const toggle = (id) => setConcerns((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const next = (skipped = false) => {
    const props = { step: STEPS[step], step_index: step, skipped };
    if (step === 1) props.age_given = !!age && !skipped;
    if (step === 2) props.period_answered = period != null && !skipped;
    if (step === 3) { props.concerns_count = concerns.length; props.concerns = concerns; }
    if (step === 4) props.has_meds = meds;
    track('onboarding_step_completed', props);
    setStep((n) => n + 1);
  };

  function finish(openMeds) {
    setAnalyticsMode(consent === false ? 'basic' : consent === true ? 'full' : 'basic', 'onboarding');
    update((st) => {
      st.onboarded = true;
      st.profile = { age: age ? Number(age) : null, lastPeriod: period, concerns, remindVia: null };
      return st;
    });
    track('onboarding_done', { concerns_count: concerns.length, concerns, has_meds: !!openMeds, age_given: !!age, consent: consent == null ? 'skipped' : consent ? 'yes' : 'no' });
    setUserProps({ concerns, has_meds: !!openMeds });
    go(openMeds ? 'health/meds/new' : 'today');
  }

  const Dots = () => (
    <div class="dots" aria-hidden="true">{Array.from({ length: total }, (_, i) => <i class={i < step ? 'on' : ''} />)}</div>
  );

  return (
    <main class="app no-nav">
      <div class="onb">
        {step === 0 && (
          <>
            <div class="row between">
              <div class="brand"><Logo /> {APP_NAME[lang]}</div>
              <button class="btn btn-outline" style="min-height:44px;padding:0 14px;font-size:17px" onClick={() => update({ lang: lang === 'ru' ? 'en' : 'ru' })}>{lang === 'ru' ? 'English' : 'Русский'}</button>
            </div>
            <div class="grow">
              <h1 class="h1">{t.obHello}</h1>
              <p style="font-size:21px">{t.obIntro}</p>
              <div class="okbox">{t.obPrivacy}</div>
            </div>
            <button class="btn btn-primary btn-block" onClick={() => next()}>{t.obStart}</button>
          </>
        )}

        {step === 1 && (
          <>
            <Dots />
            <div class="grow">
              <h1 class="h1">{t.obAge}</h1>
              <p class="sub">{t.obAgeHint}</p>
              <input class="input" style="font-size:28px;text-align:center;max-width:180px" type="number" inputmode="numeric" min="35" max="100" value={age} onInput={(e) => setAge(e.currentTarget.value)} aria-label={t.obAge} />
            </div>
            <button class="btn btn-primary btn-block" onClick={() => next()}>{t.next}</button>
            <button class="btn btn-ghost" onClick={() => { setAge(''); next(true); }}>{t.skip}</button>
          </>
        )}

        {step === 2 && (
          <>
            <Dots />
            <div class="grow">
              <h1 class="h1">{t.obPeriod}</h1>
              {t.obPeriodOpts.map((o, i) => <Choice on={period === i} onClick={() => setPeriod(i)}>{o}</Choice>)}
              {period === 0 && <div class="okbox">{t.obPeri}</div>}
            </div>
            <button class="btn btn-primary btn-block" onClick={() => next()}>{t.next}</button>
            <button class="btn btn-ghost" onClick={() => { setPeriod(null); next(true); }}>{t.skip}</button>
          </>
        )}

        {step === 3 && (
          <>
            <Dots />
            <div class="grow">
              <h1 class="h1">{t.obConcerns}</h1>
              <p class="sub">{t.obConcernsHint}</p>
              {CONCERNS.map((c) => <Choice multi on={concerns.includes(c.id)} onClick={() => toggle(c.id)}>{L(c)}</Choice>)}
            </div>
            <button class="btn btn-primary btn-block" onClick={() => next()}>{t.next}</button>
          </>
        )}

        {step === 4 && (
          <>
            <Dots />
            <div class="grow">
              <h1 class="h1">{t.obMeds}</h1>
              <p class="sub">{t.obMedsHint}</p>
              <Choice on={meds === true} onClick={() => setMeds(true)}>{t.obMedsYes}</Choice>
              <Choice on={meds === false} onClick={() => setMeds(false)}>{t.obMedsNo}</Choice>
            </div>
            <button class="btn btn-primary btn-block" onClick={() => next()}>{t.next}</button>
          </>
        )}

        {step === 5 && (
          <>
            <div class="grow">
              <h1 class="h1">{t.obReady}</h1>
              <p style="font-size:21px">{t.obReadyText}</p>
              <section class="card glass" style="margin-top:8px">
                <p class="h3">{t.consentTitle}</p>
                <p class="sub" style="color:var(--ink-2)">{t.consentText}</p>
                <Choice on={consent === true} onClick={() => setConsent(true)}>{t.consentYes}</Choice>
                <Choice on={consent === false} onClick={() => setConsent(false)}>{t.consentNo}</Choice>
              </section>
            </div>
            <button class="btn btn-primary btn-block" onClick={() => finish(meds === true)}>{meds ? t.addMed : t.obGo}</button>
          </>
        )}
      </div>
    </main>
  );
}
