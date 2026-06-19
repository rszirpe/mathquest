import type { AvatarConfig } from '@/types'

function starPoints(cx: number, cy: number) {
  const r = 6
  const ri = 2.6
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 === 0 ? r : ri
    pts.push(`${(cx + rr * Math.cos(ang)).toFixed(1)},${(cy + rr * Math.sin(ang)).toFixed(1)}`)
  }
  return pts.join(' ')
}

function Face({ expr }: { expr: string }) {
  const ink = '#1f2937'
  switch (expr) {
    case 'cool':
      return (
        <g>
          <rect x="29" y="40" width="42" height="11" rx="5" fill="#111827" />
          <rect x="34" y="42" width="11" height="6" rx="3" fill="#374151" />
          <rect x="55" y="42" width="11" height="6" rx="3" fill="#374151" />
          <path d="M42 60 Q50 66 58 60" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )
    case 'star':
      return (
        <g>
          <polygon points={starPoints(40, 46)} fill="#facc15" stroke="#eab308" strokeWidth="1" />
          <polygon points={starPoints(60, 46)} fill="#facc15" stroke="#eab308" strokeWidth="1" />
          <path d="M41 59 Q50 68 59 59" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )
    case 'wink':
      return (
        <g>
          <circle cx="40" cy="47" r="4.5" fill={ink} />
          <path d="M55 47 q5 -4 10 0" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M41 59 Q50 67 59 59" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )
    case 'surprised':
      return (
        <g>
          <circle cx="40" cy="46" r="5.5" fill="#fff" stroke={ink} strokeWidth="2.5" />
          <circle cx="60" cy="46" r="5.5" fill="#fff" stroke={ink} strokeWidth="2.5" />
          <circle cx="40" cy="46" r="2.4" fill={ink} />
          <circle cx="60" cy="46" r="2.4" fill={ink} />
          <circle cx="50" cy="62" r="5" fill={ink} />
        </g>
      )
    default:
      return (
        <g>
          <circle cx="40" cy="47" r="4.5" fill={ink} />
          <circle cx="60" cy="47" r="4.5" fill={ink} />
          <path d="M40 58 Q50 68 60 58" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )
  }
}

export function Avatar({ config, size = 120 }: { config: AvatarConfig; size?: number }) {
  const isNight = config.background === '#1e293b'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="100" rx="20" fill={config.background} />
      {isNight && (
        <g fill="#fde68a">
          <circle cx="18" cy="20" r="1.6" />
          <circle cx="82" cy="16" r="1.4" />
          <circle cx="70" cy="30" r="1.2" />
          <circle cx="26" cy="40" r="1.2" />
        </g>
      )}
      <circle cx="50" cy="56" r="33" fill={config.body} />
      <ellipse cx="50" cy="63" rx="19" ry="16" fill="#ffffff" opacity="0.22" />
      <Face expr={config.face} />
      {config.accessory && (
        <text x="50" y="82" fontSize="20" textAnchor="middle">
          {config.accessory}
        </text>
      )}
      {config.hat && (
        <text x="50" y="27" fontSize="30" textAnchor="middle">
          {config.hat}
        </text>
      )}
    </svg>
  )
}
