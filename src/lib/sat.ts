import type { AnswerValue, GradeLevel, SatProblem } from '@/types'
import { makeChoices, pick, rand, shuffle, uniqueChoices } from '@/lib/problems/helpers'

type Band = 'younger' | '3' | '4' | '5'
type Template = () => SatProblem

const numQ = (prompt: string, answer: number, opts?: { spread?: number; min?: number }): SatProblem => ({
  prompt,
  answer,
  choices: makeChoices(answer, opts),
})

const strQ = (prompt: string, answer: AnswerValue, distractors: AnswerValue[]): SatProblem => ({
  prompt,
  answer,
  choices: uniqueChoices(answer, distractors),
})

const YOUNGER: Template[] = [
  () => {
    const set = new Set<number>()
    while (set.size < 4) set.add(rand(1, 20))
    const arr = [...set]
    return { prompt: 'Which number is the biggest?', choices: shuffle(arr), answer: Math.max(...arr) }
  },
  () => {
    const a = rand(2, 6)
    const n = rand(3, 4)
    return numQ(`${Array(n).fill(a).join(' + ')} = ?`, a * n)
  },
  () => {
    const x = rand(8, 16)
    const y = rand(2, 6)
    return numQ(`Tom has ${x} apples and eats ${y}. How many are left?`, x - y)
  },
  () => {
    const step = pick([1, 2, 5, 10])
    const start = rand(1, 5) * step
    return numQ(`What comes next: ${start}, ${start + step}, ${start + 2 * step}, ▢ ?`, start + 3 * step, { spread: step + 2 })
  },
  () => {
    const even = rand(1, 10) * 2
    const odds = new Set<number>()
    while (odds.size < 3) odds.add(rand(1, 10) * 2 - 1)
    return { prompt: 'Which of these is an even number?', choices: shuffle([even, ...odds]), answer: even }
  },
]

const GRADE3: Template[] = [
  () => {
    const x = rand(4, 8)
    const y = rand(3, 6)
    return numQ(`A pack has ${x} juice boxes. How many boxes are in ${y} packs?`, x * y)
  },
  () => {
    const x = rand(6, 12)
    const y = rand(3, 5)
    return numQ(`Sara reads ${x} pages each day for ${y} days. How many pages is that?`, x * y)
  },
  () => {
    const per = rand(3, 8)
    const kids = rand(3, 6)
    return numQ(`${per * kids} stickers are shared equally by ${kids} kids. How many does each get?`, per)
  },
  () => {
    const step = pick([2, 3, 5, 10])
    const start = step * rand(1, 4)
    return numQ(`What comes next: ${start}, ${start + step}, ${start + 2 * step}, ▢ ?`, start + 3 * step, { spread: step + 2 })
  },
  () => strQ('Which fraction is the largest?', '1/2', ['1/3', '1/4', '1/5']),
]

const GRADE4: Template[] = [
  () => {
    const n = rand(120, 980)
    const answer = Math.round(n / 100) * 100
    return strQ(`Round ${n} to the nearest hundred.`, answer, [answer - 100, answer + 100, answer + 200].filter((x) => x >= 0))
  },
  () => {
    const n = rand(2, 30) * 2
    return numQ(`What is 1/2 of ${n}?`, n / 2)
  },
  () => {
    const n = rand(2, 12) * 4
    return numQ(`What is 1/4 of ${n}?`, n / 4)
  },
  () => {
    const a = rand(4, 9)
    const b = rand(4, 9)
    return numQ(`A rectangle is ${a} by ${b}. What is its area?`, a * b)
  },
  () => {
    const h = rand(1, 3)
    return numQ(`How many minutes are in ${h} and a half hours?`, h * 60 + 30, { spread: 30 })
  },
  () => {
    const target = pick([24, 36, 48, 60])
    const fac: number[] = []
    const non: number[] = []
    for (let i = 2; i < target; i++) (target % i === 0 ? fac : non).push(i)
    const answer = pick(fac)
    return strQ(`Which number is a factor of ${target}?`, answer, shuffle(non).slice(0, 3))
  },
]

const GRADE5: Template[] = [
  () => {
    const n = rand(2, 10) * 4
    return numQ(`What is 3/4 of ${n}?`, (n / 4) * 3)
  },
  () => {
    const n = rand(2, 8) * 3
    return numQ(`What is 2/3 of ${n}?`, (n / 3) * 2)
  },
  () => {
    const a = rand(2, 6)
    const b = rand(2, 6)
    const c = rand(2, 6)
    return numQ(`A box is ${a} × ${b} × ${c}. What is its volume?`, a * b * c)
  },
  () => {
    const mean = rand(5, 10)
    const o1 = rand(-2, 2)
    const o2 = rand(-2, 2)
    const nums = shuffle([mean + o1, mean + o2, mean - o1 - o2])
    return numQ(`The average of ${nums.join(', ')} is?`, mean, { spread: 3 })
  },
  () => {
    const a = rand(1, 9) / 10
    const b = rand(1, 9) / 10
    const sum = Math.round((a + b) * 10) / 10
    return strQ(`${a.toFixed(1)} + ${b.toFixed(1)} = ?`, sum.toFixed(1), [
      (sum + 0.1).toFixed(1),
      Math.max(0, sum - 0.1).toFixed(1),
      (sum + 0.2).toFixed(1),
    ])
  },
  () => {
    const base = rand(2, 5)
    const exp = pick([2, 3])
    return numQ(`What is ${base}${exp === 2 ? ' squared' : ' cubed'} (${Array(exp).fill(base).join(' × ')})?`, base ** exp)
  },
]

const BANDS: Record<Band, Template[]> = { younger: YOUNGER, '3': GRADE3, '4': GRADE4, '5': GRADE5 }

function bandFor(grade: GradeLevel): Band {
  if (grade === '3') return '3'
  if (grade === '4') return '4'
  if (grade === '5') return '5'
  return 'younger'
}

let lastPrompt = ''

export function satQuestion(grade: GradeLevel): SatProblem {
  const templates = BANDS[bandFor(grade)]
  let q = pick(templates)()
  let guard = 0
  while (q.prompt === lastPrompt && guard++ < 6) q = pick(templates)()
  lastPrompt = q.prompt
  return q
}

/** Grade 3+ must do the SAT challenge; younger grades only if enabled in settings. */
export function satRequired(grade: GradeLevel, satForYoungKids: boolean): boolean {
  return grade === '3' || grade === '4' || grade === '5' || satForYoungKids
}
