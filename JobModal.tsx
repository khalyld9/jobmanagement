import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { EMPLOYEES, PRIORITIES, STATUSES, type Job, type Priority, type Status } from './lib'

type Draft = Omit<Job, 'id'>
const blank: Draft = { title: '', notes: '', employeeId: '', dueDate: '', priority: 'Medium', status: 'To Do' }
const field = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'

export default function JobModal({ job, onSave, onClose }: { job: Job | null; onSave: (d: Draft) => void; onClose: () => void }) {
  const [d, setD] = useState<Draft>(job ? { ...job } : blank)
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({})
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

  const Err = ({ k }: { k: keyof Draft }) => errors[k] ? <p role="alert" className="mt-1 text-xs font-medium text-rose-600">{errors[k]}</p> : null
  const Label = ({ id, children }: { id: string; children: string }) => <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">{children}</label>

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="pop max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-bold">{job ? 'Edit job' : 'Add job'}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-slate-500 hover:bg-slate-100"><X size={20} /></button>
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
              <select id="emp" className={field} value={d.employeeId} onChange={e => set('employeeId', e.target.value)} aria-invalid={!!errors.employeeId}>
                <option value="">Select employee</option>
                {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <Err k="employeeId" />
            </div>
            <div>
              <Label id="due">Due date</Label>
              <input id="due" type="date" className={field} value={d.dueDate} onChange={e => set('dueDate', e.target.value)} aria-invalid={!!errors.dueDate} />
              <Err k="dueDate" />
            </div>
            <div>
              <Label id="pri">Priority</Label>
              <select id="pri" className={field} value={d.priority} onChange={e => set('priority', e.target.value as Priority)}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select>
            </div>
            <div>
              <Label id="sta">Status</Label>
              <select id="sta" className={field} value={d.status} onChange={e => set('status', e.target.value as Status)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
            </div>
          </div>
          <div>
            <Label id="notes">Notes</Label>
            <textarea id="notes" rows={3} className={field} placeholder="Anything the assignee should know" value={d.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="h-11 cursor-pointer rounded-xl px-5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onClick={submit} className="h-11 cursor-pointer rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700">{job ? 'Save changes' : 'Add job'}</button>
        </div>
      </div>
    </div>
  )
}
