import { CalendarDays, CheckCircle2, CircleDashed, Clock3, Flag, Pencil, Trash2, UserRound, X } from 'lucide-react'
import IconGlyph from './IconGlyph'
import { empById, fmtDate, initials, isOverdue, type Job, type Priority, type Status } from './lib'

const priorityTone: Record<Priority, string> = {
  Low: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300',
  Medium: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
  High: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300',
}

const statusTone: Record<Status, string> = {
  'To Do': 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/15 dark:text-purple-300',
  'In Progress': 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
  Complete: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300',
}

const statusIcon: Record<Status, typeof CircleDashed> = {
  'To Do': CircleDashed,
  'In Progress': Clock3,
  Complete: CheckCircle2,
}

export default function JobDetailModal({
  job,
  onClose,
  onEdit,
  onDelete,
}: {
  job: Job
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const emp = empById(job.employeeId)
  const late = isOverdue(job)
  const StatusIcon = statusIcon[job.status]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-white/25 p-0 backdrop-blur-xl dark:bg-black/25 sm:items-center sm:p-4" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="job-detail-title" className="pop max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/70 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${priorityTone[job.priority]}`}>
                <IconGlyph Icon={Flag} size={12} strokeWidth={2.4} tone="current" />
                {job.priority} priority
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusTone[job.status]}`}>
                <IconGlyph Icon={StatusIcon} size={12} strokeWidth={2.4} tone="current" />
                {job.status}
              </span>
            </div>
            <h2 id="job-detail-title" className="text-2xl font-bold leading-tight text-zinc-950 dark:text-zinc-50">{job.title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-black transition-colors hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-800">
            <IconGlyph Icon={X} size={20} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Assigned employee</p>
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-100 text-sm font-bold text-zinc-900 ring-2 ring-white shadow-sm shadow-zinc-300/70 dark:bg-zinc-800 dark:text-zinc-50 dark:ring-zinc-900 dark:shadow-none">
                {emp?.photo ? <img src={emp.photo} alt={emp.name} className="h-full w-full object-cover" /> : emp ? initials(emp.name) : <IconGlyph Icon={UserRound} size={20} />}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">{emp?.name ?? 'Unassigned'}</p>
                <p className="truncate text-sm font-normal text-zinc-500 dark:text-zinc-400">{emp?.role ?? 'No role set'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Due date</p>
            <div className="flex items-center gap-3">
              <IconGlyph Icon={CalendarDays} size={24} />
              <div>
                <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{fmtDate(job.dueDate)}</p>
                <p className={`text-sm font-normal ${late ? 'text-rose-600 dark:text-rose-300' : 'text-zinc-500 dark:text-zinc-400'}`}>{late ? 'Overdue' : 'On schedule'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Notes</p>
          <p className="mt-3 whitespace-pre-wrap text-sm font-normal leading-7 text-zinc-700 dark:text-zinc-300">{job.notes || 'No notes were added for this job.'}</p>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button onClick={onDelete} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl px-5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10">
            <IconGlyph Icon={Trash2} size={16} tone="current" />
            Delete
          </button>
          <button onClick={onEdit} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
            <IconGlyph Icon={Pencil} size={16} tone="current" />
            Edit job
          </button>
        </div>
      </div>
    </div>
  )
}
