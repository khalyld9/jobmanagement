import { BarChart3, BriefcaseBusiness, CheckCircle2, CircleDashed, Clock3, LayoutGrid, Moon, Plus, Sun } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import IconGlyph from './IconGlyph'
import { EMPLOYEES, empById, initials, type Status } from './lib'

type Counts = Record<Status | 'All', number>

type SidebarProps = {
  status: Status | 'All'
  setStatus: Dispatch<SetStateAction<Status | 'All'>>
  counts: Counts
  selectedEmployeeId: string
  darkMode: boolean
  setDarkMode: Dispatch<SetStateAction<boolean>>
  onAddJob: () => void
}

const scrollToSection = (id: string) => {
  const target = document.getElementById(id)
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Sidebar({ status, setStatus, counts, selectedEmployeeId, darkMode, setDarkMode, onAddJob }: SidebarProps) {
  const selectedEmployee = selectedEmployeeId === 'all' ? null : empById(selectedEmployeeId)
  const profileEmployee = selectedEmployee ?? EMPLOYEES[0]
  const profileTitle = selectedEmployee?.name ?? 'All employees'
  const profileSubtitle = selectedEmployee?.role ?? 'Team view'

  const goJobs = () => scrollToSection('jobs')
  const filterStatus = (nextStatus: Status | 'All') => {
    setStatus(nextStatus)
    requestAnimationFrame(goJobs)
  }

  const primaryItems = [
    { label: 'Dashboard', Icon: LayoutGrid, onClick: () => scrollToSection('dashboard') },
    { label: 'Statistics', Icon: BarChart3, onClick: () => scrollToSection('statistics') },
    { label: 'Jobs', Icon: BriefcaseBusiness, onClick: goJobs },
    { label: 'Add Job', Icon: Plus, onClick: onAddJob },
  ]

  const statusItems: Array<{ label: Status | 'All'; Icon: typeof CircleDashed }> = [
    { label: 'All', Icon: BriefcaseBusiness },
    { label: 'To Do', Icon: CircleDashed },
    { label: 'In Progress', Icon: Clock3 },
    { label: 'Complete', Icon: CheckCircle2 },
  ]

  const itemClass = (active = false) => `flex h-10 w-full cursor-pointer items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-colors ${active ? 'bg-zinc-100 text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50'}`
  const railItemClass = (active = false) => `grid h-10 w-10 cursor-pointer place-items-center rounded-2xl transition-colors ${active ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50'}`

  return (
    <>
      <aside className="fixed bottom-4 left-4 top-4 z-40 hidden w-64 flex-col overflow-y-auto rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-2xl shadow-zinc-300/60 transition-colors dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/40 lg:flex">
        <div className="mb-7 px-1 pt-2">
          <p className="font-mono text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">( Job Management )</p>
        </div>

        <nav aria-label="Sidebar navigation" className="space-y-1">
          {primaryItems.map(({ label, Icon, onClick }) => (
            <button key={label} type="button" onClick={onClick} className={itemClass()}>
              <IconGlyph Icon={Icon} size={17} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="my-6 h-px bg-zinc-200 dark:bg-zinc-800" />

        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Filters</p>
          <div className="space-y-1">
            {statusItems.map(({ label, Icon }) => (
              <button key={label} type="button" onClick={() => filterStatus(label)} className={itemClass(status === label)}>
                <IconGlyph Icon={Icon} size={17} />
                <span className="flex-1 text-left">{label}</span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{counts[label]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <button type="button" onClick={() => setDarkMode(v => !v)} className={itemClass()}>
            <IconGlyph Icon={darkMode ? Sun : Moon} size={17} />
            <span className="flex-1 text-left">{darkMode ? 'Light mode' : 'Dark mode'}</span>
          </button>

          <button type="button" onClick={goJobs} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-zinc-100 p-3 text-left transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
            <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-200 text-xs font-bold text-zinc-900 ring-2 ring-white dark:bg-zinc-700 dark:text-zinc-50 dark:ring-zinc-900">
              {initials(profileEmployee.name)}
              <img src={profileEmployee.photo} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" onError={event => { event.currentTarget.hidden = true }} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">{profileTitle}</span>
              <span className="block truncate text-xs font-normal text-zinc-500 dark:text-zinc-400">{profileSubtitle}</span>
            </span>
            <span className="font-mono text-lg leading-none text-zinc-400">···</span>
          </button>
        </div>
      </aside>

      <aside className="fixed bottom-3 left-3 top-3 z-40 hidden w-16 flex-col items-center overflow-y-auto rounded-[1.75rem] border border-zinc-200 bg-white p-2 shadow-2xl shadow-zinc-300/60 transition-colors dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/40 sm:flex lg:hidden">
        <span className="mb-5 mt-1 grid h-10 w-10 place-items-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"><IconGlyph Icon={BriefcaseBusiness} size={18} tone="current" /></span>

        <nav aria-label="Compact sidebar navigation" className="flex flex-col items-center gap-1">
          {primaryItems.map(({ label, Icon, onClick }) => (
            <button key={label} type="button" title={label} aria-label={label} onClick={onClick} className={railItemClass()}>
              <IconGlyph Icon={Icon} size={17} />
            </button>
          ))}
        </nav>

        <div className="my-5 h-px w-10 bg-zinc-200 dark:bg-zinc-800" />

        <div className="flex flex-col items-center gap-1">
          {statusItems.map(({ label, Icon }) => (
            <button key={label} type="button" title={label} aria-label={`Filter ${label}`} onClick={() => filterStatus(label)} className={railItemClass(status === label)}>
              <IconGlyph Icon={Icon} size={17} />
            </button>
          ))}
        </div>

        <div className="mt-auto flex flex-col items-center gap-3">
          <button type="button" title={darkMode ? 'Light mode' : 'Dark mode'} aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`} onClick={() => setDarkMode(v => !v)} className={railItemClass()}>
            <IconGlyph Icon={darkMode ? Sun : Moon} size={17} />
          </button>
          <button type="button" onClick={goJobs} aria-label={profileTitle} className="relative grid h-10 w-10 cursor-pointer place-items-center overflow-hidden rounded-full bg-zinc-100 text-xs font-bold text-zinc-900 ring-2 ring-white dark:bg-zinc-800 dark:text-zinc-50 dark:ring-zinc-900">
            {initials(profileEmployee.name)}
            <img src={profileEmployee.photo} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" onError={event => { event.currentTarget.hidden = true }} />
          </button>
        </div>
      </aside>
    </>
  )
}
