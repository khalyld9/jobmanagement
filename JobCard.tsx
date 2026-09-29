import { CalendarDays, Flag, Pencil, Trash2 } from 'lucide-react'
import { empById, fmtDate, initials, isOverdue, type Job, type Priority, type Status } from './lib'

const priorityTone: Record<Priority, string> = { Low: 'bg-slate-100 text-slate-700', Medium: 'bg-amber-100 text-amber-800', High: 'bg-rose-100 text-rose-700' }
const statusTone: Record<Status, string> = { 'To Do': 'bg-violet-100 text-violet-700', 'In Progress': 'bg-sky-100 text-sky-700', Complete: 'bg-emerald-100 text-emerald-700' }
const cardTone: Record<Status, string> = { 'To Do': 'bg-violet-50/70', 'In Progress': 'bg-sky-50/70', Complete: 'bg-emerald-50/70' }

export default function JobCard({ job, onEdit, onDelete }: { job: Job; onEdit: () => void; onDelete: () => void }) {
  const emp = empById(job.employeeId)
  const late = isOverdue(job)
  return (
    <article className={`flex flex-col rounded-3xl border border-white p-5 shadow-sm ${cardTone[job.status]}`}>
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${priorityTone[job.priority]}`}><Flag size={12} />{job.priority} priority</span>
        <div className="-mr-2 -mt-2 flex">
          <button onClick={onEdit} aria-label={`Edit ${job.title}`} className="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-slate-500 hover:bg-white hover:text-indigo-600"><Pencil size={17} /></button>
          <button onClick={onDelete} aria-label={`Delete ${job.title}`} className="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-slate-500 hover:bg-white hover:text-rose-600"><Trash2 size={17} /></button>
        </div>
      </div>
      <h3 className="mt-3 text-lg font-bold leading-snug">{job.title}</h3>
      <p className="mt-1.5 line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed text-slate-600">{job.notes || 'No notes.'}</p>
      <div className="mt-5 flex items-center gap-3 border-t border-white pt-4">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${emp?.tone ?? 'bg-slate-200'}`}>{emp ? initials(emp.name) : '?'}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{emp?.name ?? 'Unassigned'}</p>
          <p className={`flex items-center gap-1 text-xs ${late ? 'font-semibold text-rose-600' : 'text-slate-500'}`}><CalendarDays size={12} />{fmtDate(job.dueDate)}{late && ' (overdue)'}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[job.status]}`}>{job.status}</span>
      </div>
    </article>
  )
}
