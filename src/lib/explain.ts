import type { Problem } from '@/types'

export type Visual =
  | { kind: 'array'; rows: number; cols: number }
  | { kind: 'groups'; groups: number; per: number; share?: boolean }
  | { kind: 'numberline'; start: number; jump: number; max: number; op: '+' | '-' }
  | { kind: 'fractionbar'; denom: number; num: number }
  | { kind: 'baseten'; value: number }
  | { kind: 'comparebars'; a: number; b: number }
  | { kind: 'grid100'; tenths: number; tenths2: number }
  | { kind: 'countdots'; count: number }
  | { kind: 'none' }

export interface ExplainStep {
  text: string
  visual: Visual
}

const none: Visual = { kind: 'none' }

function additionSteps(a: number, b: number): ExplainStep[] {
  const sum = a + b
  if (a >= 0 && b >= 0 && sum <= 20) {
    const v = (jump: number): Visual => ({ kind: 'numberline', start: a, jump, max: Math.max(sum, 1), op: '+' })
    return [
      { text: `Start at ${a} on the number line.`, visual: v(0) },
      { text: `Now hop forward ${b} more.`, visual: v(b) },
      { text: `You land on ${sum}. So ${a} + ${b} = ${sum}.`, visual: v(b) },
    ]
  }
  return [
    { text: `Add the ones first, then the tens.`, visual: none },
    { text: `${a} + ${b} = ${sum}.`, visual: none },
  ]
}

function subtractionSteps(a: number, b: number): ExplainStep[] {
  const diff = a - b
  if (a <= 20 && a >= 0 && b >= 0) {
    const v = (jump: number): Visual => ({ kind: 'numberline', start: a, jump, max: Math.max(a, 1), op: '-' })
    return [
      { text: `Start at ${a} on the number line.`, visual: v(0) },
      { text: `Hop back ${b}.`, visual: v(b) },
      { text: `You land on ${diff}. So ${a} − ${b} = ${diff}.`, visual: v(b) },
    ]
  }
  return [
    { text: `Subtract the ones, then the tens — borrow a ten if you need to.`, visual: none },
    { text: `${a} − ${b} = ${diff}.`, visual: none },
  ]
}

function multSteps(a: number, b: number): ExplainStep[] {
  const prod = a * b
  if (a <= 6 && b <= 6) {
    const v: Visual = { kind: 'array', rows: a, cols: b }
    return [
      { text: `× means groups. ${a} × ${b} is ${a} rows of ${b}.`, visual: v },
      { text: `Count all the dots: ${a} × ${b} = ${prod}.`, visual: v },
    ]
  }
  if (a <= 6 && b <= 10) {
    const v: Visual = { kind: 'groups', groups: a, per: b }
    return [
      { text: `${a} × ${b} means ${a} groups of ${b}.`, visual: v },
      { text: `Altogether that makes ${prod}.`, visual: v },
    ]
  }
  return [
    { text: `${a} × ${b} is ${a} groups of ${b}.`, visual: none },
    { text: `Break it into tens and ones to get ${prod}.`, visual: none },
  ]
}

function fallback(p: Problem): ExplainStep[] {
  const out: ExplainStep[] = []
  if (p.hint) out.push({ text: p.hint, visual: none })
  out.push({ text: `The answer is ${p.answer}.`, visual: none })
  return out
}

export function explainProblem(p: Problem): ExplainStep[] {
  const ops = p.operands ?? []
  switch (p.topic) {
    case 'counting': {
      const n = ops[0] ?? (Number(p.answer) || 0)
      const v: Visual = { kind: 'countdots', count: n }
      return [
        { text: `Let's count them one at a time.`, visual: v },
        { text: `There are ${n} in all. The answer is ${n}.`, visual: v },
      ]
    }
    case 'addition':
    case 'word-problems': {
      const [a, b] = ops
      if (a === undefined) return fallback(p)
      return p.operator === '-' ? subtractionSteps(a, b) : additionSteps(a, b)
    }
    case 'subtraction': {
      const [a, b] = ops
      if (a === undefined) return fallback(p)
      return subtractionSteps(a, b)
    }
    case 'multiplication':
    case 'multi-digit-mult': {
      const [a, b] = ops
      if (a === undefined) return fallback(p)
      return multSteps(a, b)
    }
    case 'division':
    case 'long-division': {
      const [a, b, q] = ops
      if (a === undefined) return fallback(p)
      if (a <= 24 && q <= 12) {
        const v: Visual = { kind: 'groups', groups: b, per: q, share: true }
        return [
          { text: `${a} ÷ ${b} shares ${a} into ${b} equal groups.`, visual: v },
          { text: `Each group gets ${q}. So ${a} ÷ ${b} = ${q}.`, visual: v },
        ]
      }
      return [
        { text: `How many groups of ${b} fit in ${a}? Work one digit at a time.`, visual: none },
        { text: `${a} ÷ ${b} = ${q}.`, visual: none },
      ]
    }
    case 'fractions': {
      const [whole, denom] = ops
      if (whole === undefined) return fallback(p)
      const each = whole / denom
      if (whole <= 24) {
        const v: Visual = { kind: 'groups', groups: denom, per: each }
        return [
          { text: `1/${denom} means split ${whole} into ${denom} equal groups.`, visual: v },
          { text: `Each group has ${each}. So 1/${denom} of ${whole} is ${each}.`, visual: v },
        ]
      }
      return [
        { text: `Split ${whole} into ${denom} equal groups.`, visual: none },
        { text: `Each group is ${each}.`, visual: none },
      ]
    }
    case 'fraction-mult': {
      const [whole, num, denom] = ops
      if (whole === undefined) return fallback(p)
      const each = whole / denom
      if (whole <= 24) {
        const v: Visual = { kind: 'groups', groups: denom, per: each }
        return [
          { text: `First split ${whole} into ${denom} equal parts — each is ${each}.`, visual: v },
          { text: `Take ${num} of those parts: ${num} × ${each} = ${each * num}.`, visual: v },
        ]
      }
      return [
        { text: `Find 1/${denom} of ${whole} = ${each}.`, visual: none },
        { text: `Then take ${num} of them: ${each * num}.`, visual: none },
      ]
    }
    case 'fraction-add': {
      const [a, b, denom] = ops
      if (a === undefined) return fallback(p)
      return [
        { text: `Both fractions are out of ${denom}, so the pieces are the same size.`, visual: { kind: 'fractionbar', denom, num: a } },
        { text: `Add the shaded pieces: ${a} + ${b} = ${a + b}.`, visual: { kind: 'fractionbar', denom, num: a + b } },
        { text: `The answer is ${a + b}/${denom}.`, visual: { kind: 'fractionbar', denom, num: a + b } },
      ]
    }
    case 'place-value': {
      const [, digit, place] = ops
      if (digit === undefined) return fallback(p)
      const val = digit * place
      const placeName = place === 1 ? 'ones' : place === 10 ? 'tens' : place === 100 ? 'hundreds' : 'thousands'
      const v: Visual = val <= 999 ? { kind: 'baseten', value: val } : none
      return [
        { text: `The digit ${digit} sits in the ${placeName} place.`, visual: v },
        { text: `Each one is worth ${place}, so its value is ${digit} × ${place} = ${val}.`, visual: v },
      ]
    }
    case 'compare': {
      const [a, b] = ops
      if (a === undefined) return fallback(p)
      const v: Visual = { kind: 'comparebars', a, b }
      return [
        { text: `Compare the heights of ${a} and ${b}.`, visual: v },
        {
          text: a === b ? `They are equal, so we use =.` : `${Math.max(a, b)} is taller, so ${a} ${a > b ? '>' : '<'} ${b}.`,
          visual: v,
        },
      ]
    }
    case 'rounding': {
      const [num, base] = ops
      if (num === undefined) return fallback(p)
      const lower = Math.floor(num / base) * base
      const upper = lower + base
      const answer = Math.round(num / base) * base
      const digitName = base === 10 ? 'ones' : 'tens'
      return [
        { text: `${num} is between ${lower} and ${upper}.`, visual: none },
        { text: `Look at the ${digitName} digit: 5 or more rounds up, less rounds down.`, visual: none },
        { text: `${num} rounds to ${answer}.`, visual: none },
      ]
    }
    case 'area-perimeter': {
      const [l, w] = ops
      if (l === undefined) return fallback(p)
      const isArea = p.prompt.includes('area')
      if (isArea) {
        const v: Visual = l <= 8 && w <= 8 ? { kind: 'array', rows: l, cols: w } : none
        return [
          { text: `Area is the squares inside. Make a ${l} by ${w} grid.`, visual: v },
          { text: `Count them: ${l} × ${w} = ${l * w}.`, visual: v },
        ]
      }
      return [
        { text: `Perimeter is the way around: ${l} + ${w} + ${l} + ${w}.`, visual: none },
        { text: `That adds up to ${2 * (l + w)}.`, visual: none },
      ]
    }
    case 'volume': {
      const [a, b, c] = ops
      if (a === undefined) return fallback(p)
      return [
        { text: `One layer is ${a} × ${b} = ${a * b} cubes.`, visual: a <= 8 && b <= 8 ? { kind: 'array', rows: a, cols: b } : none },
        { text: `There are ${c} layers: ${a * b} × ${c} = ${a * b * c}.`, visual: none },
      ]
    }
    case 'decimals':
    case 'decimal-ops': {
      const [a, b] = ops
      if (a === undefined) return fallback(p)
      if (p.operator === '+') {
        const ta = Math.round(a * 10)
        const tb = Math.round(b * 10)
        const sum = Math.round((a + b) * 10) / 10
        if (ta + tb <= 10) {
          const v: Visual = { kind: 'grid100', tenths: ta, tenths2: tb }
          return [
            { text: `${a.toFixed(1)} is ${ta} tenths, ${b.toFixed(1)} is ${tb} tenths.`, visual: v },
            { text: `Together: ${ta + tb} tenths = ${sum.toFixed(1)}.`, visual: v },
          ]
        }
        return [
          { text: `Line up the decimal points and add the tenths.`, visual: none },
          { text: `${a.toFixed(1)} + ${b.toFixed(1)} = ${sum.toFixed(1)}.`, visual: none },
        ]
      }
      const diff = Math.round((a - b) * 10) / 10
      return [
        { text: `Line up the decimal points, then subtract.`, visual: none },
        { text: `${a.toFixed(1)} − ${b.toFixed(1)} = ${diff.toFixed(1)}.`, visual: none },
      ]
    }
    case 'factors': {
      const [target] = ops
      const answer = Number(p.answer)
      if (target === undefined || !answer) return fallback(p)
      const other = target / answer
      const v: Visual = answer <= 8 && other <= 10 ? { kind: 'array', rows: answer, cols: other } : none
      return [
        { text: `${answer} is a factor because ${answer} rows of ${other} fill ${target}.`, visual: v },
        { text: `${answer} × ${other} = ${target}, with nothing left over.`, visual: v },
      ]
    }
    case 'order-of-operations':
      return [
        { text: `Do the × and ÷ first, before any + and −.`, visual: none },
        { text: `Then finish the + or −. The answer is ${p.answer}.`, visual: none },
      ]
    case 'shapes':
      return [
        { text: p.hint ?? `Picture the shape and count its straight sides.`, visual: none },
        { text: `The answer is ${p.answer}.`, visual: none },
      ]
    default:
      return fallback(p)
  }
}
