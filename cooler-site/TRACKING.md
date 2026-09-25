# Аналитика: план событий (Amplitude)

Сайт и приложение шлют события в один проект Amplitude. Ключ задаётся в Netlify → Site configuration → Environment variables:

| Переменная | Значение |
|---|---|
| `PUBLIC_AMPLITUDE_API_KEY` | API Key проекта (Amplitude → Settings → Projects → ваш проект → General) |
| `PUBLIC_AMPLITUDE_SERVER_ZONE` | `US` (по умолчанию) или `EU`, если проект создан в европейском дата-центре |

Без ключа никакой аналитики нет, сайт и приложение работают как раньше. После добавления ключа нажмите Deploys → Trigger deploy.

## Что мы обещаем пользователю и как это устроено

Текст на лендинге («Что мы всё-таки считаем») и в настройках приложения описывает ровно это. Если меняете код, меняйте и текст.

- IP-адрес не отправляется (`trackingOptions.ipAddress: false`).
- Никаких cookies. На сайте случайный id устройства лежит в localStorage.
- Автосбор кликов и форм выключен, потому что он записывает текст со страницы. Все события названы вручную.
- Email, записи самочувствия, цифры давления и талии, названия лекарств, заметки и даты визитов не отправляются никогда, ни в каком режиме.
- В приложении три режима, пользователь выбирает в онбординге и в «Настройках»:
  - **basic** (по умолчанию и если она ответила «Нет»): при каждом запуске новый случайный id, свойства профиля не отправляются, поля `concerns`, `concern`, `concerns_count`, `symptom`, `program`, `topic`, `insight` вырезаются, экран интимного здоровья называется `health/other`. Удержание всё равно видно по полю `days_since_install`.
  - **full** (ответила «Да»): постоянный случайный id хранится в данных приложения (и в Telegram), к событиям добавляются её выбранные темы (`concerns`) как свойство пользователя. Так работают воронки и когорты по людям.
  - **off**: ничего не отправляется.
- Сайт и приложение живут на одном домене. Кнопки «Попробовать» передают в приложение `aid` (id с сайта) и utm-метки. При первом запуске приложение использует этот id, поэтому путь «лендинг → приложение → онбординг → первая отметка» виден как одна воронка.

Почему так строго. Приложение для здоровья попадает под FTC Health Breach Notification Rule в США: передача данных о здоровье третьей стороне без ясного согласия считается нарушением (дела GoodRx, Flo, BetterHelp). В ЕС постоянный id на устройстве требует согласия. Режим basic не связывает визиты с человеком, поэтому остаётся безопасным вариантом по умолчанию. Это не юридическая консультация: перед рекламным запуском покажите политику конфиденциальности юристу.

## События сайта

У каждого события: `page_type` (home, blog, article, thanks), `lang`, `path`. У статьи ещё `article_slug`, `topic`, `article_key`.

| Событие | Когда | Поля |
|---|---|---|
| `page_viewed` | открыли страницу | `referrer_host` (`direct`, `internal` или домен), `utm_*` |
| `section_viewed` | блок лендинга виден на 40% (один раз) | `section`: hero, not_alone, screens, features, intimate, privacy, faq, bottom_cta, subscribe, article_faq, article_sources, article_flag |
| `screenshot_viewed` | скриншот приложения попал в экран | `screen`: hero_today, today, breathing, trends, doctor |
| `cta_clicked` | клик по кнопке с `data-track` | `cta` (try_app), `place` (header, hero, screens, bottom, article) |
| `app_link_clicked` | любой переход в /app/ | `place` |
| `faq_opened` | открыли вопрос | `question_index`, `question` |
| `lang_switched` | переключили RU/EN | `to` |
| `blog_topic_filtered` | фильтр тем в блоге | `topic` (или `all`) |
| `article_card_clicked` | клик по карточке в блоге | `target_slug`, `position`, `featured` |
| `article_read_depth` | прочитано 25/50/75/100% текста | `percent` |
| `article_engaged_time` | вкладка открыта и видна 15/30/60/120/240 сек | `seconds` |
| `read_next_clicked` | «Читать дальше» | `target_path` |
| `article_source_clicked` | ссылка на источник | `source_host` |
| `outbound_link_clicked` | другие внешние ссылки | `host` |
| `waitlist_form_started` | поставили курсор в поле email | `place` (hero, bottom, blog) |
| `waitlist_form_submitted` | нажали «Отправить» | `place` |
| `waitlist_form_succeeded` | Netlify принял адрес | `place` |
| `waitlist_form_failed` | не ушло | `place`, `reason` |

Amplitude сам добавляет `session_start`/`session_end` и первое касание (utm, referrer) как свойства пользователя.

## События приложения

У каждого события: `lang`, `days_since_install`.

**Запуск и удержание**

| Событие | Поля |
|---|---|
| `app_first_open` | `utm_*`, `start_param` (Telegram), `from_site`, `in_telegram` |
| `app_open` (раз в день) | `in_telegram`, `onboarded`, `days_since_last_open`, `return_bucket` (new, next_day, within_week, after_week) |
| `screen_viewed` | `screen`: today, trends, health, learn, health/meds, health/meds/new, health/meds/edit, health/program, health/program/session, health/checkups, health/doctor, health/intimate, health/settings |
| `today_cards_shown` (раз в день на карточку) | `cards`: meds_today, visit_soon, insights, week_summary, waist_due, checkup_soon, program, knowledge_of_day; `insights_count`, `away_days` |
| `card_clicked` | `card`, `action`, `week`, `checkup` |

**Онбординг**

| Событие | Поля |
|---|---|
| `onboarding_step_viewed` | `step` (welcome, age, period, concerns, meds, ready), `step_index` |
| `onboarding_step_completed` | `step`, `skipped`, `age_given`, `period_answered`, `concerns_count`*, `concerns`*, `has_meds` |
| `onboarding_done` | `concerns_count`*, `concerns`*, `has_meds`, `age_given`, `consent` (yes, no, skipped) |
| `analytics_consent_changed` | `from`, `to`, `place` (onboarding, settings) |

**Отметки и быстрые действия**

| Событие | Поля |
|---|---|
| `checkin_saved` | `first`, `method` (form, same_as_yesterday), `edit`, `streak_days`, `total_days`, `filled`, `of`, `tags_count` |
| `first_checkin` | |
| `checkin_edit_started` | |
| `quick_log_opened` | `kind` (hot, head, bp, waist), `place` |
| `hotflash_logged` | `place` (today_big_button, quick_row) |
| `breathing_completed` / `breathing_closed_early` | `seconds`, `how` (close, better) |
| `headache_logged` | `level_given` |
| `headache_to_bp_clicked` | |
| `bp_logged` | `pulse_given` |
| `waist_logged`, `waist_sheet_opened` | `place` |

**Лекарства**

| Событие | Поля |
|---|---|
| `med_add_started` | `meds_total` |
| `med_added` / `med_edited` | `schedule`, `times_per_day`, `has_dose`, `has_instructions`, `tracks_stock`, `painkiller`, `meds_total` |
| `med_deleted` | `schedule`, `meds_total` |
| `dose_taken` / `dose_skipped` / `dose_undone` | `schedule`, `doses_today`, `marked_today`, `late_minutes` |
| `meds_all_marked_today` | `doses_today` |
| `calendar_reminder_added` | `kind` (med, program), `schedule`, `times_per_day` |

**Программа, врач, знания, настройки**

| Событие | Поля |
|---|---|
| `program_started` | `program`* |
| `program_session_clicked` / `program_session_opened` | `week`, `n`, `exercises`, `with_video`, `repeat`, `place` |
| `exercise_checked` | `exercise`, `week`, `has_video` |
| `exercise_video_played` | `exercise`, `week` (для YouTube/Vimeo считается первое нажатие на плеер) |
| `program_session_done` | `week`, `n`, `checked`, `of`, `sessions_done`, `repeat` |
| `trends_viewed` | `days_logged_14`, `insights_count`, `has_bp`, `has_adherence` |
| `doctor_card_opened` | `has_visit_date`, `symptoms_rows`, `has_meds`, `has_bp`, `questions` |
| `doctor_card_shared` | `via` (share_sheet, copy, share_fallback, print) |
| `doctor_card_share_cancelled` | |
| `visit_date_set` | `cleared`, `days_until` |
| `checkup_date_set` | `checkup`, `cleared` |
| `intimate_opened` | |
| `article_link_clicked` | `place` (knowledge_of_day, learn, intimate), `topic`* |
| `feedback_clicked` | `place` |
| `concerns_changed` | `concern`*, `on`, `concerns`* |
| `lang_changed` | `to`, `place` |
| `data_exported`, `data_imported`, `data_wiped` | |

\* только в режиме full.

**Свойства пользователя:** `lang`, `in_telegram`, `analytics_mode`; в режиме full ещё `install_date`, `install_week`, `concerns`, `has_meds`, `program_started`.

## Что собрать в Amplitude в первую неделю

1. **Воронка спроса** (Funnel, по людям): `page_viewed` (page_type = home) → `cta_clicked` → `app_first_open` → `onboarding_done` → `first_checkin`. Разбивка по `utm_source` и `lang`.
2. **Email-воронка:** `section_viewed` (hero) → `waitlist_form_started` → `waitlist_form_succeeded`. Разбивка по `place`.
3. **Где отваливаются в онбординге:** Funnel по `onboarding_step_completed` с фильтром `step`. Отдельно доля `consent = yes` в `onboarding_done`.
4. **Удержание D1/D7/D30 по людям** (Retention): старт `onboarding_done`, возврат `app_open`. Работает только для режима full.
5. **Удержание для всех** (Segmentation): `app_open`, группировка по `days_since_install`, показатель Uniques. Считайте D7 как `app_open` с `days_since_install = 7`, делённое на `onboarding_done` за неделю до этого. Работает и в режиме basic.
6. **Что держит:** Retention с разбивкой по первому действию: `hotflash_logged`, `dose_taken`, `program_session_done`, `doctor_card_opened`. Ищем действие, после которого возвращаются чаще.
7. **Блог:** `article_read_depth` (percent = 75) / `page_viewed` (page_type = article) по `article_slug`; `app_link_clicked` с `place = article`.
8. **Скриншоты на лендинге:** `screenshot_viewed` → `cta_clicked` (place = screens). Если галерею досматривают, а кнопку под ней не жмут, дело в тексте, а не в картинках.

## Проверить, что события доходят

Amplitude → Data → Ingestion Debugger (или User Lookup по своему device id). Откройте сайт, прокрутите, нажмите «Попробовать», пройдите онбординг. События появляются в течение минуты.
