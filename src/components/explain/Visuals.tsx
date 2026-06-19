import type { Visual } from '@/lib/explain'

const DOT = '#fbbf24'
const DOT_STROKE = '#f59e0b'
const GROUP_COLORS = ['#fbbf24', '#38bdf8', '#34d399', '#fb7185', '#a78bfa', '#f472b6']

function svgProps(w: number, h: number) {
  return {
    width: '100%',
    viewBox: `0 0 ${w} ${h}`,
    style: { maxWidth: w, height: 'auto' as const },
    xmlns: 'http://www.w3.org/2000/svg',
  }
}

function ArrayModel({ rows, cols }: { rows: number; cols: number }) {
  const pad = 14
  const cell = Math.min(38, Math.floor((300 - 2 * pad) / Math.max(cols, 1)))
  const r = Math.max(5, Math.floor(cell * 0.32))
  const w = pad * 2 + cols * cell
  const h = pad * 2 + rows * cell
  const dots = []
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      dots.push(
        <circle
          key={`${i}-${j}`}
          cx={pad + cell / 2 + j * cell}
          cy={pad + cell / 2 + i * cell}
          r={r}
          fill={DOT}
          stroke={DOT_STROKE}
          strokeWidth={2}
        />,
      )
    }
  }
  return <svg {...svgProps(w, h)}>{dots}</svg>
}

function CountDots({ count }: { count: number }) {
  const perRow = 5
  const rows = Math.ceil(count / perRow)
  const cell = 40
  const pad = 12
  const w = pad * 2 + Math.min(count, perRow) * cell
  const h = pad * 2 + rows * cell
  const dots = []
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / perRow)
    const col = i % perRow
    dots.push(
      <circle key={i} cx={pad + cell / 2 + col * cell} cy={pad + cell / 2 + row * cell} r={15} fill={DOT} stroke={DOT_STROKE} strokeWidth={2} />,
    )
  }
  return <svg {...svgProps(w, h)}>{dots}</svg>
}

function GroupsModel({ groups, per, share }: { groups: number; per: number; share?: boolean }) {
  const dotSp = 18
  const dotR = 6
  const gpad = 9
  const perRowInGroup = Math.min(per, 3)
  const groupRows = Math.ceil(per / perRowInGroup)
  const gW = gpad * 2 + perRowInGroup * dotSp
  const gH = gpad * 2 + groupRows * dotSp
  const groupsPerLine = Math.max(1, Math.min(groups, Math.floor(300 / (gW + 12))))
  const lines = Math.ceil(groups / groupsPerLine)
  const w = Math.min(316, groupsPerLine * (gW + 12) + 12)
  const h = lines * (gH + 12) + 12

  const nodes = []
  for (let g = 0; g < groups; g++) {
    const line = Math.floor(g / groupsPerLine)
    const col = g % groupsPerLine
    const x = 12 + col * (gW + 12)
    const y = 12 + line * (gH + 12)
    const color = share ? GROUP_COLORS[g % GROUP_COLORS.length] : DOT
    const stroke = share ? '#0f172a22' : DOT_STROKE
    nodes.push(<rect key={`box-${g}`} x={x} y={y} width={gW} height={gH} rx={10} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.5} />)
    for (let d = 0; d < per; d++) {
      const dr = Math.floor(d / perRowInGroup)
      const dc = d % perRowInGroup
      nodes.push(
        <circle
          key={`d-${g}-${d}`}
          cx={x + gpad + dotSp / 2 + dc * dotSp}
          cy={y + gpad + dotSp / 2 + dr * dotSp}
          r={dotR}
          fill={color}
          stroke={stroke}
          strokeWidth={1.5}
        />,
      )
    }
  }
  return <svg {...svgProps(w, h)}>{nodes}</svg>
}

function NumberLine({ start, jump, max, op }: { start: number; jump: number; max: number; op: '+' | '-' }) {
  const w = 300
  const pad = 24
  const y = 78
  const usable = w - 2 * pad
  const step = usable / Math.max(max, 1)
  const xFor = (v: number) => pad + v * step
  const end = op === '+' ? start + jump : start - jump
  const labelEvery = max <= 12 ? 1 : 5

  const ticks = []
  for (let v = 0; v <= max; v++) {
    const x = xFor(v)
    ticks.push(<line key={`t-${v}`} x1={x} y1={y - 6} x2={x} y2={y + 6} stroke="#94a3b8" strokeWidth={2} />)
    if (v % labelEvery === 0 || v === max) {
      ticks.push(
        <text key={`l-${v}`} x={x} y={y + 22} fontSize={12} fill="#64748b" textAnchor="middle" fontFamily="inherit">
          {v}
        </text>,
      )
    }
  }

  let hop = null
  if (jump > 0) {
    const x1 = xFor(start)
    const x2 = xFor(end)
    const apexY = 26
    const midX = (x1 + x2) / 2
    hop = (
      <g>
        <path d={`M ${x1} ${y - 8} Q ${midX} ${apexY} ${x2} ${y - 8}`} fill="none" stroke="#10b981" strokeWidth={3} strokeLinecap="round" />
        <polygon
          points={`${x2},${y - 8} ${x2 + (op === '+' ? -7 : 7)},${y - 16} ${x2 + (op === '+' ? -7 : 7)},${y - 1}`}
          fill="#10b981"
        />
        <text x={midX} y={apexY - 4} fontSize={13} fill="#059669" textAnchor="middle" fontWeight={700} fontFamily="inherit">
          {op === '+' ? '+' : '−'}
          {jump}
        </text>
      </g>
    )
  }

  return (
    <svg {...svgProps(w, 104)}>
      <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#cbd5e1" strokeWidth={3} strokeLinecap="round" />
      {ticks}
      {hop}
      <circle cx={xFor(start)} cy={y} r={6} fill="#64748b" />
      {jump > 0 && <circle cx={xFor(end)} cy={y} r={7} fill="#10b981" />}
    </svg>
  )
}

function FractionBar({ denom, num }: { denom: number; num: number }) {
  const w = 300
  const pad = 10
  const barH = 50
  const barW = w - 2 * pad
  const segW = barW / denom
  const segs = []
  for (let i = 0; i < denom; i++) {
    segs.push(
      <rect
        key={i}
        x={pad + i * segW}
        y={10}
        width={segW}
        height={barH}
        fill={i < num ? '#6366f1' : '#e0e7ff'}
        stroke="#ffffff"
        strokeWidth={3}
      />,
    )
  }
  return (
    <svg {...svgProps(w, 92)}>
      {segs}
      <text x={w / 2} y={82} fontSize={18} fill="#4338ca" textAnchor="middle" fontWeight={800} fontFamily="inherit">
        {num}/{denom}
      </text>
    </svg>
  )
}

function BaseTen({ value }: { value: number }) {
  const hundreds = Math.floor(value / 100)
  const tens = Math.floor((value % 100) / 10)
  const ones = value % 10
  const nodes = []
  let x = 12
  const top = 12
  const size = 30

  for (let i = 0; i < hundreds; i++) {
    nodes.push(<rect key={`h-${i}`} x={x} y={top} width={size} height={size} rx={4} fill="#2563eb" stroke="#1e40af" strokeWidth={2} />)
    x += size + 6
  }
  if (hundreds && tens) x += 6
  for (let i = 0; i < tens; i++) {
    nodes.push(<rect key={`t-${i}`} x={x} y={top} width={9} height={size} rx={2} fill="#38bdf8" stroke="#0284c7" strokeWidth={1.5} />)
    x += 13
  }
  if (tens && ones) x += 6
  for (let i = 0; i < ones; i++) {
    const col = i % 2
    const row = Math.floor(i / 2)
    nodes.push(<rect key={`o-${i}`} x={x + col * 11} y={top + row * 11} width={9} height={9} rx={2} fill="#fbbf24" stroke="#d97706" strokeWidth={1.5} />)
  }
  if (ones) x += 22

  const w = Math.max(60, x + 12)
  return (
    <svg {...svgProps(w, top + size + 26)}>
      {nodes}
      <text x={w / 2} y={top + size + 20} fontSize={14} fill="#475569" textAnchor="middle" fontWeight={700} fontFamily="inherit">
        = {value}
      </text>
    </svg>
  )
}

function CompareBars({ a, b }: { a: number; b: number }) {
  const w = 300
  const baseY = 130
  const maxBarH = 100
  const maxV = Math.max(a, b, 1)
  const barW = 70
  const equal = a === b
  const draw = (val: number, cx: number, big: boolean) => {
    const hgt = Math.max(10, (val / maxV) * maxBarH)
    return (
      <g>
        <rect x={cx - barW / 2} y={baseY - hgt} width={barW} height={hgt} rx={8} fill={equal ? '#14b8a6' : big ? '#6366f1' : '#cbd5e1'} />
        <text x={cx} y={baseY - hgt - 8} fontSize={20} fill="#1e293b" textAnchor="middle" fontWeight={800} fontFamily="inherit">
          {val}
        </text>
      </g>
    )
  }
  const sign = a > b ? '>' : a < b ? '<' : '='
  return (
    <svg {...svgProps(w, 150)}>
      {draw(a, 75, a >= b)}
      {draw(b, 225, b >= a)}
      <text x={150} y={baseY - 30} fontSize={34} fill="#7c3aed" textAnchor="middle" fontWeight={900} fontFamily="inherit">
        {sign}
      </text>
      <line x1={20} y1={baseY} x2={280} y2={baseY} stroke="#94a3b8" strokeWidth={3} strokeLinecap="round" />
    </svg>
  )
}

function Grid100({ tenths, tenths2 }: { tenths: number; tenths2: number }) {
  const w = 300
  const pad = 10
  const barH = 46
  const cellW = (w - 2 * pad) / 10
  const cells = []
  for (let i = 0; i < 10; i++) {
    const fill = i < tenths ? '#6366f1' : i < tenths + tenths2 ? '#34d399' : '#e5e7eb'
    cells.push(<rect key={i} x={pad + i * cellW} y={10} width={cellW} height={barH} fill={fill} stroke="#ffffff" strokeWidth={3} />)
  }
  return (
    <svg {...svgProps(w, 80)}>
      {cells}
      <text x={w / 2} y={74} fontSize={13} fill="#475569" textAnchor="middle" fontWeight={700} fontFamily="inherit">
        {tenths} tenths + {tenths2} tenths
      </text>
    </svg>
  )
}

export function VisualRenderer({ visual }: { visual: Visual }) {
  switch (visual.kind) {
    case 'array':
      return <ArrayModel rows={visual.rows} cols={visual.cols} />
    case 'countdots':
      return <CountDots count={visual.count} />
    case 'groups':
      return <GroupsModel groups={visual.groups} per={visual.per} share={visual.share} />
    case 'numberline':
      return <NumberLine start={visual.start} jump={visual.jump} max={visual.max} op={visual.op} />
    case 'fractionbar':
      return <FractionBar denom={visual.denom} num={visual.num} />
    case 'baseten':
      return <BaseTen value={visual.value} />
    case 'comparebars':
      return <CompareBars a={visual.a} b={visual.b} />
    case 'grid100':
      return <Grid100 tenths={visual.tenths} tenths2={visual.tenths2} />
    case 'none':
      return null
  }
}
