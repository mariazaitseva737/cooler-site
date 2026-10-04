// "Important day": she adds a flight, a doctor's visit, a big meeting or a celebration,
// and from two days before Today shows how to prepare, based on what bothers her.
// No calendar access: she adds the day by hand. Everything stays on the phone.

export const DAY_TYPES = [
  { id: 'doctor', ru: 'Приём у врача', en: 'Doctor’s appointment' },
  { id: 'travel', ru: 'Поездка или перелёт', en: 'Trip or flight' },
  { id: 'talk', ru: 'Важная встреча или выступление', en: 'Big meeting or talk' },
  { id: 'party', ru: 'Праздник, свадьба, семейное событие', en: 'Celebration or family event' },
];

// General tips first, then tips for what bothers her (profile concerns). Today shows up to 4.
export const DAY_TIPS = {
  doctor: {
    all: [
      { ru: 'Откройте сводку для врача и допишите 1–2 самых важных вопроса.', en: 'Open your doctor summary and add the one or two questions that matter most.' },
      { ru: 'Запишите все лекарства и добавки с дозами, даже витамины.', en: 'Write down every medicine and supplement with doses, vitamins too.' },
      { ru: 'Перед уходом спросите: какое обследование следующее и когда.', en: 'Before you leave, ask: what’s the next check, and when?' },
    ],
    hot: [{ ru: 'Скажите прямо, как часто приливы и как они мешают. «Терпимо» врачи слышат как «не нужно лечить».', en: 'Say plainly how often hot flashes come and how they get in the way. Doctors hear “I’m coping” as “no treatment needed”.' }],
    sleep: [{ ru: 'Скажите, сколько недель вы плохо спите. Это отдельная жалоба, и её лечат.', en: 'Say how many weeks you’ve been sleeping badly. It’s a complaint of its own, and it can be treated.' }],
    bladder: [{ ru: 'Подтекание при кашле или смехе тоже стоит назвать. Это частая и решаемая проблема.', en: 'Mention leaking when you cough or laugh too. It’s common and it can be fixed.' }],
  },
  travel: {
    all: [
      { ru: 'Возьмите лёгкий слой одежды, который легко снять, и небольшую бутылку воды.', en: 'Pack a light layer you can take off and a small bottle of water.' },
    ],
    hot: [{ ru: 'Выберите место у прохода и положите в сумку маленький веер или влажные салфетки.', en: 'Choose an aisle seat and keep a small fan or cooling wipes in your bag.' }],
    sleep: [{ ru: 'Накануне прохладная спальня и кофе только до обеда. Ночь перед дорогой важнее сборов.', en: 'The night before: a cool bedroom and no coffee after lunch. That night matters more than the packing.' }],
    joints: [{ ru: 'В дороге вставайте раз в час или крутите стопами прямо в кресле.', en: 'On the way, get up once an hour, or circle your ankles in your seat.' }],
    bladder: [{ ru: 'Место у прохода и упражнение для тазового дна: сжать на 5 секунд, отпустить, 10 раз.', en: 'An aisle seat, and a pelvic floor squeeze: hold for 5 seconds, let go, 10 times.' }],
  },
  talk: {
    all: [
      { ru: 'За две минуты до начала подышите: вдох на 4, выдох на 6.', en: 'Two minutes before you start, breathe: in for 4, out for 6.' },
      { ru: 'Слои одежды и вода под рукой.', en: 'Wear layers and keep water within reach.' },
    ],
    fog: [{ ru: 'Запишите 3 главные мысли на карточку. Если слово пропадёт, оно на карточке.', en: 'Write your three main points on a card. If a word disappears, it’s on the card.' }],
    hot: [{ ru: 'Если накатит прилив, сделайте паузу, медленно выдохните, сделайте глоток воды. Почти никто не заметит.', en: 'If a hot flash comes, pause, breathe out slowly, take a sip of water. Almost nobody will notice.' }],
    sleep: [{ ru: 'Накануне ляжте в обычное время, а не раньше: так легче уснуть.', en: 'The night before, go to bed at your usual time, not earlier. It’s easier to fall asleep that way.' }],
    mood: [{ ru: 'Утром 10 минут на улице при дневном свете выравнивают настроение.', en: 'Ten minutes outside in daylight that morning helps steady your mood.' }],
  },
  party: {
    all: [
      { ru: 'Запланируйте себе тихую минуту посреди дня.', en: 'Plan one quiet minute for yourself in the middle of it.' },
    ],
    hot: [{ ru: 'Алкоголь и острое часто усиливают приливы. Решите заранее, что будете пить и есть.', en: 'Alcohol and spicy food often make hot flashes worse. Decide in advance what you’ll have.' }],
    joints: [{ ru: 'Удобные туфли, в которых можно танцевать, и стул, который вы знаете, где найти.', en: 'Comfortable shoes you can dance in, and a chair you know where to find.' }],
    sleep: [{ ru: 'Если праздник вечером, на следующий день встаньте в обычное время.', en: 'If it runs late, get up at your usual time the next day anyway.' }],
    bladder: [{ ru: 'Тёмная одежда и запасная прокладка в сумке снимают половину тревоги.', en: 'Dark clothes and a spare liner in your bag take away half the worry.' }],
  },
};

export function tipsFor(type, concerns = []) {
  const set = DAY_TIPS[type];
  if (!set) return [];
  const extra = concerns.flatMap((c) => set[c] || []);
  return [...set.all, ...extra].slice(0, 4);
}
