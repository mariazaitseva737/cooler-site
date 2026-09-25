import { useT } from '../i18n.js';
import { KNOWLEDGE, RED_FLAGS } from '../data/content.js';
import { articleUrl } from '../config.js';
import { track } from '../lib/analytics.js';

export default function Learn() {
  const { t, lang, L } = useT();
  return (
    <div class="stack">
      <header class="top"><h1 class="h1" style="padding:0">{t.learnTitle}</h1></header>
      <section class="card" style="border:2px solid var(--brick)">
        <p class="kicker" style="color:var(--brick-ink)">{t.redFlags}</p>
        {RED_FLAGS[lang].map((f) => <p style="font-size:17px;color:var(--brick-ink)">{f}</p>)}
      </section>
      {KNOWLEDGE.filter((k) => k.id !== 'intimate').map((k) => (
        <details class="acc" onToggle={(e) => e.currentTarget.open && track('knowledge_opened', { topic: k.id })}>
          <summary>{L(k).q}</summary>
          <div class="acc-body">
            <p>{L(k).a}</p>
            {k.slug && <a href={articleUrl(k.slug[lang], lang)} target="_blank" rel="noopener" onClick={() => track('article_link_clicked', { place: 'learn', topic: k.id })}>{t.fullArticle}</a>}
          </div>
        </details>
      ))}
      <p class="small" style="padding:0 4px">{lang === 'ru' ? 'Приложение не ставит диагнозы и не заменяет врача. Интимные темы — в разделе «Здоровье» → «Интимное здоровье».' : 'The app doesn’t diagnose and doesn’t replace your doctor. Intimate topics are under Health → Intimate health.'}</p>
    </div>
  );
}
