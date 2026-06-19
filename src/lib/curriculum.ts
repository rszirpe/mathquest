import type { GradeLevel, SubLevel, TopicId } from '@/types'

export interface Lesson {
  id: string
  topic: TopicId
  title: string
  /** Short, kid-friendly explanation shown on the Summer Break teach card. */
  teach: string
}

export interface GradeCurriculum {
  grade: GradeLevel
  label: string
  emoji: string
  baseDifficulty: number
  lessons: Lesson[]
}

export const GRADES: GradeLevel[] = ['K', '1', '2', '3', '4', '5']

const CURRICULA: Record<GradeLevel, GradeCurriculum> = {
  K: {
    grade: 'K',
    label: 'Kindergarten',
    emoji: '🐣',
    baseDifficulty: 1,
    lessons: [
      { id: 'K-counting', topic: 'counting', title: 'Counting', teach: 'Counting means saying numbers in order — 1, 2, 3 — as you point to each thing one time.' },
      { id: 'K-compare', topic: 'compare', title: 'More or Less', teach: 'When we compare, we find which number is bigger. The < and > signs are little mouths that always open toward the bigger number.' },
      { id: 'K-addition', topic: 'addition', title: 'Adding Up', teach: 'Adding means putting groups together to find how many there are in all.' },
      { id: 'K-subtraction', topic: 'subtraction', title: 'Taking Away', teach: 'Subtracting means taking some away and counting how many are left.' },
      { id: 'K-shapes', topic: 'shapes', title: 'Shapes', teach: 'Flat shapes are made of straight sides. A triangle has 3, a square has 4. Count the edges!' },
    ],
  },
  '1': {
    grade: '1',
    label: 'Grade 1',
    emoji: '🦋',
    baseDifficulty: 2,
    lessons: [
      { id: '1-addition', topic: 'addition', title: 'Add within 20', teach: 'To add bigger numbers, start at the first number and count up by the second.' },
      { id: '1-subtraction', topic: 'subtraction', title: 'Subtract within 20', teach: 'To subtract, start at the bigger number and count backwards.' },
      { id: '1-place-value', topic: 'place-value', title: 'Tens and Ones', teach: 'A two-digit number is made of tens and ones. In 34, the 3 means 3 tens (30) and the 4 means 4 ones.' },
      { id: '1-word-problems', topic: 'word-problems', title: 'Math Stories', teach: 'Story problems hide numbers inside words. Find the numbers and decide whether to add or take away.' },
      { id: '1-compare', topic: 'compare', title: 'Compare Numbers', teach: 'Bigger numbers are further along when you count. Use <, =, or > to compare two numbers.' },
    ],
  },
  '2': {
    grade: '2',
    label: 'Grade 2',
    emoji: '🐢',
    baseDifficulty: 3,
    lessons: [
      { id: '2-addition', topic: 'addition', title: 'Add within 100', teach: 'Add the ones first, then the tens. If the ones make 10 or more, carry a ten over.' },
      { id: '2-subtraction', topic: 'subtraction', title: 'Subtract within 100', teach: 'Subtract the ones, then the tens. Sometimes you borrow a ten to help the ones.' },
      { id: '2-multiplication', topic: 'multiplication', title: 'Equal Groups', teach: 'Multiplying is a fast way to add equal groups. 3 × 4 means 3 groups of 4.' },
      { id: '2-money', topic: 'money', title: 'Money', teach: 'Coins have different values. Add up what you have, and subtract to find change.' },
      { id: '2-time', topic: 'time', title: 'Telling Time', teach: 'There are 60 minutes in an hour. The clock counts hours and minutes as time passes.' },
    ],
  },
  '3': {
    grade: '3',
    label: 'Grade 3',
    emoji: '🦊',
    baseDifficulty: 3,
    lessons: [
      { id: '3-multiplication', topic: 'multiplication', title: 'Times Tables', teach: 'Multiplication facts come from equal groups. Picture the numbers as rows and columns of dots.' },
      { id: '3-division', topic: 'division', title: 'Division Facts', teach: 'Dividing means sharing into equal groups. 12 ÷ 3 asks how many groups of 3 fit in 12.' },
      { id: '3-fractions', topic: 'fractions', title: 'Intro to Fractions', teach: 'A fraction is part of a whole. 1/4 means one piece when something is split into 4 equal parts.' },
      { id: '3-rounding', topic: 'rounding', title: 'Rounding', teach: 'Rounding makes numbers simpler. Look at the next digit: 5 or more rounds up, less rounds down.' },
      { id: '3-area-perimeter', topic: 'area-perimeter', title: 'Area & Perimeter', teach: 'Perimeter is the distance around a shape. Area is the space inside — length times width.' },
    ],
  },
  '4': {
    grade: '4',
    label: 'Grade 4',
    emoji: '🦉',
    baseDifficulty: 4,
    lessons: [
      { id: '4-multi-digit-mult', topic: 'multi-digit-mult', title: 'Big Multiplication', teach: 'To multiply bigger numbers, break them into tens and ones, multiply each part, then add.' },
      { id: '4-long-division', topic: 'long-division', title: 'Long Division', teach: 'Long division shares a big number step by step, one digit at a time.' },
      { id: '4-fraction-add', topic: 'fraction-add', title: 'Adding Fractions', teach: 'When fractions have the same bottom number, just add the top numbers and keep the bottom.' },
      { id: '4-decimals', topic: 'decimals', title: 'Intro to Decimals', teach: 'Decimals show parts of a whole using a point. 0.5 is the same as one half.' },
      { id: '4-factors', topic: 'factors', title: 'Factors', teach: 'A factor is a number that divides evenly into another. 3 is a factor of 12 because 3 × 4 = 12.' },
    ],
  },
  '5': {
    grade: '5',
    label: 'Grade 5',
    emoji: '🚀',
    baseDifficulty: 5,
    lessons: [
      { id: '5-decimal-ops', topic: 'decimal-ops', title: 'Decimal Math', teach: 'Add and subtract decimals by lining up the decimal points so each place matches.' },
      { id: '5-fraction-mult', topic: 'fraction-mult', title: 'Multiplying Fractions', teach: 'A fraction of a number is a multiply. 2/3 × 9 means take 2 of the 3 equal parts of 9.' },
      { id: '5-order-of-operations', topic: 'order-of-operations', title: 'Order of Operations', teach: 'Math has rules of order: do multiplication and division before addition and subtraction.' },
      { id: '5-volume', topic: 'volume', title: 'Volume', teach: 'Volume is the space inside a box: length × width × height.' },
      { id: '5-coordinates', topic: 'coordinates', title: 'Coordinate Plane', teach: 'A point is found with two numbers (x, y): first go across, then go up.' },
    ],
  },
}

export function getCurriculum(grade: GradeLevel): GradeCurriculum {
  return CURRICULA[grade]
}

export function topicsForGrade(grade: GradeLevel): { id: TopicId; title: string }[] {
  const seen = new Set<TopicId>()
  const out: { id: TopicId; title: string }[] = []
  for (const lesson of CURRICULA[grade].lessons) {
    if (seen.has(lesson.topic)) continue
    seen.add(lesson.topic)
    out.push({ id: lesson.topic, title: lesson.title })
  }
  return out
}

export function difficultyForGrade(grade: GradeLevel): number {
  return CURRICULA[grade].baseDifficulty
}

const TOPIC_TITLES: Record<TopicId, string> = {
  counting: 'Counting',
  compare: 'Comparing',
  shapes: 'Shapes',
  addition: 'Addition',
  subtraction: 'Subtraction',
  'place-value': 'Place Value',
  'word-problems': 'Word Problems',
  multiplication: 'Multiplication',
  division: 'Division',
  money: 'Money',
  time: 'Time',
  fractions: 'Fractions',
  rounding: 'Rounding',
  'area-perimeter': 'Area & Perimeter',
  'multi-digit-mult': 'Big Multiplication',
  'long-division': 'Long Division',
  'fraction-add': 'Adding Fractions',
  decimals: 'Decimals',
  factors: 'Factors',
  'decimal-ops': 'Decimal Math',
  'fraction-mult': 'Multiplying Fractions',
  'order-of-operations': 'Order of Operations',
  volume: 'Volume',
  coordinates: 'Coordinates',
}

export function topicTitle(topic: TopicId): string {
  return TOPIC_TITLES[topic] ?? topic
}

export interface AdventureNode {
  id: string
  index: number
  topic: TopicId
  title: string
  difficulty: number
}

/** Build the Adventure level path for a grade: each lesson topic becomes a level, scaling difficulty. */
export function adventureNodes(grade: GradeLevel): AdventureNode[] {
  const cur = CURRICULA[grade]
  return cur.lessons.map((lesson, i) => ({
    id: `${grade}-adv-${i}`,
    index: i,
    topic: lesson.topic,
    title: lesson.title,
    difficulty: Math.min(5, cur.baseDifficulty + Math.floor(i / 2)),
  }))
}

// ---- "Levels within levels": each topic = a world of 7 sub-levels ----

export const SUB_LEVELS_PER_TOPIC = 7

/** 7 sub-levels for a topic: 6 gradual steps (difficulty ramps 1→5) + a final Review. */
export function subLevelsForTopic(grade: GradeLevel, topic: TopicId): SubLevel[] {
  const out: SubLevel[] = []
  for (let i = 0; i < SUB_LEVELS_PER_TOPIC; i++) {
    const isReview = i === SUB_LEVELS_PER_TOPIC - 1
    // Steps 1–6 get distinct, increasing difficulties; Review mixes them all.
    const difficulty = isReview ? 6 : i + 1
    out.push({
      id: `${grade}-${topic}-${i}`,
      topic,
      index: i,
      title: isReview ? 'Review' : `Step ${i + 1}`,
      isReview,
      difficulty,
    })
  }
  return out
}

export interface World {
  topic: TopicId
  title: string
  emoji: string
  subLevels: SubLevel[]
}

const WORLD_EMOJI: Partial<Record<TopicId, string>> = {
  counting: '🔢',
  compare: '⚖️',
  shapes: '🔺',
  addition: '➕',
  subtraction: '➖',
  'place-value': '🏠',
  'word-problems': '📖',
  multiplication: '✖️',
  division: '➗',
  money: '💰',
  time: '⏰',
  fractions: '🍕',
  rounding: '🎯',
  'area-perimeter': '📐',
  'multi-digit-mult': '✖️',
  'long-division': '➗',
  'fraction-add': '🍕',
  decimals: '💲',
  factors: '🧩',
  'decimal-ops': '💲',
  'fraction-mult': '🍕',
  'order-of-operations': '🧮',
  volume: '📦',
  coordinates: '🗺️',
}

/** The topic "worlds" for a grade, each containing 7 sub-levels. */
export function worldsForGrade(grade: GradeLevel): World[] {
  return topicsForGrade(grade).map((t) => ({
    topic: t.id,
    title: t.title,
    emoji: WORLD_EMOJI[t.id] ?? '⭐',
    subLevels: subLevelsForTopic(grade, t.id),
  }))
}
