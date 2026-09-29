import { useMemo, useState } from 'react'
import { AlertTriangle, Briefcase, CheckCircle2, CircleDashed, Clock3, Plus, SearchX } from 'lucide-react'
import JobCard from './JobCard'
import JobModal from './JobModal'
import { EMPLOYEES, STATUSES, uid, useJobs, type Job, type Status } from './lib'

const pill = (on: boolean) => `h-10 cursor-pointer rounded-full px-4 text-sm font-semibold transition-colors ${on ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-indigo-50'}`

export default function App() {
  const [jobs, setJobs] = useJobs()
  const [status, setStatus] = useState<Status | 'All'>('All')
  const [employee, setEmployee] = useState('all')
  const [editing, setEditing] = useState<Job | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Job | null>(null)

  const shown = useMemo(() => jobs
    .filter(j => (status === 'All' || j.status === status) && (employee === 'all' || j.employeeId === employee))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [jobs, status, employee])

  const count = (s: Status) => jobs.filter(j => j.status === s).length
  const stats = [
    { label: 'Total jobs', value: jobs.length, Icon: Briefcase, tone: 'bg-indigo-50' },
    { label: 'To do', value: count('To Do'), Icon: CircleDashed, tone: 'bg-violet-50' },
    { label: 'In progress', value: count('In Progress'), Icon: Clock3, tone: 'bg-sky-50' },
    { label: 'Complete', value: count('Complete'), Icon: CheckCircle2, tone: 'bg-emerald-50' },
  ]

  const save = (d: Omit<Job, 'id'>) => {
    setJobs(p => editing !== 'new' && editing ? p.map(j => j.id === editing.id ? { ...j, ...d } : j) : [{ id: uid(), ...d }, ...p])
    setEditing(null)
  }

  return (
    <div className="min-h-screen font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white"><Briefcase size={18} /></span>
          <span className="text-lg font-extrabold tracking-tight">Job Board</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light tracking-tight sm:text-4xl">Your team's <span className="font-bold">jobs</span></h1>
            <p className="mt-1 text-sm text-slate-500">Assign work, track progress, and see what's due.</p>
          </div>
          <button onClick={() => setEditing('new')} className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-2xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700"><Plus size={18} />Add job</button>
        </div>

        <section aria-label="Summary" className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(({ label, value, Icon, tone }) => (
            <div key={label} className={`flex items-center gap-4 rounded-2xl border border-white p-4 ${tone}`}>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-indigo-600"><Icon size={20} /></span>
              <div><p className="text-2xl font-bold leading-none">{value}</p><p className="mt-1 text-xs text-slate-600">{label}</p></div>
            </div>
          ))}
        </section>

        <section aria-label="Filters" className="mt-8 flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
            {(['All', ...STATUSES] as const).map(s => <button key={s} aria-pressed={status === s} onClick={() => setStatus(s)} className={pill(status === s)}>{s}</button>)}
          </div>
          <label className="ml-auto flex items-center gap-2 text-sm font-semibold text-slate-600">
            Employee
            <select value={employee} onChange={e => setEmployee(e.target.value)} className="h-10 cursor-pointer rounded-full border-0 bg-white px-4 text-sm font-medium text-slate-800">
              <option value="all">All employees</option>
              {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </label>
        </section>

        <p className="mt-6 text-sm text-slate-500" aria-live="polite">{shown.length} {shown.length === 1 ? 'job' : 'jobs'}</p>

        {shown.length === 0 ? (
          <div className="mt-3 rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
            <SearchX className="mx-auto text-slate-400" size={32} />
            <p className="mt-3 font-semibold">No jobs match these filters</p>
            <p className="mt-1 text-sm text-slate-500">Change the status or employee filter, or add a new job.</p>
            <button onClick={() => { setStatus('All'); setEmployee('all') }} className="mt-4 h-10 cursor-pointer rounded-full bg-white px-5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">Clear filters</button>
          </div>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map(j => <JobCard key={j.id} job={j} onEdit={() => setEditing(j)} onDelete={() => setDeleting(j)} />)}
          </div>
        )}
      </main>

      {editing && <JobModal job={editing === 'new' ? null : editing} onSave={save} onClose={() => setEditing(null)} />}

      {deleting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4" onMouseDown={e => e.target === e.currentTarget && setDeleting(null)}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="del-title" className="pop w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-rose-100 text-rose-600"><AlertTriangle size={20} /></span>
            <h2 id="del-title" className="mt-4 text-lg font-bold">Delete this job?</h2>
            <p className="mt-1 text-sm text-slate-600">“{deleting.title}” will be removed permanently. This can't be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button autoFocus onClick={() => setDeleting(null)} className="h-11 cursor-pointer rounded-xl px-5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
              <button onClick={() => { setJobs(p => p.filter(j => j.id !== deleting.id)); setDeleting(null) }} className="h-11 cursor-pointer rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white hover:bg-rose-700">Delete job</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
