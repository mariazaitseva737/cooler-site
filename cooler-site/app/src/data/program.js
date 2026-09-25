// "Bones & strength": 8 weeks, 3 sessions a week, about 15 minutes each.
// Video links for every exercise live in videos.js.
export const EXERCISES = {
  warmup: {
    ru: { name: 'Разминка', how: 'Ходьба на месте, круги плечами, наклоны головы в стороны. Без резких движений.' },
    en: { name: 'Warm-up', how: 'March on the spot, roll your shoulders, tilt your head side to side. No sudden moves.' },
  },
  sitToStand: {
    ru: { name: 'Вставание со стула', how: 'Сядьте на край устойчивого стула. Встаньте, не помогая себе руками, и медленно сядьте обратно.' },
    en: { name: 'Sit-to-stand', how: 'Sit on the edge of a sturdy chair. Stand up without using your hands, then slowly sit back down.' },
  },
  wallPushUp: {
    ru: { name: 'Отжимания от стены', how: 'Ладони на стене на уровне плеч. Сгибайте локти, приближая грудь к стене, и выпрямляйте.' },
    en: { name: 'Wall push-ups', how: 'Hands on the wall at shoulder height. Bend your elbows to bring your chest towards the wall, then push back.' },
  },
  calfRaise: {
    ru: { name: 'Подъёмы на носки', how: 'Держитесь за спинку стула. Поднимитесь на носки и медленно опуститесь.' },
    en: { name: 'Calf raises', how: 'Hold the back of a chair. Rise onto your toes, then lower slowly.' },
  },
  oneLegStand: {
    ru: { name: 'Стойка на одной ноге', how: 'Держитесь за спинку стула. Поднимите одну ногу и постойте. Затем другую.' },
    en: { name: 'Single-leg stand', how: 'Hold the back of a chair. Lift one foot and hold. Then switch legs.' },
  },
  row: {
    ru: { name: 'Тяга к поясу', how: 'Возьмите резинку или две бутылки воды. Тяните локти назад, сводя лопатки, и медленно возвращайте.' },
    en: { name: 'Row', how: 'Use a resistance band or two water bottles. Pull your elbows back, squeezing your shoulder blades, then return slowly.' },
  },
  glueBridge: {
    ru: { name: 'Ягодичный мостик', how: 'Лёжа на спине, колени согнуты. Поднимите таз, задержитесь на секунду, опустите.' },
    en: { name: 'Glute bridge', how: 'Lie on your back, knees bent. Lift your hips, hold for a second, lower down.' },
  },
  heelToToe: {
    ru: { name: 'Ходьба «пятка к носку»', how: 'Вдоль стены, касаясь её рукой. Ставьте пятку одной ноги прямо перед носком другой.' },
    en: { name: 'Heel-to-toe walk', how: 'Along a wall, touching it with one hand. Place the heel of one foot right in front of the other foot’s toes.' },
  },
  stepUp: {
    ru: { name: 'Шаг на ступеньку', how: 'Держитесь за перила. Шагните на нижнюю ступеньку, выпрямитесь, шагните вниз. Затем другой ногой.' },
    en: { name: 'Step-up', how: 'Hold the rail. Step up onto the bottom stair, straighten up, step down. Then lead with the other leg.' },
  },
};

// Reps grow over the weeks: [weeks 1–2, weeks 3–5, weeks 6–8]
const R = (a, b, c) => (week) => (week <= 2 ? a : week <= 5 ? b : c);

const SESSIONS = [
  // Session A
  (w) => [
    { id: 'warmup', dose: { ru: '5 минут', en: '5 minutes' } },
    { id: 'sitToStand', dose: repsRu(2, R(8, 10, 12)(w)) },
    { id: 'wallPushUp', dose: repsRu(2, R(8, 10, 12)(w)) },
    { id: 'oneLegStand', dose: holdRu(2, R(15, 20, 30)(w)) },
    { id: 'glueBridge', dose: repsRu(2, R(8, 10, 12)(w)) },
  ],
  // Session B
  (w) => [
    { id: 'warmup', dose: { ru: '5 минут', en: '5 minutes' } },
    { id: 'calfRaise', dose: repsRu(2, R(10, 12, 15)(w)) },
    { id: 'row', dose: repsRu(2, R(8, 10, 12)(w)) },
    { id: 'heelToToe', dose: { ru: '2 × 10 шагов', en: '2 × 10 steps' } },
    { id: 'sitToStand', dose: repsRu(2, R(8, 10, 12)(w)) },
  ],
  // Session C
  (w) => [
    { id: 'warmup', dose: { ru: '5 минут', en: '5 minutes' } },
    w >= 4 ? { id: 'stepUp', dose: { ru: `2 × ${R(6, 6, 8)(w)} на каждую ногу`, en: `2 × ${R(6, 6, 8)(w)} each leg` } }
           : { id: 'sitToStand', dose: repsRu(2, R(8, 10, 12)(w)) },
    { id: 'wallPushUp', dose: repsRu(2, R(8, 10, 12)(w)) },
    { id: 'row', dose: repsRu(2, R(8, 10, 12)(w)) },
    { id: 'oneLegStand', dose: holdRu(2, R(15, 20, 30)(w)) },
  ],
];

function repsRu(sets, reps) { return { ru: `${sets} × ${reps} раз`, en: `${sets} × ${reps} reps` }; }
function holdRu(sets, sec) { return { ru: `${sets} × ${sec} сек на каждую ногу`, en: `${sets} × ${sec} sec each leg` }; }

export const PROGRAM = {
  id: 'bones',
  weeks: 8,
  perWeek: 3,
  ru: {
    title: 'Кости и сила',
    about: '8 недель, 3 занятия в неделю по 15 минут. Укрепляет мышцы и кости и тренирует равновесие, чтобы реже падать.',
    safety: 'Если у вас остеопороз или были переломы, сначала покажите программу врачу или реабилитологу. Не делайте скручиваний и наклонов вперёд с весом. Боль — сигнал остановиться.',
    phases: ['Знакомство', 'Больше повторов', 'Добавляем нагрузку'],
  },
  en: {
    title: 'Bones & strength',
    about: '8 weeks, 3 sessions a week, 15 minutes each. Builds muscle and bone and trains your balance so you fall less.',
    safety: 'If you have osteoporosis or have had fractures, show this program to your doctor or a physical therapist first. Avoid twisting and bending forward with weight. Pain means stop.',
    phases: ['Getting started', 'More reps', 'A bit more load'],
  },
  session(week, n) {
    return SESSIONS[n - 1](week);
  },
};

export const sessionKey = (week, n) => `w${week}s${n}`;

// Where she is: the first session not done yet.
export function nextSession(done = []) {
  for (let w = 1; w <= PROGRAM.weeks; w++) {
    for (let s = 1; s <= PROGRAM.perWeek; s++) {
      if (!done.includes(sessionKey(w, s))) return { week: w, n: s };
    }
  }
  return null;
}

export const phaseIndex = (week) => (week <= 2 ? 0 : week <= 5 ? 1 : 2);
