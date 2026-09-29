import { useEffect, useState } from 'react'

export type Status = 'To Do' | 'In Progress' | 'Complete'
export type Priority = 'Low' | 'Medium' | 'High'
export interface Employee { id: string; name: string; role: string; tone: string; photo: string }
export interface Job { id: string; title: string; notes: string; employeeId: string; dueDate: string; priority: Priority; status: Status }

export const STATUSES: Status[] = ['To Do', 'In Progress', 'Complete']
export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High']
export const EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Amara Okafor', role: 'Project Lead', tone: 'bg-black text-white', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 'e2', name: 'Diego Ramos', role: 'Field Technician', tone: 'bg-zinc-100 text-zinc-900', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 'e3', name: 'Priya Nair', role: 'Designer', tone: 'bg-white text-zinc-950', photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: 'e4', name: 'Tomas Berg', role: 'Coordinator', tone: 'bg-zinc-200 text-zinc-900', photo: 'https://randomuser.me/api/portraits/men/75.jpg' },
]

export const initials = (n: string) => n.split(' ').map(p => p[0]).join('')
export const empById = (id: string) => EMPLOYEES.find(e => e.id === id)
export const uid = () => Math.random().toString(36).slice(2, 10)

const day = (offset: number) => {
  const d = new Date(); d.setDate(d.getDate() + offset)
  return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10)
}
export const today = () => day(0)
export const isOverdue = (j: Job) => j.status !== 'Complete' && j.dueDate < today()
export const fmtDate = (s: string) =>
  new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const seed = (): Job[] => [
  { id: uid(), title: 'Site inspection: Harbor Street', notes: 'Check wiring and safety signage before the client walkthrough.', employeeId: 'e2', dueDate: day(-1), priority: 'High', status: 'In Progress' },
  { id: uid(), title: 'Draft onboarding checklist', notes: 'Cover first-week tasks, equipment and access requests.', employeeId: 'e1', dueDate: day(3), priority: 'Medium', status: 'To Do' },
  { id: uid(), title: 'Update service brochure', notes: 'New pricing and photos. Send proof for approval.', employeeId: 'e3', dueDate: day(6), priority: 'Low', status: 'To Do' },
  { id: uid(), title: 'Schedule weekend crew', notes: 'Confirm availability with all four team members.', employeeId: 'e4', dueDate: day(-3), priority: 'Medium', status: 'Complete' },
  { id: uid(), title: 'Order replacement parts', notes: 'Filters and valves for the Unit 4 repair.', employeeId: 'e2', dueDate: day(1), priority: 'High', status: 'To Do' },
]

const KEY = 'job-manager:jobs:v1'
export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw) as Job[] } catch { /* ignore */ }
    return seed()
  })
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(jobs)) } catch { /* ignore */ } }, [jobs])
  return [jobs, setJobs] as const
}
