import { useState, type KeyboardEvent } from 'react'
import { CalendarDays, Flag, Pencil, Trash2 } from 'lucide-react'
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
const statusAccent: Record<Status, string> = {
  'To Do': 'before:bg-purple-500 dark:before:bg-purple-400',
  'In Progress': 'before:bg-amber-400 dark:before:bg-amber-300',
  Complete: 'before:bg-emerald-500 dark:before:bg-emerald-400',
}
const actionButton = 'grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-transparent text-black transition-colors hover:border-zinc-200 hover:bg-zinc-50 dark:text-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800'

export default function JobCard({ job, onOpen, onEdit, onDelete }: { job: Job; onOpen: () => void; onEdit: () => void; onDelete: () => void }) {
  const emp = empById(job.employeeId)
  const late = isOverdue(job)
  const [photoFailed, setPhotoFailed] = useState(false)

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen()
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      aria-label={`View details for ${job.title}`}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200/70 transition-all before:absolute before:inset-x-6 before:top-0 before:h-1 before:rounded-b-full hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md hover:shadow-zinc-200/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none dark:hover:border-zinc-700 dark:hover:shadow-none dark:focus-visible:ring-white ${statusAccent[job.status]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityTone[job.priority]}`}><IconGlyph Icon={Flag} size={12} strokeWidth={2.4} tone="current" />{job.priority} priority</span>
        <div className="-mr-2 -mt-2 flex">
          <button onClick={e => { e.stopPropagation(); onEdit() }} aria-label={`Edit ${job.title}`} className={actionButton}><IconGlyph Icon={Pencil} size={17} /></button>
          <button onClick={e => { e.stopPropagation(); onDelete() }} aria-label={`Delete ${job.title}`} className={actionButton}><IconGlyph Icon={Trash2} size={17} /></button>
        </div>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug text-zinc-950 dark:text-zinc-50">{job.title}</h3>
      <p className="mt-1.5 line-clamp-3 min-h-[3.75rem] text-sm font-normal leading-relaxed text-zinc-600 dark:text-zinc-400">{job.notes || 'No notes.'}</p>
      <div className="mt-5 flex items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-100 text-xs font-bold text-zinc-900 ring-2 ring-white shadow-sm shadow-zinc-300/70 dark:bg-zinc-800 dark:text-zinc-50 dark:ring-zinc-900 dark:shadow-none">
          {emp?.photo && !photoFailed ? (
            <img src={emp.photo} alt={emp.name} className="h-full w-full object-cover" loading="lazy" onError={() => setPhotoFailed(true)} />
          ) : (
            emp ? initials(emp.name) : '?'
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">{emp?.name ?? 'Unassigned'}</p>
          <p className={`flex items-center gap-1 text-xs ${late ? 'font-semibold text-rose-600 dark:text-rose-300' : 'text-zinc-500 dark:text-zinc-400'}`}><IconGlyph Icon={CalendarDays} size={12} strokeWidth={2.4} tone="current" />{fmtDate(job.dueDate)}{late && ' (overdue)'}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone[job.status]}`}>{job.status}</span>
      </div>
    </article>
  )
}
