import type { Problem, TopicId } from '@/types'
import { clampDifficulty, makeChoices, maxByDifficulty, pick, rand, shuffle, uniqueChoices } from './helpers'

type ProblemSeed = Omit<Problem, 'id'>
type Generator = (difficulty: number) => ProblemSeed

const COUNT_EMOJI = ['🍎', '⭐', '🐟', '🌸', '🎈', '🍀', '🚗', '🐱', '🦄', '🍓'] as const
const SHAPES_ALL: [string, number][] = [
  ['triangle', 3],
  ['square', 4],
  ['rectangle', 4],
  ['pentagon', 5],
  ['hexagon', 6],
  ['heptagon', 7],
  ['octagon', 8],
]
const NAMES = ['Mia', 'Leo', 'Ava', 'Sam', 'Zoe', 'Max', 'Ivy', 'Eli', 'Nina', 'Theo']
const THINGS = ['apples', 'stickers', 'marbles', 'cookies', 'crayons', 'coins', 'shells']

const counting: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const n = rand(2, Math.min(20, 3 + d * 2))
  const emoji = pick(COUNT_EMOJI)
  return {
    topic: 'counting',
    prompt: `How many do you see?\n${emoji.repeat(n)}`,
    answer: n,
    choices: makeChoices(n, { min: 1, spread: 3 }),
    inputType: 'choice',
    difficulty: d,
    operands: [n],
    hint: 'Touch each one as you count: 1, 2, 3…',
  }
}

const compare: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const hi = maxByDifficulty(d)
  const a = rand(1, hi)
  const b = rand(1, hi)
  const answer = a > b ? '>' : a < b ? '<' : '='
  return {
    topic: 'compare',
    prompt: `${a}  ⬚  ${b}\nWhich sign belongs in the box?`,
    answer,
    choices: ['<', '=', '>'],
    inputType: 'choice',
    difficulty: d,
    operands: [a, b],
    hint: 'The open mouth always points to the bigger number.',
  }
}

const shapes: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const pool = SHAPES_ALL.slice(0, Math.min(SHAPES_ALL.length, 3 + d))
  const [name, sides] = pick(pool)
  return {
    topic: 'shapes',
    prompt: `How many sides does a ${name} have?`,
    answer: sides,
    choices: makeChoices(sides, { min: 0, spread: 3 }),
    inputType: 'choice',
    difficulty: d,
    hint: 'Picture the shape and count its straight edges.',
  }
}

const addition: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const max = maxByDifficulty(d)
  const a = rand(1, max)
  const b = rand(1, max)
  const answer = a + b
  const inputType = d <= 2 ? 'choice' : 'number'
  return {
    topic: 'addition',
    prompt: `${a} + ${b} = ?`,
    answer,
    choices: inputType === 'choice' ? makeChoices(answer, { min: 0 }) : undefined,
    inputType,
    difficulty: d,
    operands: [a, b],
    operator: '+',
    hint: `Start at ${a} and count up ${b} more.`,
  }
}

const subtraction: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const max = maxByDifficulty(d)
  let a = rand(1, max)
  let b = rand(1, max)
  if (b > a) [a, b] = [b, a]
  const answer = a - b
  const inputType = d <= 2 ? 'choice' : 'number'
  return {
    topic: 'subtraction',
    prompt: `${a} − ${b} = ?`,
    answer,
    choices: inputType === 'choice' ? makeChoices(answer, { min: 0 }) : undefined,
    inputType,
    difficulty: d,
    operands: [a, b],
    operator: '-',
    hint: `Start at ${a} and count back ${b}.`,
  }
}

const PLACE_NAMES = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands']
const PLACE_DIGITS = [2, 2, 3, 3, 4, 4, 5]

const placeValue: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const digits = PLACE_DIGITS[d - 1]
  const num = rand(10 ** (digits - 1), 10 ** digits - 1)
  const s = String(num)
  const pos = rand(0, s.length - 1)
  const digit = Number(s[pos])
  const place = 10 ** (s.length - 1 - pos)
  const placeName = PLACE_NAMES[s.length - 1 - pos]
  const answer = digit * place
  return {
    topic: 'place-value',
    prompt: `In ${num}, what is the value of the digit in the ${placeName} place?`,
    answer,
    choices: uniqueChoices(answer, [digit, answer + place, Math.max(0, answer - place), answer * 10]),
    inputType: 'choice',
    difficulty: d,
    operands: [num, digit, place],
    hint: `The ${placeName} place is worth ${place === 1 ? '1' : place} each.`,
  }
}

const wordProblems: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const name = pick(NAMES)
  const thing = pick(THINGS)
  const max = maxByDifficulty(d)
  const add = Math.random() < 0.5
  let a = rand(2, max)
  let b = rand(1, max)
  if (!add && b > a) [a, b] = [b, a]
  const answer = add ? a + b : a - b
  const prompt = add
    ? `${name} has ${a} ${thing} and gets ${b} more.\nHow many ${thing} now?`
    : `${name} has ${a} ${thing} and gives away ${b}.\nHow many ${thing} are left?`
  const inputType = d <= 2 ? 'choice' : 'number'
  return {
    topic: 'word-problems',
    prompt,
    answer,
    choices: inputType === 'choice' ? makeChoices(answer, { min: 0 }) : undefined,
    inputType,
    difficulty: d,
    operands: [a, b],
    operator: add ? '+' : '-',
    hint: `Pull out the two numbers: ${a} and ${b}.`,
  }
}

const multiplication: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const hi = Math.min(12, 4 + d)
  const a = rand(2, hi)
  const b = rand(2, hi)
  const answer = a * b
  const inputType = d <= 3 ? 'choice' : 'number'
  return {
    topic: 'multiplication',
    prompt: `${a} × ${b} = ?`,
    answer,
    choices: inputType === 'choice' ? makeChoices(answer, { min: 0, spread: Math.max(4, a) }) : undefined,
    inputType,
    difficulty: d,
    operands: [a, b],
    operator: '×',
    hint: `That is ${a} groups of ${b}.`,
  }
}

const division: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const hi = Math.min(12, 4 + d)
  const b = rand(2, hi)
  const q = rand(2, hi)
  const a = b * q
  const inputType = d <= 3 ? 'choice' : 'number'
  return {
    topic: 'division',
    prompt: `${a} ÷ ${b} = ?`,
    answer: q,
    choices: inputType === 'choice' ? makeChoices(q, { min: 0 }) : undefined,
    inputType,
    difficulty: d,
    operands: [a, b, q],
    operator: '÷',
    hint: `How many groups of ${b} fit inside ${a}?`,
  }
}

const money: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const price = rand(2, 2 + d * 2) * 5
  const paid = price + rand(1, 5 + d * 3)
  const change = paid - price
  return {
    topic: 'money',
    prompt: `A toy costs ${price}¢. You pay ${paid}¢.\nHow much change do you get?`,
    answer: change,
    choices: makeChoices(change, { min: 0 }),
    inputType: 'choice',
    difficulty: d,
    operands: [paid, price],
    operator: '-',
    hint: 'Change = what you paid − the cost.',
  }
}

const time: Generator = (raw) => {
  const d = clampDifficulty(raw)
  if (Math.random() < 0.5) {
    const h = rand(1, Math.min(8, 1 + d))
    return {
      topic: 'time',
      prompt: `How many minutes are in ${h} hour${h > 1 ? 's' : ''}?`,
      answer: h * 60,
      choices: makeChoices(h * 60, { min: 0, spread: 30 }),
      inputType: 'choice',
      difficulty: d,
      operands: [h],
      hint: '1 hour = 60 minutes.',
    }
  }
  const start = rand(1, 11)
  const add = rand(1, Math.min(6, 1 + d))
  const end = start + add
  return {
    topic: 'time',
    prompt: `It is ${start}:00. What time will it be in ${add} hour${add > 1 ? 's' : ''}?`,
    answer: `${end}:00`,
    choices: uniqueChoices(`${end}:00`, [`${start}:00`, `${end + 1}:00`, `${Math.max(1, end - 1)}:00`]),
    inputType: 'choice',
    difficulty: d,
    hint: `Count forward ${add} hour${add > 1 ? 's' : ''} from ${start}.`,
  }
}

const fractions: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const denomPool = d <= 2 ? [2, 3, 4] : d <= 4 ? [2, 3, 4, 5, 6] : [2, 3, 4, 5, 6, 8, 10]
  const denom = pick(denomPool)
  const whole = denom * rand(2, 2 + d)
  const answer = whole / denom
  return {
    topic: 'fractions',
    prompt: `What is 1/${denom} of ${whole}?`,
    answer,
    choices: makeChoices(answer, { min: 0 }),
    inputType: 'choice',
    difficulty: d,
    operands: [whole, denom],
    hint: `Split ${whole} into ${denom} equal groups, then take one group.`,
  }
}

const rounding: Generator = (raw) => {
  const d = clampDifficulty(raw)
  let base: number
  let num: number
  let name: string
  if (d <= 2) {
    base = 10
    num = rand(11, 99)
    name = 'ten'
  } else if (d <= 4) {
    base = 100
    num = rand(101, 999)
    name = 'hundred'
  } else {
    base = 1000
    num = rand(1001, 9999)
    name = 'thousand'
  }
  const answer = Math.round(num / base) * base
  return {
    topic: 'rounding',
    prompt: `Round ${num} to the nearest ${name}.`,
    answer,
    choices: uniqueChoices(answer, [answer - base, answer + base, answer + 2 * base].filter((n) => n >= 0)),
    inputType: 'choice',
    difficulty: d,
    operands: [num, base],
    hint: `Look at the next digit down — 5 or more rounds up.`,
  }
}

const areaPerimeter: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const hi = 3 + d * 2
  const l = rand(2, hi)
  const w = rand(2, hi)
  const area = Math.random() < 0.5
  const answer = area ? l * w : 2 * (l + w)
  return {
    topic: 'area-perimeter',
    prompt: `A rectangle is ${l} by ${w}.\nWhat is its ${area ? 'area' : 'perimeter'}?`,
    answer,
    choices: makeChoices(answer, { min: 0 }),
    inputType: 'choice',
    difficulty: d,
    operands: [l, w],
    hint: area ? 'Area = length × width.' : 'Perimeter = add up all four sides.',
  }
}

const multiDigitMult: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const a = rand(11, 11 + d * 12)
  const b = d >= 5 ? rand(11, 11 + d * 3) : rand(2, 9)
  return {
    topic: 'multi-digit-mult',
    prompt: `${a} × ${b} = ?`,
    answer: a * b,
    inputType: 'number',
    difficulty: d,
    operands: [a, b],
    operator: '×',
    hint: `Break ${a} into tens and ones, multiply each by ${b}, then add.`,
  }
}

const longDivision: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const b = d >= 5 ? rand(11, 25) : rand(2, 9)
  const q = rand(11, 11 + d * 10)
  const a = b * q
  return {
    topic: 'long-division',
    prompt: `${a} ÷ ${b} = ?`,
    answer: q,
    inputType: 'number',
    difficulty: d,
    operands: [a, b, q],
    operator: '÷',
    hint: `How many ${b}s are in ${a}? Work one digit at a time.`,
  }
}

const fractionAdd: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const denomPool = d <= 3 ? [4, 5, 6] : [4, 5, 6, 8, 10, 12]
  const denom = pick(denomPool)
  const a = rand(1, denom - 2)
  const b = rand(1, denom - 1 - a)
  const answer = a + b
  return {
    topic: 'fraction-add',
    prompt: `${a}/${denom} + ${b}/${denom} = ▢/${denom}\nWhat is the top number?`,
    answer,
    choices: makeChoices(answer, { min: 1, spread: 3 }),
    inputType: 'choice',
    difficulty: d,
    operands: [a, b, denom],
    operator: '+',
    hint: 'Same bottom number, so just add the tops together.',
  }
}

const decimals: Generator = (raw) => {
  const d = clampDifficulty(raw)
  if (d <= 3) {
    const a = rand(1, 9) / 10
    const b = rand(1, 9) / 10
    const answer = Math.round((a + b) * 10) / 10
    return {
      topic: 'decimals',
      prompt: `${a.toFixed(1)} + ${b.toFixed(1)} = ?`,
      answer,
      inputType: 'number',
      difficulty: d,
      operands: [a, b],
      operator: '+',
      hint: 'Add the tenths. 10 tenths make 1 whole.',
    }
  }
  const a = rand(5, 99) / 100
  const b = rand(5, 99) / 100
  const answer = Math.round((a + b) * 100) / 100
  return {
    topic: 'decimals',
    prompt: `${a.toFixed(2)} + ${b.toFixed(2)} = ?`,
    answer,
    inputType: 'number',
    difficulty: d,
    operands: [a, b],
    operator: '+',
    hint: 'Line up the decimal points and add the hundredths.',
  }
}

const FACTOR_TARGETS = [
  [12, 16, 18],
  [12, 16, 18, 20],
  [12, 16, 18, 20, 24],
  [18, 20, 24, 30, 36],
  [24, 30, 36, 40, 48],
  [36, 40, 48, 60, 72],
  [48, 60, 72, 84, 96],
]

const factors: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const target = pick(FACTOR_TARGETS[d - 1])
  const fac: number[] = []
  const non: number[] = []
  for (let i = 2; i < target; i++) (target % i === 0 ? fac : non).push(i)
  const answer = pick(fac)
  return {
    topic: 'factors',
    prompt: `Which number is a factor of ${target}?`,
    answer,
    choices: uniqueChoices(answer, shuffle(non).slice(0, 3)),
    inputType: 'choice',
    difficulty: d,
    operands: [target],
    hint: `A factor divides ${target} evenly, with nothing left over.`,
  }
}

const decimalOps: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const op = pick(['+', '-'] as const)
  const places = d >= 5 ? 100 : 10
  let a = rand(5, 3 * places) / places
  let b = rand(1, 2 * places) / places
  if (op === '-' && b > a) [a, b] = [b, a]
  const answer = Math.round((op === '+' ? a + b : a - b) * places) / places
  const dp = places === 100 ? 2 : 1
  return {
    topic: 'decimal-ops',
    prompt: `${a.toFixed(dp)} ${op === '+' ? '+' : '−'} ${b.toFixed(dp)} = ?`,
    answer,
    inputType: 'number',
    difficulty: d,
    operands: [a, b],
    operator: op,
    hint: 'Keep the decimal points lined up, then add or subtract.',
  }
}

const fractionMult: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const denomPool = d <= 3 ? [2, 3, 4] : [2, 3, 4, 5, 6]
  const denom = pick(denomPool)
  const num = rand(1, denom - 1)
  const whole = denom * rand(2, 2 + d)
  const answer = (whole / denom) * num
  return {
    topic: 'fraction-mult',
    prompt: `${num}/${denom} × ${whole} = ?`,
    answer,
    choices: makeChoices(answer, { min: 0 }),
    inputType: 'choice',
    difficulty: d,
    operands: [whole, num, denom],
    hint: `Find 1/${denom} of ${whole} first, then take ${num} of those.`,
  }
}

const orderOfOps: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const hi = 4 + d
  const a = rand(2, hi)
  const b = rand(2, hi)
  const c = rand(2, hi)
  const form = pick(['a+bc', 'ab+c', 'ab-c'] as const)
  let answer: number
  let prompt: string
  if (form === 'a+bc') {
    answer = a + b * c
    prompt = `${a} + ${b} × ${c} = ?`
  } else if (form === 'ab+c') {
    answer = a * b + c
    prompt = `${a} × ${b} + ${c} = ?`
  } else {
    answer = a * b - c
    prompt = `${a} × ${b} − ${c} = ?`
  }
  return {
    topic: 'order-of-operations',
    prompt,
    answer,
    choices: makeChoices(answer, { min: 0 }),
    inputType: 'choice',
    difficulty: d,
    hint: 'Do × and ÷ before + and −.',
  }
}

const volume: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const hi = 2 + d
  const a = rand(2, hi)
  const b = rand(2, hi)
  const c = rand(2, hi)
  return {
    topic: 'volume',
    prompt: `A box is ${a} × ${b} × ${c}.\nWhat is its volume?`,
    answer: a * b * c,
    choices: makeChoices(a * b * c, { min: 0 }),
    inputType: 'choice',
    difficulty: d,
    operands: [a, b, c],
    hint: 'Volume = length × width × height.',
  }
}

const coordinates: Generator = (raw) => {
  const d = clampDifficulty(raw)
  const hi = 4 + d * 2
  const x = rand(0, hi)
  const y = rand(0, hi)
  const ask = pick(['x', 'y'] as const)
  const answer = ask === 'x' ? x : y
  return {
    topic: 'coordinates',
    prompt: `What is the ${ask}-coordinate of the point (${x}, ${y})?`,
    answer,
    choices: makeChoices(answer, { min: 0, spread: 4 }),
    inputType: 'choice',
    difficulty: d,
    operands: [x, y],
    hint: ask === 'x' ? 'The x-coordinate is the first number (across).' : 'The y-coordinate is the second number (up).',
  }
}

export const generators: Record<TopicId, Generator> = {
  counting,
  compare,
  shapes,
  addition,
  subtraction,
  'place-value': placeValue,
  'word-problems': wordProblems,
  multiplication,
  division,
  money,
  time,
  fractions,
  rounding,
  'area-perimeter': areaPerimeter,
  'multi-digit-mult': multiDigitMult,
  'long-division': longDivision,
  'fraction-add': fractionAdd,
  decimals,
  factors,
  'decimal-ops': decimalOps,
  'fraction-mult': fractionMult,
  'order-of-operations': orderOfOps,
  volume,
  coordinates,
}
