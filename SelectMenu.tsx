import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import IconGlyph from './IconGlyph'

export type SelectOption = {
  value: string
  label: string
  description?: string
  avatarUrl?: string
  avatarFallback?: string
  markerClassName?: string
}

type SelectMenuProps = {
  id?: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  variant?: 'pill' | 'field'
  className?: string
  invalid?: boolean
}

function OptionVisual({ option }: { option: SelectOption }) {
  if (option.avatarUrl || option.avatarFallback) {
    return (
      <span className="relative grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-100 text-[0.58rem] font-bold text-zinc-900 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:ring-zinc-700">
        {option.avatarFallback}
        {option.avatarUrl && <img src={option.avatarUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" onError={event => { event.currentTarget.hidden = true }} />}
      </span>
    )
  }

  if (option.markerClassName) {
    return <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${option.markerClassName}`} />
  }

  return null
}

export default function SelectMenu({
  id,
  value,
  options,
  onChange,
  placeholder = 'Select option',
  variant = 'pill',
  className = '',
  invalid = false,
}: SelectMenuProps) {
  const autoId = useId()
  const buttonId = id ?? `select-${autoId}`
  const menuId = `${buttonId}-menu`
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const selected = useMemo(() => options.find(option => option.value === value), [options, value])

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        document.getElementById(buttonId)?.focus()
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [buttonId, open])

  const choose = (nextValue: string) => {
    onChange(nextValue)
    setOpen(false)
    requestAnimationFrame(() => document.getElementById(buttonId)?.focus())
  }

  const shape = variant === 'field'
    ? 'min-h-[2.875rem] rounded-xl px-3.5 py-2.5'
    : 'h-11 rounded-full px-4 py-2'

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        id={buttonId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-invalid={invalid || undefined}
        onClick={() => setOpen(v => !v)}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen(true)
          }
        }}
        className={`flex w-full cursor-pointer items-center justify-between gap-3 border bg-white text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:focus:border-white dark:focus:ring-white/10 ${shape} ${invalid ? 'border-rose-300 dark:border-rose-500/60' : 'border-zinc-200 dark:border-zinc-800'}`}
      >
        <span className="flex min-w-0 items-center gap-3 pl-1">
          {selected && <OptionVisual option={selected} />}
          <span className={`truncate ${selected ? '' : 'text-zinc-400 dark:text-zinc-500'}`}>{selected?.label ?? placeholder}</span>
        </span>
        <IconGlyph Icon={ChevronDown} size={15} tone="current" className={`text-zinc-500 transition-transform dark:text-zinc-400 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div id={menuId} role="listbox" aria-labelledby={buttonId} className="absolute right-0 top-[calc(100%+0.5rem)] z-[80] max-h-72 w-full min-w-[15rem] overflow-auto rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl shadow-zinc-300/50 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/50">
          {options.map(option => {
            const active = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => choose(option.value)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors ${active ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50'}`}
              >
                <OptionVisual option={option} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{option.label}</span>
                  {option.description && <span className="mt-0.5 block truncate text-xs font-normal text-zinc-500 dark:text-zinc-400">{option.description}</span>}
                </span>
                {active && <IconGlyph Icon={Check} size={16} tone="current" className="text-zinc-950 dark:text-zinc-50" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
