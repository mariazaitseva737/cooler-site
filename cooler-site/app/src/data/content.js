// Medical-ish content of the app. Every text exists in Russian and English.
// Keep the tone: calm, adult, no promises to cure. Changes here should be reviewed by a doctor.

// Symptoms the woman can log every day (scale 0..3: none / mild / medium / strong)
export const SYMPTOMS = [
  { id: 'hot', ru: 'Приливы', en: 'Hot flashes' },
  { id: 'sleep', ru: 'Сон', en: 'Sleep', invertLabel: true },
  { id: 'energy', ru: 'Усталость', en: 'Tiredness' },
  { id: 'head', ru: 'Головная боль', en: 'Headache' },
  { id: 'mood', ru: 'Плохое настроение', en: 'Low mood' },
  { id: 'fog', ru: 'Туман в голове', en: 'Brain fog' },
  { id: 'joints', ru: 'Суставы и тело', en: 'Joints and body' },
];

// Sleep is asked as a problem too ("how bad was your sleep"), so 3 = very bad night for every symptom.
export const LEVELS = {
  ru: ['нет', 'немного', 'заметно', 'сильно'],
  en: ['none', 'mild', 'medium', 'strong'],
};
export const SLEEP_LEVELS = {
  ru: ['хорошо', 'так себе', 'плохо', 'очень плохо'],
  en: ['well', 'so-so', 'badly', 'very badly'],
};

// What the woman chooses in onboarding. Symptoms switch on daily logging, modules switch on screens.
export const CONCERNS = [
  { id: 'hot', ru: 'Приливы, ночная потливость', en: 'Hot flashes, night sweats' },
  { id: 'sleep', ru: 'Плохой сон', en: 'Poor sleep' },
  { id: 'energy', ru: 'Усталость, нет сил', en: 'Tiredness, no energy' },
  { id: 'head', ru: 'Головные боли', en: 'Headaches' },
  { id: 'mood', ru: 'Настроение, раздражительность, тревога', en: 'Mood, irritability, anxiety' },
  { id: 'fog', ru: 'Забывчивость, туман в голове', en: 'Forgetfulness, brain fog' },
  { id: 'joints', ru: 'Суставы, скованность', en: 'Joints, stiffness' },
  { id: 'bones', ru: 'Кости, риск переломов', en: 'Bones, risk of fractures' },
  { id: 'weight', ru: 'Жир на животе, вес', en: 'Belly fat, weight' },
  { id: 'heart', ru: 'Давление, сердце', en: 'Blood pressure, heart' },
  { id: 'intimate', ru: 'Интимное здоровье', en: 'Intimate health' },
  { id: 'bladder', ru: 'Подтекание при кашле или смехе', en: 'Leaking when coughing or laughing' },
];
export const SYMPTOM_IDS = SYMPTOMS.map((s) => s.id);

export const TAGS = [
  { id: 'coffee', ru: 'кофе', en: 'coffee' },
  { id: 'alcohol', ru: 'алкоголь', en: 'alcohol' },
  { id: 'spicy', ru: 'острое', en: 'spicy food' },
  { id: 'stress', ru: 'стресс', en: 'stress' },
  { id: 'walk', ru: 'прогулка', en: 'walk' },
  { id: 'strength', ru: 'силовые', en: 'strength training' },
  { id: 'lateMeal', ru: 'поздний ужин', en: 'late dinner' },
];

// One practical tip per symptom, shown for the hardest symptom of the day.
export const TIPS = {
  hot: {
    ru: 'Оденьтесь слоями, чтобы один легко было снять, и держите рядом прохладную воду. Когда накатит, нажмите «Прилив»: на медленном выдохе волну легче переждать.',
    en: 'Wear layers you can peel off and keep cool water close. When it starts, tap “Hot flash”. A slow exhale makes the wave easier to sit through.',
  },
  sleep: {
    ru: 'Завтра встаньте в то же время, что и сегодня, даже после плохой ночи. Вечером прохладная спальня и кофе только до обеда.',
    en: 'Tomorrow, get up at the same time as today, even after a bad night. Tonight: a cool bedroom, and no coffee after lunch.',
  },
  energy: {
    ru: 'Выйдите сегодня на дневной свет хотя бы на 10 минут. Если слабость держится неделями, обсудите с врачом анализы: щитовидная железа, гемоглобин, сахар.',
    en: 'Get at least 10 minutes of daylight today. If the tiredness lasts for weeks, ask your doctor about tests: thyroid, haemoglobin, blood sugar.',
  },
  head: {
    ru: 'Пейте воду, не пропускайте еду и измерьте давление. Отмечайте, в какие дни пьёте обезболивающее: частый приём может сам поддерживать головную боль.',
    en: 'Drink water, don’t skip meals, and check your blood pressure. Note the days you take painkillers: taking them often can keep headaches going.',
  },
  mood: {
    ru: 'Раздражительность сейчас бывает у многих, характер тут ни при чём. Найдите сегодня 10 минут только для себя: прогулка, тишина или звонок подруге.',
    en: 'Lots of women get irritable at this stage. It has nothing to do with your personality. Find 10 minutes for yourself today: a walk, some quiet, or a call with a friend.',
  },
  fog: {
    ru: 'Сегодня делайте дела по одному и записывайте важное. У большинства женщин туман в голове со временем проходит.',
    en: 'Today, do one thing at a time and write down anything important. For most women brain fog eases with time.',
  },
  joints: {
    ru: 'Суставам чаще помогает движение, чем покой. Сделайте сегодня 10 минут мягкой разминки, можно сидя.',
    en: 'Joints usually do better with movement than rest. Try 10 minutes of gentle stretching today, even sitting down.',
  },
  calm: {
    ru: 'Сегодня спокойный день, можно заняться силовыми. Мышцам и костям это полезно.',
    en: 'A calm day. Good time for some strength training, which helps your muscles and bones.',
  },
};

export const RED_FLAGS = {
  ru: [
    'Любое кровотечение из влагалища после менопаузы, даже мажущее, — к врачу в ближайшие дни.',
    'Боль или давление в груди, одышка, холодный пот, боль в челюсти или руке — сразу вызывайте скорую.',
    'Внезапная сильнейшая головная боль, онемение, нарушение речи или зрения — сразу вызывайте скорую.',
    'Давление 180/120 и выше — повторите через 5 минут; если держится, срочно к врачу, а при боли в груди или слабости в руке — скорая.',
    'Подавленность больше двух недель или мысли, что жить не хочется, — скажите врачу или близкому человеку сегодня.',
  ],
  en: [
    'Any vaginal bleeding after menopause, even spotting — see a doctor within the next few days.',
    'Chest pain or pressure, shortness of breath, cold sweat, pain in the jaw or arm — call emergency services right away.',
    'A sudden, very severe headache, numbness, trouble speaking or seeing — call emergency services right away.',
    'Blood pressure of 180/120 or higher — measure again after 5 minutes; if it stays high, get urgent care, and call emergency services if you have chest pain or arm weakness.',
    'Low mood for more than two weeks, or thoughts of not wanting to live — tell a doctor or someone close to you today.',
  ],
};

// Knowledge tab: short answers, each with a link to the full article on the site (if there is one).
export const KNOWLEDGE = [
  {
    id: 'hot', slug: { ru: 'prilivy-skolko-dlyatsya-chto-pomogaet', en: 'hot-flashes-how-long-what-helps' },
    ru: { q: 'Сколько длятся приливы и что помогает?', a: 'В среднем около семи лет, у всех по-разному. Сильнее всего их уменьшает гормональная терапия; решение принимает врач. Без лекарств лучше всего изучены когнитивно-поведенческая терапия и клинический гипноз. Прохлада и медленный выдох помогают пережить момент, но число приливов почти не меняют.' },
    en: { q: 'How long do hot flashes last, and what helps?', a: 'About seven years on average, but it varies. Hormone therapy reduces them the most; your doctor decides if it suits you. Without medication, CBT and clinical hypnosis have the best evidence. Cooling down and slow breathing help you through the moment but barely change how often they come.' },
  },
  {
    id: 'sleep', slug: { ru: 'son-posle-menopauzy', en: 'sleep-after-menopause' },
    ru: { q: 'Почему я просыпаюсь ночью?', a: 'Будят приливы, тревожные мысли, походы в туалет, боль в суставах, иногда апноэ сна. При бессоннице дольше трёх месяцев первым делом рекомендуют КПТ бессонницы: вставать в одно время, ложиться только когда хочется спать, не лежать без сна часами.' },
    en: { q: 'Why do I wake up at night?', a: 'Night sweats, racing thoughts, bathroom trips, joint pain, sometimes sleep apnea. For insomnia lasting over three months, doctors recommend CBT for insomnia first: get up at the same time, go to bed only when sleepy, don’t lie awake for hours.' },
  },
  {
    id: 'head', slug: null,
    ru: { q: 'Почему чаще болит голова?', a: 'Около менопаузы головная боль может усилиться или поменять характер. Проверьте давление: оно часто растёт в эти годы. Если обезболивающие нужны больше 10 дней в месяц, скажите врачу — частый приём сам может поддерживать боль. Новая по характеру головная боль после 50 — повод показаться врачу.' },
    en: { q: 'Why do I get more headaches?', a: 'Around menopause headaches can get worse or change. Check your blood pressure: it often rises in these years. If you need painkillers on more than 10 days a month, tell your doctor — taking them that often can keep headaches going. A new kind of headache after 50 is worth a doctor’s visit.' },
  },
  {
    id: 'bones', slug: { ru: 'kosti-i-silovye-posle-50', en: 'strength-training-bones-after-50' },
    ru: { q: 'Как беречь кости?', a: 'В первые пять лет после менопаузы можно потерять до 10% плотности костей. Кости укрепляют силовые упражнения и нагрузка с весом тела, а также упражнения на равновесие, чтобы не падать. Кальций и витамин D лучше из еды. Денситометрию рекомендуют с 65 лет, при рисках раньше.' },
    en: { q: 'How do I protect my bones?', a: 'Women can lose up to 10% of bone density in the first five years after menopause. Strength training, weight-bearing exercise and balance work help, and so does not falling. Get calcium and vitamin D from food where you can. A bone density scan is recommended from 65, earlier with risk factors.' },
  },
  {
    id: 'heart', slug: { ru: 'serdtse-posle-menopauzy-proverki', en: 'heart-health-after-menopause' },
    ru: { q: 'Что с давлением и сердцем?', a: 'После менопаузы чаще растут давление и «плохой» холестерин, а жир откладывается на животе. Меряйте давление дома, сдавайте холестерин и сахар. Инфаркт у женщин бывает без сильной боли: давление в груди, боль в челюсти или руке, одышка, холодный пот.' },
    en: { q: 'What happens to blood pressure and the heart?', a: 'After menopause blood pressure and “bad” cholesterol often rise, and fat settles around the belly. Check your blood pressure at home and get cholesterol and blood sugar tests. A heart attack in women may come without crushing pain: chest pressure, jaw or arm pain, shortness of breath, cold sweat.' },
  },
  {
    id: 'mood', slug: { ru: 'nastroenie-i-tuman-v-golove', en: 'mood-swings-brain-fog-menopause' },
    ru: { q: 'Раздражительность и туман в голове — это нормально?', a: 'Это частые спутники этих лет. Туман в голове у большинства временный и не означает деменцию. Если плохое настроение держится больше двух недель почти каждый день, это может быть депрессия — она хорошо лечится.' },
    en: { q: 'Are irritability and brain fog normal?', a: 'They are common in these years. For most women brain fog is temporary and not a sign of dementia. If low mood lasts more than two weeks nearly every day, it may be depression, which responds well to treatment.' },
  },
  {
    id: 'hrt', slug: { ru: 'zgt-chto-izvestno-voprosy-vrachu', en: 'hrt-what-to-ask-your-doctor' },
    ru: { q: 'Гормональная терапия: да или нет?', a: 'Для большинства здоровых женщин младше 60 лет или в первые 10 лет после менопаузы польза обычно больше рисков. Но решение индивидуальное: важны ваши болезни и болезни в семье. Даже доброкачественное образование в груди — не всегда запрет, всё зависит от его типа. Обсудите с врачом.' },
    en: { q: 'Hormone therapy: yes or no?', a: 'For most healthy women under 60 or within 10 years of menopause, benefits usually outweigh risks. But it is individual: your own and your family’s health history matter. Even a benign breast lump is not always a ban — it depends on the type. Talk it through with your doctor.' },
  },
  {
    id: 'intimate', slug: { ru: 'sukhost-i-diskomfort-posle-menopauzy', en: 'vaginal-dryness-after-menopause' },
    ru: { q: 'Сухость и боль при сексе', a: 'После менопаузы это бывает у многих. Само обычно не проходит, но хорошо лечится: увлажняющие средства 2–3 раза в неделю, лубрикант во время секса, при необходимости местная терапия от врача. Боль терпеть не нужно.' },
    en: { q: 'Dryness and painful sex', a: 'Many women notice this after menopause. It rarely goes away on its own but treats well: a vaginal moisturizer 2–3 times a week, a lubricant during sex, and local treatment from your doctor if needed. You don’t have to put up with pain.' },
  },
];

// Planned checkups. "every" = suggested interval in months; the woman can change it. Countries differ.
export const CHECKUPS = [
  { id: 'bp', every: 12, ru: 'Давление у врача', en: 'Blood pressure at the doctor’s' },
  { id: 'lipids', every: 12, ru: 'Холестерин (липидный профиль)', en: 'Cholesterol (lipid panel)' },
  { id: 'glucose', every: 12, ru: 'Сахар крови или гликированный гемоглобин', en: 'Blood sugar or HbA1c' },
  { id: 'thyroid', every: 12, ru: 'Щитовидная железа (ТТГ)', en: 'Thyroid (TSH)' },
  { id: 'mammo', every: 24, ru: 'Маммография', en: 'Mammogram' },
  { id: 'dxa', every: 24, ru: 'Денситометрия', en: 'Bone density scan (DXA)' },
  { id: 'cervical', every: 36, ru: 'Скрининг рака шейки матки', en: 'Cervical screening' },
  { id: 'colon', every: 12, ru: 'Скрининг рака кишечника', en: 'Bowel cancer screening' },
  { id: 'eyes', every: 24, ru: 'Окулист', en: 'Eye check' },
  { id: 'dentist', every: 12, ru: 'Стоматолог', en: 'Dentist' },
];

// Questions for the doctor, picked from what the woman marked in onboarding.
export const DOCTOR_QUESTIONS = {
  hot: { ru: 'Приливы мешают мне жить. Какое лечение мне подходит — гормональное или негормональное?', en: 'Hot flashes are affecting my life. Which treatment suits me — hormonal or non-hormonal?' },
  sleep: { ru: 'Я плохо сплю дольше трёх месяцев. Можно ли пройти КПТ бессонницы? Нужно ли проверить апноэ?', en: 'I’ve slept badly for over three months. Can I try CBT for insomnia? Should I be checked for sleep apnea?' },
  energy: { ru: 'Я постоянно устаю. Какие анализы стоит сдать: щитовидная железа, гемоглобин, сахар, витамин D?', en: 'I’m tired all the time. Which tests should I have: thyroid, haemoglobin, blood sugar, vitamin D?' },
  head: { ru: 'Головные боли стали чаще. Нужно ли проверить давление или поменять обезболивающие?', en: 'My headaches are more frequent. Should my blood pressure be checked or my painkillers changed?' },
  mood: { ru: 'Плохое настроение держится долго. Может ли это быть депрессия? Что мне подойдёт?', en: 'My low mood has lasted a while. Could it be depression? What would help me?' },
  fog: { ru: 'Мне стало трудно сосредоточиться и вспоминать слова. Нужно ли что-то проверить?', en: 'I find it harder to focus and find words. Should anything be checked?' },
  joints: { ru: 'Суставы скованные по утрам. Стоит ли обследоваться?', en: 'My joints are stiff in the morning. Should I get them checked?' },
  bones: { ru: 'Какой у меня риск переломов? Нужна ли мне денситометрия?', en: 'What is my fracture risk? Do I need a bone density scan?' },
  weight: { ru: 'Растёт талия. Какие анализы на сердце и сахар мне сдать?', en: 'My waist is getting bigger. Which heart and blood sugar tests should I have?' },
  heart: { ru: 'Какое давление для меня нормальное и как часто его мерить?', en: 'What blood pressure is right for me, and how often should I measure it?' },
  intimate: { ru: 'У меня сухость и дискомфорт. Какие варианты лечения есть?', en: 'I have dryness and discomfort. What are my treatment options?' },
  bladder: { ru: 'Подтекает при кашле или смехе. Поможет ли тренировка тазового дна или физиотерапевт?', en: 'I leak when I cough or laugh. Would pelvic floor training or a physiotherapist help?' },
  hrt: { ru: 'Подходит ли мне гормональная терапия с моей историей болезней?', en: 'Is hormone therapy suitable for me, given my health history?' },
};
