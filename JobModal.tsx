import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import IconGlyph from './IconGlyph'
import SelectMenu, { type SelectOption } from './SelectMenu'
import { EMPLOYEES, initials, type Job, type Priority, type Status } from './lib'

type Draft = Omit<Job, 'id'>
const blank: Draft = { title: '', notes: '', employeeId: '', dueDate: '', priority: 'Medium', status: 'To Do' }
const field = 'w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-white dark:focus:ring-white/10'
const priorityOptions: SelectOption[] = [
  { value: 'Low', label: 'Low', description: 'Flexible timing', markerClassName: 'bg-emerald-500' },
  { value: 'Medium', label: 'Medium', description: 'Normal attention', markerClassName: 'bg-amber-500' },
  { value: 'High', label: 'High', description: 'Needs urgent action', markerClassName: 'bg-rose-500' },
]
const statusOptions: SelectOption[] = [
  { value: 'To Do', label: 'To Do', description: 'Ready to start', markerClassName: 'bg-purple-500' },
  { value: 'In Progress', label: 'In Progress', description: 'Currently active', markerClassName: 'bg-amber-500' },
  { value: 'Complete', label: 'Complete', description: 'Finished work', markerClassName: 'bg-emerald-500' },
]

export default function JobModal({ job, onSave, onClose }: { job: Job | null; onSave: (d: Draft) => void; onClose: () => void }) {
  const [d, setD] = useState<Draft>(job ? { ...job } : blank)
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({})
  const employeeOptions = useMemo<SelectOption[]>(() => EMPLOYEES.map(e => ({
    value: e.id,
    label: e.name,
    description: e.role,
    avatarUrl: e.photo,
    avatarFallback: initials(e.name),
  })), [])
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => { setD(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: undefined })) }

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const submit = () => {
    const e: typeof errors = {}
    if (!d.title.trim()) e.title = 'Enter a job title.'
    if (!d.employeeId) e.employeeId = 'Choose who this job is assigned to.'
    if (!d.dueDate) e.dueDate = 'Pick a due date.'
    setErrors(e)
    if (Object.keys(e).length === 0) onSave({ ...d, title: d.title.trim(), notes: d.notes.trim() })
  }

  const Err = ({ k }: { k: keyof Draft }) => errors[k] ? <p role="alert" className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-300">{errors[k]}</p> : null
  const Label = ({ id, children }: { id: string; children: string }) => <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{children}</label>

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-white/25 p-0 backdrop-blur-xl dark:bg-black/25 sm:items-center sm:p-4" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="pop max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/70 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-bold text-zinc-950 dark:text-zinc-50">{job ? 'Edit job' : 'Add job'}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-black transition-colors hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-800"><IconGlyph Icon={X} size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <Label id="title">Title</Label>
            <input id="title" autoFocus className={field} placeholder="e.g. Site inspection" value={d.title} onChange={e => set('title', e.target.value)} aria-invalid={!!errors.title} />
            <Err k="title" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label id="emp">Assigned to</Label>
              <SelectMenu
                id="emp"
                value={d.employeeId}
                options={employeeOptions}
                onChange={value => set('employeeId', value)}
                placeholder="Select employee"
                variant="field"
                className="w-full"
                invalid={!!errors.employeeId}
              />
              <Err k="employeeId" />
            </div>
            <div>
              <Label id="due">Due date</Label>
              <input id="due" type="date" className={field} value={d.dueDate} onChange={e => set('dueDate', e.target.value)} aria-invalid={!!errors.dueDate} />
              <Err k="dueDate" />
            </div>
            <div>
              <Label id="pri">Priority</Label>
              <SelectMenu
                id="pri"
                value={d.priority}
                options={priorityOptions}
                onChange={value => set('priority', value as Priority)}
                variant="field"
                className="w-full"
              />
            </div>
            <div>
              <Label id="sta">Status</Label>
              <SelectMenu
                id="sta"
                value={d.status}
                options={statusOptions}
                onChange={value => set('status', value as Status)}
                variant="field"
                className="w-full"
              />
            </div>
          </div>
          <div>
            <Label id="notes">Notes</Label>
            <textarea id="notes" rows={3} className={field} placeholder="Anything the assignee should know" value={d.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="h-11 cursor-pointer rounded-xl px-5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
          <button onClick={submit} className="h-11 cursor-pointer rounded-xl bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">{job ? 'Save changes' : 'Add job'}</button>
        </div>
      </div>
    </div>
  )
}
