import { useId } from 'react'
import type { LucideIcon } from 'lucide-react'

type IconGlyphProps = {
  Icon: LucideIcon
  size?: number
  strokeWidth?: number
  className?: string
  tone?: 'black' | 'current' | 'white'
  tile?: boolean
}

export default function IconGlyph({
  Icon,
  size = 20,
  strokeWidth = 2.35,
  className = '',
  tone = 'black',
  tile = false,
}: IconGlyphProps) {
  const gradientId = `icon-gradient-${useId().replace(/:/g, '')}`
  const usesGradient = tone === 'black'
  const iconColor = usesGradient ? `url(#${gradientId})` : tone === 'white' ? '#fff' : 'currentColor'

  return (
    <span
      className={`inline-grid shrink-0 place-items-center ${tile ? 'h-12 w-12 rounded-2xl border border-zinc-200 bg-zinc-50 shadow-inner shadow-white/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none' : ''} ${className}`}
      aria-hidden="true"
    >
      <Icon
        color={iconColor}
        size={size}
        strokeWidth={strokeWidth}
      >
        {usesGradient && (
          <defs>
            <linearGradient id={gradientId} x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--icon-gradient-start)" />
              <stop offset="28%" stopColor="var(--icon-gradient-mid)" />
              <stop offset="48%" stopColor="var(--icon-gradient-end)" />
              <stop offset="100%" stopColor="var(--icon-gradient-end)" />
            </linearGradient>
          </defs>
        )}
      </Icon>
    </span>
  )
}
