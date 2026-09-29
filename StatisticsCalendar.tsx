import { useMemo, useState, type PointerEvent } from 'react'
import type { Job } from './lib'

type Range = 'Days' | 'Weeks' | 'Months'
type CalendarItem = {
  key: string
  label: string
  sublabel: string
  axisLabel: string
  start: Date
  end: Date
}

const ranges: Range[] = ['Days', 'Weeks', 'Months']
const MS_DAY = 24 * 60 * 60 * 1000

const atStartOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
const addMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, 1)
const toISO = (date: Date) => {
  const d = atStartOfDay(date)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}
const parseISO = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}
const sameRange = (date: Date, item: CalendarItem) => date >= item.start && date < item.end
const formatShortDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const weekNumber = (date: Date) => {
  const start = new Date(date.getFullYear(), 0, 1)
  return Math.ceil((((date.getTime() - start.getTime()) / MS_DAY) + start.getDay() + 1) / 7)
}

const buildItems = (range: Range): CalendarItem[] => {
  const today = atStartOfDay(new Date())

  if (range === 'Days') {
    return Array.from({ length: 10 }, (_, i) => {
      const date = addDays(today, i - 5)
      return {
        key: toISO(date),
        label: date.toLocaleDateString('en-US', { day: '2-digit' }),
        sublabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
        axisLabel: date.toLocaleDateString('en-US', { day: 'numeric' }),
        start: date,
        end: addDays(date, 1),
      }
    })
  }

  if (range === 'Weeks') {
    const weekStart = addDays(today, -today.getDay())
    return Array.from({ length: 10 }, (_, i) => {
      const start = addDays(weekStart, (i - 5) * 7)
      const end = addDays(start, 7)
      return {
        key: `${start.getFullYear()}-w${weekNumber(start)}`,
        label: `W${String(weekNumber(start)).padStart(2, '0')}`,
        sublabel: formatShortDate(start),
        axisLabel: `W${weekNumber(start)}`,
        start,
        end,
      }
    })
  }

  return Array.from({ length: 10 }, (_, i) => {
    const start = addMonths(today, i - 5)
    const end = addMonths(today, i - 4)
    return {
      key: `${start.getFullYear()}-${start.getMonth()}`,
      label: start.toLocaleDateString('en-US', { month: 'short' }),
      sublabel: String(start.getFullYear()),
      axisLabel: start.toLocaleDateString('en-US', { month: 'short' }),
      start,
      end,
    }
  })
}

const smoothPath = (points: [number, number][]) => {
  if (!points.length) return ''
  return points.reduce((path, point, i) => {
    if (i === 0) return `M ${point[0]} ${point[1]}`
    const [prevX, prevY] = points[i - 1]
    const [x, y] = point
    const midX = (prevX + x) / 2
    return `${path} C ${midX} ${prevY}, ${midX} ${y}, ${x} ${y}`
  }, '')
}

const chartGeometry = (values: number[], maxValue: number) => {
  const top = 7
  const bottom = 42
  const height = bottom - top
  const step = 100 / Math.max(values.length - 1, 1)
  return values.map<[number, number]>((value, index) => [
    index * step,
    bottom - (value / maxValue) * height,
  ])
}

export default function StatisticsCalendar({ jobs }: { jobs: Job[] }) {
  const [range, setRange] = useState<Range>('Days')
  const [selectedIndex, setSelectedIndex] = useState(5)

  const items = useMemo(() => buildItems(range), [range])
  const buckets = useMemo(() => items.map(item => {
    const jobsInRange = jobs.filter(job => sameRange(parseISO(job.dueDate), item))
    const activeByThen = jobs.filter(job => parseISO(job.dueDate) < item.end && job.status !== 'Complete').length
    return {
      total: jobsInRange.length,
      todo: jobsInRange.filter(job => job.status === 'To Do').length,
      progress: jobsInRange.filter(job => job.status === 'In Progress').length,
      complete: jobsInRange.filter(job => job.status === 'Complete').length,
      activeByThen,
    }
  }), [items, jobs])

  const selected = buckets[selectedIndex] ?? buckets[0] ?? { total: 0, todo: 0, progress: 0, complete: 0, activeByThen: 0 }
  const workloadValues = buckets.map(bucket => bucket.total + bucket.todo * 0.35 + bucket.progress * 0.8 + bucket.activeByThen * 0.2)
  const completionPaceValues = buckets.map(bucket => bucket.complete + bucket.progress * 0.4)
  const completeValues = buckets.map(bucket => bucket.complete)
  const chartMax = Math.max(4, Math.ceil(Math.max(...workloadValues, ...completionPaceValues, ...completeValues)))
  const yTicks = [1, 0.75, 0.5, 0.25].map(step => Math.max(0, Math.round(chartMax * step)))
  const solidPoints = chartGeometry(workloadValues, chartMax)
  const dashedPoints = chartGeometry(completionPaceValues, chartMax)
  const completePoints = chartGeometry(completeValues, chartMax)
  const solidPath = smoothPath(solidPoints)
  const dashedPath = smoothPath(dashedPoints)
  const completePath = smoothPath(completePoints)
  const areaPath = `${solidPath} L 100 45 L 0 45 Z`
  const selectedSolidPoint = solidPoints[selectedIndex]
  const selectedDashedPoint = dashedPoints[selectedIndex]
  const selectedCompletePoint = completePoints[selectedIndex]
  const chartKey = `${range}-${jobs.map(job => `${job.id}:${job.status}:${job.dueDate}`).join('|')}`

  const handleChartPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (!items.length) return
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    setSelectedIndex(Math.round(ratio * (items.length - 1)))
  }

  return (
    <section aria-label="Statistics and calendar" className="mt-8 rounded-[2rem] border border-zinc-200 bg-white p-5 text-zinc-950 shadow-sm shadow-zinc-200/70 transition-colors dark:border-zinc-800 dark:bg-black dark:text-white dark:shadow-none sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Statistics</h2>
          <p className="mt-1 text-sm font-normal text-zinc-500 dark:text-zinc-400">Calendar view of job load and completion pace.</p>
        </div>
        <div className="flex rounded-full bg-zinc-100 p-1 dark:bg-white/5">
          {ranges.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => { setRange(option); setSelectedIndex(5) }}
              className={`h-8 cursor-pointer rounded-full px-3 text-xs font-semibold transition-colors ${range === option ? 'bg-black text-white dark:bg-white dark:text-zinc-950' : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {items.map((item, index) => {
          const active = index === selectedIndex
          const count = buckets[index]?.total ?? 0
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`min-w-[4.25rem] cursor-pointer rounded-2xl border px-3 py-3 text-center transition-all ${active ? 'border-violet-300 bg-violet-100 text-violet-950 shadow-lg shadow-violet-500/15 dark:border-violet-200 dark:bg-violet-100 dark:text-violet-950 dark:shadow-violet-500/20' : 'border-zinc-200 bg-zinc-50 text-zinc-950 hover:border-zinc-300 hover:bg-white dark:border-white/5 dark:bg-white/[0.08] dark:text-white dark:hover:border-white/15 dark:hover:bg-white/[0.12]'}`}
              aria-pressed={active}
            >
              <span className="block font-mono text-sm font-bold leading-none">{item.label}</span>
              <span className={`mt-1 block text-[0.68rem] font-normal ${active ? 'text-violet-700' : 'text-zinc-500 dark:text-zinc-400'}`}>{item.sublabel}</span>
              {count > 0 && <span className={`mx-auto mt-2 block h-1.5 w-1.5 rounded-full ${active ? 'bg-violet-600' : 'bg-amber-500 dark:bg-amber-300'}`} />}
            </button>
          )
        })}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_12rem]">
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 transition-colors dark:border-white/10 dark:bg-black/40">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-violet-500 dark:bg-violet-400" />Workload</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400 dark:bg-amber-300" />Completion pace</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-300" />Complete</span>
            </div>
            <p className="text-xs font-normal text-zinc-500 dark:text-zinc-500">{items[selectedIndex]?.sublabel} · {items[selectedIndex]?.label}</p>
          </div>

          <div className="grid grid-cols-[1.75rem_1fr] gap-3">
            <div className="flex h-56 flex-col justify-between py-2 text-[0.65rem] text-zinc-500 dark:text-zinc-500 sm:h-64 lg:h-72">
              {yTicks.map((tick, index) => <span key={`${tick}-${index}`}>{tick}j</span>)}
            </div>
            <div
              className="relative h-56 min-w-0 cursor-crosshair overflow-hidden rounded-2xl bg-white dark:bg-zinc-950 sm:h-64 lg:h-72"
              onPointerMove={handleChartPointer}
              onPointerDown={handleChartPointer}
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,9,11,0.06)_1px,transparent_1px)] bg-[length:100%_25%] dark:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)]" />
              <svg key={chartKey} viewBox="0 0 100 48" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" role="img" aria-label="Job statistics chart">
                <defs>
                  <linearGradient id="job-stat-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.03" />
                  </linearGradient>
                </defs>
                <path className="chart-area" d={areaPath} fill="url(#job-stat-fill)" />
                <path className="chart-fade-in" d={dashedPath} fill="none" stroke="#f59e0b" strokeWidth="0.7" strokeDasharray="2 2" strokeLinecap="round" />
                <path className="chart-line" pathLength={1} d={completePath} fill="none" stroke="#10b981" strokeWidth="0.75" strokeLinecap="round" />
                <path className="chart-line" pathLength={1} d={solidPath} fill="none" stroke="#8b5cf6" strokeWidth="0.9" strokeLinecap="round" />
              </svg>
              {selectedSolidPoint && selectedDashedPoint && selectedCompletePoint && (
                <svg viewBox="0 0 100 48" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                  <line x1={selectedSolidPoint[0]} x2={selectedSolidPoint[0]} y1="7" y2="43" stroke="currentColor" strokeWidth="0.35" strokeDasharray="1 1.2" className="text-zinc-400/70 dark:text-zinc-500/80" />
                  <circle cx={selectedSolidPoint[0]} cy={selectedSolidPoint[1]} r="1.35" fill="#fff" stroke="#8b5cf6" strokeWidth="0.65" />
                  <circle cx={selectedDashedPoint[0]} cy={selectedDashedPoint[1]} r="1.15" fill="#fff" stroke="#f59e0b" strokeWidth="0.55" />
                  <circle cx={selectedCompletePoint[0]} cy={selectedCompletePoint[1]} r="1.15" fill="#fff" stroke="#10b981" strokeWidth="0.55" />
                </svg>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-1 grid grid-cols-5 px-2 text-[0.62rem] text-zinc-500 dark:text-zinc-500 sm:grid-cols-10">
                {items.map(item => <span key={item.key} className="hidden text-center sm:block">{item.axisLabel}</span>)}
                {items.filter((_, index) => index % 2 === 0).map(item => <span key={`mobile-${item.key}`} className="text-center sm:hidden">{item.axisLabel}</span>)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 transition-colors dark:border-white/10 dark:bg-white/[0.08]">
            <p className="text-xs font-normal text-zinc-500 dark:text-zinc-400">Jobs due</p>
            <p className="mt-1 font-mono text-3xl font-bold text-zinc-950 dark:text-white">{selected.total}</p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 transition-colors dark:border-white/10 dark:bg-white/[0.08]">
            <p className="text-xs font-normal text-zinc-500 dark:text-zinc-400">To do</p>
            <p className="mt-1 font-mono text-3xl font-bold text-purple-600 dark:text-purple-200">{selected.todo}</p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 transition-colors dark:border-white/10 dark:bg-white/[0.08]">
            <p className="text-xs font-normal text-zinc-500 dark:text-zinc-400">In progress</p>
            <p className="mt-1 font-mono text-3xl font-bold text-amber-600 dark:text-amber-200">{selected.progress}</p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 transition-colors dark:border-white/10 dark:bg-white/[0.08]">
            <p className="text-xs font-normal text-zinc-500 dark:text-zinc-400">Complete</p>
            <p className="mt-1 font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-200">{selected.complete}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
