import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Briefcase, CheckCircle2, CircleDashed, Clock3, Plus } from 'lucide-react'
import IconGlyph from './IconGlyph'
import SelectMenu, { type SelectOption } from './SelectMenu'
import Sidebar from './Sidebar'
import JobCard from './JobCard'
import JobDetailModal from './JobDetailModal'
import JobModal from './JobModal'
import StatisticsCalendar from './StatisticsCalendar'
import { EMPLOYEES, STATUSES, initials, uid, useJobs, type Job, type Status } from './lib'

const THEME_KEY = 'job-manager:theme'

const pillTone: Record<Status | 'All', string> = {
  All: 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black',
  'To Do': 'border-purple-600 bg-purple-600 text-white dark:border-purple-400 dark:bg-purple-400 dark:text-zinc-950',
  'In Progress': 'border-amber-500 bg-amber-500 text-zinc-950 dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950',
  Complete: 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-400 dark:bg-emerald-400 dark:text-zinc-950',
}
const pill = (on: boolean, s: Status | 'All') => `h-10 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors ${on ? pillTone[s] : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800'}`

const initialDarkMode = () => {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'dark') return true
    if (stored === 'light') return false
  } catch { /* ignore */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export default function App() {
  const [jobs, setJobs] = useJobs()
  const [status, setStatus] = useState<Status | 'All'>('All')
  const [employee, setEmployee] = useState('all')
  const [editing, setEditing] = useState<Job | 'new' | null>(null)
  const [viewing, setViewing] = useState<Job | null>(null)
  const [deleting, setDeleting] = useState<Job | null>(null)
  const [darkMode, setDarkMode] = useState(initialDarkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    try { localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light') } catch { /* ignore */ }
  }, [darkMode])

  const shown = useMemo(() => jobs
    .filter(j => (status === 'All' || j.status === status) && (employee === 'all' || j.employeeId === employee))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [jobs, status, employee])

  const count = (s: Status) => jobs.filter(j => j.status === s).length
  const statusCounts: Record<Status | 'All', number> = {
    All: jobs.length,
    'To Do': count('To Do'),
    'In Progress': count('In Progress'),
    Complete: count('Complete'),
  }
  const stats = [
    { label: 'Total jobs', value: statusCounts.All, Icon: Briefcase },
    { label: 'To do', value: statusCounts['To Do'], Icon: CircleDashed },
    { label: 'In progress', value: statusCounts['In Progress'], Icon: Clock3 },
    { label: 'Complete', value: statusCounts.Complete, Icon: CheckCircle2 },
  ]
  const employeeOptions = useMemo<SelectOption[]>(() => [
    { value: 'all', label: 'All employees', description: 'Show every team member', avatarFallback: 'All' },
    ...EMPLOYEES.map(e => ({ value: e.id, label: e.name, description: e.role, avatarUrl: e.photo, avatarFallback: initials(e.name) })),
  ], [])

  const save = (d: Omit<Job, 'id'>) => {
    setJobs(p => editing !== 'new' && editing ? p.map(j => j.id === editing.id ? { ...j, ...d } : j) : [{ id: uid(), ...d }, ...p])
    setEditing(null)
  }

  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
      <Sidebar
        status={status}
        setStatus={setStatus}
        counts={statusCounts}
        selectedEmployeeId={employee}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onAddJob={() => setEditing('new')}
      />

      <div className="sm:pl-20 lg:pl-72">
      <main id="dashboard" className="mx-auto max-w-6xl scroll-mt-4 px-4 py-8 sm:px-6">
        <div className="grid items-center gap-5 lg:grid-cols-[1fr_auto_1fr]">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">Your team's jobs</h1>
            <p className="mt-1 text-sm font-normal text-zinc-500 dark:text-zinc-400">Assign work, track progress, and see what's due.</p>
          </div>
          <div className="flex justify-center">
            <img src="/walking-briefcase-group.png" alt="Four people walking with briefcases" className="h-32 w-auto object-contain transition duration-300 dark:invert dark:brightness-125 dark:contrast-110 sm:h-36 lg:h-40" />
          </div>
          <div className="flex lg:justify-end">
            <button onClick={() => setEditing('new')} className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-2xl bg-black px-6 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:shadow-white/5 dark:hover:bg-zinc-200"><IconGlyph Icon={Plus} size={18} tone="current" />Add job</button>
          </div>
        </div>

        <section aria-label="Summary" className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(({ label, value, Icon }) => (
            <div key={label} className="flex items-center gap-4 rounded-[1.75rem] border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200/70 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
              <IconGlyph Icon={Icon} size={28} />
              <div><p className="font-mono text-2xl font-bold leading-none text-zinc-950 dark:text-zinc-50">{value}</p><p className="mt-1 text-xs font-normal text-zinc-500 dark:text-zinc-400">{label}</p></div>
            </div>
          ))}
        </section>

        <div id="statistics" className="scroll-mt-6">
          <StatisticsCalendar jobs={jobs} />
        </div>

        <section id="jobs" aria-label="Filters" className="mt-8 flex scroll-mt-6 flex-wrap items-center gap-3">
          <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
            {(['All', ...STATUSES] as const).map(s => <button key={s} aria-pressed={status === s} onClick={() => setStatus(s)} className={pill(status === s, s)}>{s}</button>)}
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            <span id="employee-filter-label">Employee</span>
            <SelectMenu
              id="employee-filter"
              value={employee}
              options={employeeOptions}
              onChange={setEmployee}
              className="w-56"
            />
          </div>
        </section>

        <p className="mt-6 text-sm font-normal text-zinc-500 dark:text-zinc-400" aria-live="polite">{shown.length} {shown.length === 1 ? 'job' : 'jobs'}</p>

        {shown.length === 0 ? (
          <div className="mt-3 rounded-[2rem] border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm shadow-zinc-200/70 transition-colors dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-none sm:p-12">
            <img src="/empty-briefcase.png" alt="Empty briefcase illustration" className="mx-auto h-40 w-auto object-contain transition duration-300 dark:invert dark:brightness-125 dark:contrast-110 sm:h-48" />
            <p className="mt-4 text-lg font-semibold text-zinc-950 dark:text-zinc-50">{jobs.length === 0 ? 'No jobs yet' : 'No jobs match these filters'}</p>
            <p className="mx-auto mt-1 max-w-md text-sm font-normal text-zinc-500 dark:text-zinc-400">{jobs.length === 0 ? 'Start your board by creating the first job for your team.' : 'Change the status or employee filter, or add a new job for this view.'}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {(status !== 'All' || employee !== 'all') && (
                <button onClick={() => { setStatus('All'); setEmployee('all') }} className="h-11 cursor-pointer rounded-full border border-zinc-200 bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800">Clear filters</button>
              )}
              <button onClick={() => setEditing('new')} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"><IconGlyph Icon={Plus} size={16} tone="current" />Add job</button>
            </div>
          </div>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map(j => <JobCard key={j.id} job={j} onOpen={() => setViewing(j)} onEdit={() => setEditing(j)} onDelete={() => setDeleting(j)} />)}
            <button
              type="button"
              onClick={() => setEditing('new')}
              className="group flex min-h-[15rem] cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-zinc-300 bg-white/60 p-5 text-center text-zinc-600 transition-all hover:-translate-y-0.5 hover:border-zinc-500 hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 dark:focus-visible:ring-white"
              aria-label="Add a new job"
            >
              <IconGlyph Icon={Plus} size={36} />
              <span className="mt-3 text-sm font-semibold">Add job</span>
            </button>
          </div>
        )}
      </main>
      </div>

      {viewing && (
        <JobDetailModal
          job={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => { setEditing(viewing); setViewing(null) }}
          onDelete={() => { setDeleting(viewing); setViewing(null) }}
        />
      )}

      {editing && <JobModal job={editing === 'new' ? null : editing} onSave={save} onClose={() => setEditing(null)} />}

      {deleting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-white/25 p-4 backdrop-blur-xl dark:bg-black/25" onMouseDown={e => e.target === e.currentTarget && setDeleting(null)}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="del-title" className="pop w-full max-w-sm rounded-3xl border border-white/70 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"><IconGlyph Icon={AlertTriangle} size={20} tone="current" /></span>
            <h2 id="del-title" className="mt-4 text-lg font-bold text-zinc-950 dark:text-zinc-50">Delete this job?</h2>
            <p className="mt-1 text-sm font-normal text-zinc-600 dark:text-zinc-400">“{deleting.title}” will be removed permanently. This can't be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button autoFocus onClick={() => setDeleting(null)} className="h-11 cursor-pointer rounded-xl px-5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
              <button onClick={() => { setJobs(p => p.filter(j => j.id !== deleting.id)); setDeleting(null) }} className="h-11 cursor-pointer rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400">Delete job</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
