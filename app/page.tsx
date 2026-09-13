'use client'

import { useState, useMemo } from 'react'
import { Activity, AlertCircle, ArrowDownRight, ArrowUpRight, Bell, Calendar, CalendarClock, CalendarDays, CalendarX2, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Command, FileText, LayoutDashboard, Menu, MoreHorizontal, Notebook, NotebookPen, Phone, PhoneCall, Plus, RefreshCw, Search, Settings, ShieldCheck, Sparkles, Trash2, Users, X } from 'lucide-react'

type Status = 'Confirmed' | 'Needs attention' | 'Rescheduled' | 'Cancelled' | 'No answer'
type Appointment = {
  id: number
  name: string
  phone: string
  service: string
  time: string
  date: string
  status: Status
  staff: string
  staffInitials: string
  attempts: number
  maxAttempts: number
  lastContacted: string
  prep: string
  transcript: Array<{ role: 'agent' | 'client'; text: string; time: string }>
}

const appointments: Appointment[] = [
  { id: 1, name: 'Jordan Miller', phone: '(415) 555-0198', service: 'Initial consultation', time: '9:00 AM', date: 'Today', status: 'Confirmed', staff: 'Alex Kim', staffInitials: 'AK', attempts: 1, maxAttempts: 2, lastContacted: 'Today, 8:14 AM', prep: 'Jordan mentioned they are bringing prior lab results and would like to discuss a recurring shoulder issue.', transcript: [{ role: 'agent', text: 'Hi Jordan, this is NoShowGuard calling on behalf of Downtown Clinic about your initial consultation at 9:00 AM today. Can we count on you?', time: '8:14 AM' }, { role: 'client', text: 'Yes, definitely. I am bringing some lab results too.', time: '8:15 AM' }] },
  { id: 2, name: 'Avery Rodriguez', phone: '(415) 555-0144', service: 'Follow-up visit', time: '10:30 AM', date: 'Today', status: 'No answer', staff: 'Maya Chen', staffInitials: 'MC', attempts: 3, maxAttempts: 3, lastContacted: 'Today, 8:42 AM', prep: 'No confirmation received after three attempts. The client previously asked if a later slot is available.', transcript: [{ role: 'agent', text: 'Hi Avery, calling about your follow-up at 10:30 AM. Can you confirm?', time: '8:40 AM' }, { role: 'agent', text: 'No answer. Voicemail left.', time: '8:41 AM' }] },
  { id: 3, name: 'Sofia Patel', phone: '(415) 555-0112', service: 'Annual check-up', time: '11:15 AM', date: 'Today', status: 'Confirmed', staff: 'Alex Kim', staffInitials: 'AK', attempts: 1, maxAttempts: 2, lastContacted: 'Yesterday, 11:02 AM', prep: 'Confirmed by phone. Sofia asked for a reminder to bring her current medication list.', transcript: [{ role: 'agent', text: 'Hi Sofia, this is NoShowGuard calling about your annual check-up at 11:15 AM tomorrow. Just confirming attendance.', time: 'Yesterday, 11:02 AM' }, { role: 'client', text: 'Yes, I will be there. Should I bring anything?', time: 'Yesterday, 11:03 AM' }, { role: 'agent', text: 'Great question — your medication list would be helpful.', time: 'Yesterday, 11:04 AM' }] },
  { id: 4, name: 'Daniel Brooks', phone: '(415) 555-0171', service: 'New patient intake', time: '1:00 PM', date: 'Today', status: 'Rescheduled', staff: 'Priya Shah', staffInitials: 'PS', attempts: 2, maxAttempts: 3, lastContacted: 'Today, 7:58 AM', prep: 'Requested a new time due to a work conflict. Originally 11:00 AM, moved to 1:00 PM.', transcript: [{ role: 'agent', text: 'Hi Daniel, calling to confirm your new patient intake at 11:00 AM today.', time: 'Today, 7:58 AM' }, { role: 'client', text: 'Actually, can we move that? I have a work meeting.', time: 'Today, 7:59 AM' }, { role: 'agent', text: 'Of course. How about 1:00 PM instead?', time: 'Today, 8:00 AM' }, { role: 'client', text: 'Perfect.', time: 'Today, 8:01 AM' }] },
  { id: 5, name: 'Lena Chen', phone: '(415) 555-0163', service: 'Medication review', time: '2:30 PM', date: 'Today', status: 'Confirmed', staff: 'Maya Chen', staffInitials: 'MC', attempts: 1, maxAttempts: 2, lastContacted: 'Today, 8:25 AM', prep: 'Confirmed attendance and asked whether a family member can join the call.', transcript: [{ role: 'agent', text: 'Hi Lena, confirming your medication review at 2:30 PM today.', time: 'Today, 8:25 AM' }, { role: 'client', text: 'Yes, confirmed. Can my daughter join? She helps manage my meds.', time: 'Today, 8:26 AM' }, { role: 'agent', text: 'Absolutely.', time: 'Today, 8:27 AM' }] },
  { id: 6, name: 'Kai Williams', phone: '(415) 555-0136', service: 'Follow-up visit', time: '8:30 AM', date: 'Tomorrow', status: 'Confirmed', staff: 'Priya Shah', staffInitials: 'PS', attempts: 1, maxAttempts: 2, lastContacted: 'Today, 8:31 AM', prep: 'Confirmed. No additional requests captured.', transcript: [{ role: 'agent', text: 'Hi Kai, this is NoShowGuard confirming your follow-up at 8:30 AM tomorrow.', time: 'Today, 8:31 AM' }, { role: 'client', text: 'Yes, I will be there.', time: 'Today, 8:32 AM' }] },
]

const activity = [
  { time: '10:42 AM', title: 'Call completed', name: 'Avery Rodriguez', detail: 'No confirmation received', kind: 'warning' },
  { time: '10:39 AM', title: 'Appointment confirmed', name: 'Lena Chen', detail: 'Confirmed via phone', kind: 'success' },
  { time: '10:31 AM', title: 'Reminder sent', name: 'Daniel Brooks', detail: 'SMS + voice reminder', kind: 'info' },
  { time: '10:18 AM', title: 'Call completed', name: 'Jordan Miller', detail: 'Confirmed attendance', kind: 'success' },
]

const staff = [
  { name: 'Alex Kim', initials: 'AK', today: 8, rate: 92, booked: 8, capacity: 10 },
  { name: 'Maya Chen', initials: 'MC', today: 7, rate: 84, booked: 7, capacity: 8 },
  { name: 'Priya Shah', initials: 'PS', today: 5, rate: 88, booked: 5, capacity: 8 },
]

const statusConfig: Record<Status, { bg: string; text: string; ring: string }> = {
  Confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  'Needs attention': { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' },
  Rescheduled: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200' },
  Cancelled: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200' },
  'No answer': { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' },
}

function StatusPill({ status }: { status: Status }) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${config.bg} ${config.text} ${config.ring}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-100 text-[10px] font-semibold text-violet-700">
      {initials}
    </span>
  )
}

function Sparkline({ value }: { value: number }) {
  const down = value < 0
  return (
    <svg viewBox="0 0 80 24" className={`h-5 w-16 ${down ? 'text-amber-500' : 'text-emerald-500'}`} fill="none" aria-hidden>
      <path d={down ? 'M1 8c10 3 15 2 23 8s14-2 22 3 16-3 33 2' : 'M1 18c10-2 13 0 22-5s14 2 22-3 16 1 34-8'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function Page({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {children}
    </>
  )
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')

  if (!open) return null

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-12">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-lg">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <Search size={16} className="text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {!query ? (
            <p className="px-3 py-2 text-xs text-slate-500">Start typing to search appointments, staff, or actions.</p>
          ) : (
            <p className="px-3 py-2 text-xs text-slate-500">No results for "{query}"</p>
          )}
        </div>
      </div>
    </div>
  )
}

function SlidersHorizontalIcon() {
  return <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /><rect x="2" y="5" width="4" height="4" /><rect x="18" y="11" width="4" height="4" /></svg>
}

export default function App() {
  const [page, setPage] = useState('Dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [detailTab, setDetailTab] = useState('Conversation')
  const [commandOpen, setCommandOpen] = useState(false)
  const [range, setRange] = useState('Today')
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState('')
  const [researchedTime, setRescheduleTime] = useState('')
  const [view, setView] = useState<'List' | 'Board' | 'Calendar'>('List')
  const [appointmentsExpanded, setAppointmentsExpanded] = useState(true)

  const filtered = useMemo(() => {
    return appointments.filter(
      (a) =>
        [a.name, a.service, a.status, a.staff].some((v) => v.toLowerCase().includes(query.toLowerCase())) &&
        (range === 'All' || a.date === range)
    )
  }, [query, range])

  const notify = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const nav = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Appointments', icon: CalendarClock },
    { label: 'Staff & Capacity', icon: Users },
    { label: 'Call Log', icon: PhoneCall },
    { label: 'Settings', icon: Settings },
  ] as const

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all ${
          collapsed ? 'w-16' : 'w-60'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center px-4">
          {collapsed ? (
            <div className="grid size-8 place-items-center rounded-lg bg-violet-600 text-white">
              <ShieldCheck size={18} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-lg bg-violet-600 text-white">
                <ShieldCheck size={18} />
              </div>
              <span className="text-sm font-semibold tracking-tight">
                NoShow<span className="text-violet-600">Guard</span>
              </span>
            </div>
          )}
        </div>

        {/* Add Button */}
        <div className="px-3 py-2">
          <button
            onClick={() => {
              setShowAdd(true)
              setSidebarOpen(false)
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition"
          >
            <Plus size={14} />
            {!collapsed && 'Add appointment'}
          </button>
        </div>

        {/* Location */}
        {!collapsed && (
          <button
            onClick={() => notify('Location switched to Eastside Office')}
            className="mx-3 mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs hover:bg-slate-100"
          >
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="min-w-0 flex-1">
              <div className="text-[10px] text-slate-500">Location</div>
              <div className="truncate text-xs font-medium">Downtown Clinic</div>
            </span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
        )}

        {/* Navigation */}
        <nav className="mt-6 flex-1 px-2">
          {!collapsed && <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Workspace</p>}
          {nav.map(({ label, icon: Icon }) => (
            <div key={label}>
              <button
                onClick={() => {
                  setPage(label)
                  setSidebarOpen(false)
                }}
                title={label}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition ${
                  page === label
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon size={16} />
                {!collapsed && <><span className="flex-1 text-left">{label}</span>{label === 'Appointments' && <ChevronDown size={13} className={appointmentsExpanded ? '' : '-rotate-90'} />}</>}
              </button>
              {!collapsed && label === 'Appointments' && appointmentsExpanded && (
                <div className="mb-2 ml-8 flex flex-col gap-0.5 border-l border-slate-200 pl-2">
                  {[['All Appointments', appointments.length], ['Today', 5], ['Needs Attention', 2]].map(([child, count]) => (
                    <button key={child} onClick={() => { setPage('Appointments'); setRange(child === 'Today' ? 'Today' : child === 'All Appointments' ? 'All' : 'Today'); setSidebarOpen(false) }} className="flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] text-slate-500 hover:bg-slate-50 hover:text-slate-900">
                      <span>{child}</span><span className="rounded-full bg-slate-100 px-1.5 py-0.5 tabular-nums">{count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {!collapsed && (
          <button onClick={() => notify('NoShowGuard AI is ready to help')} className="mx-3 mb-2 flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-left text-xs font-medium text-violet-700 hover:bg-violet-100">
            <Sparkles size={14} /> Ask NoShowGuard AI
          </button>
        )}

        {/* Integration Status */}
        {!collapsed && (
          <div className="m-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <span className="size-2 rounded-full bg-emerald-500" />
              Calendar synced
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Google Calendar · Downtown Clinic</p>
            <button
              onClick={() => notify('Calendar sync is up to date')}
              className="mt-2 text-[10px] font-medium text-violet-600 hover:text-violet-700"
            >
              Manage connection <ChevronRight size={11} className="inline" />
            </button>
          </div>
        )}

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="m-3 flex items-center justify-center rounded-lg border border-slate-200 py-2 text-slate-400 hover:text-slate-700"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main */}
      <div className={`${collapsed ? 'lg:pl-16' : 'lg:pl-60'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-500 lg:hidden hover:text-slate-700"
            >
              <Menu size={20} />
            </button>
            <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
              <span className="text-slate-500">Workspace</span>
              <ChevronRight size={13} />
              <span className="font-medium text-slate-700">{page}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {page === 'Dashboard' && (
              <div className="hidden items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 sm:flex">
                {(['List', 'Board', 'Calendar'] as const).map((item) => (
                  <button key={item} onClick={() => setView(item)} className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition ${view === item ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>{item}</button>
                ))}
              </div>
            )}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden h-8 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] text-slate-400 hover:text-slate-700 sm:flex"
            >
              <Search size={13} /> Search <kbd className="ml-3 rounded border border-slate-200 bg-white px-1 py-0.5 text-[9px] font-mono">⌘K</kbd>
            </button>
            <button
              onClick={() => notify('No new notifications')}
              className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <Bell size={16} />
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100">
              <Avatar initials="AK" />
              <ChevronDown size={12} className="text-slate-400" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-7xl p-4 sm:p-6">
          {page === 'Dashboard' && (
            <>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-[11px] font-medium text-violet-600">
                    <span className="size-1.5 rounded-full bg-violet-600" />
                    Tuesday, September 13, 2026
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold text-slate-900">Good morning, Alex</h1>
                  <p className="mt-1 text-xs text-slate-500">Here&apos;s what&apos;s happening with your appointments.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setRange(range === 'Today' ? 'Tomorrow' : range === 'Tomorrow' ? 'All' : 'Today')
                    }
                    className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <CalendarDays size={13} className="text-slate-400" />
                    {range}
                    <ChevronDown size={12} className="text-slate-400" />
                  </button>
                  <button
                    onClick={() => notify('Dashboard data refreshed')}
                    className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Today's appointments", value: '24', change: '+12.5%', sub: 'vs. 21 last Tuesday', icon: CalendarDays, down: false },
                  { label: 'Confirmed', value: '21', change: '+4.2%', sub: '87.5% confirmation rate', icon: Check, down: false },
                  { label: 'Needs attention', value: '3', change: '-20.0%', sub: '1 fewer than yesterday', icon: AlertCircle, down: true },
                  { label: 'Rescheduled this week', value: '8', change: '+28.6%', sub: '2 more than last week', icon: Clock3, down: false },
                ].map(({ label, value, change, sub, icon: Icon, down }) => (
                  <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div className="grid size-8 place-items-center rounded-lg bg-violet-50 text-violet-600">
                        <Icon size={15} />
                      </div>
                      <Sparkline value={down ? -1 : 1} />
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-[10px] text-slate-400">{sub}</p>
                        <span className={`flex items-center gap-0.5 text-xs font-medium ${down ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {down ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                          {change}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {view === 'Board' && (
                <div className="mb-6 grid gap-3 overflow-x-auto pb-2 md:grid-cols-5">
                  {(['Needs attention', 'Confirmed', 'Rescheduled', 'No answer', 'Cancelled'] as Status[]).map((status) => (
                    <section key={status} className="min-w-[190px] rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-semibold text-slate-700"><StatusPill status={status} /></div><span className="text-[11px] text-slate-400">{appointments.filter((a) => a.status === status).length}</span></div>
                      <div className="flex flex-col gap-2">{appointments.filter((a) => a.status === status).map((apt) => <button key={apt.id} onClick={() => setSelected(apt)} className="rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-violet-200 hover:shadow-sm"><p className="truncate text-xs font-semibold text-slate-800">{apt.name}</p><p className="mt-1 text-[11px] text-slate-500">{apt.service}</p><p className="mt-2 text-[11px] text-slate-500">{apt.date}, {apt.time}</p><div className="mt-2 flex items-center gap-2"><Avatar initials={apt.staffInitials} /><span className="text-[10px] text-slate-500">{apt.attempts} of {apt.maxAttempts}</span></div></button>)}</div>
                    </section>
                  ))}
                </div>
              )}
              {view === 'Calendar' && (
                <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
                  <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-900">September 2026</h2><div className="flex gap-1"><button className="grid size-7 place-items-center rounded-md border border-slate-200"><ChevronLeft size={14} /></button><button className="grid size-7 place-items-center rounded-md border border-slate-200"><ChevronRight size={14} /></button></div></div>
                  <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => <div key={day} className="bg-slate-50 p-2 text-center text-[10px] font-semibold text-slate-500">{day}</div>)}{Array.from({length: 35}, (_, i) => <div key={i} className="min-h-20 bg-white p-2 text-[11px] text-slate-500"><span className={i === 15 ? 'grid size-5 place-items-center rounded-full bg-violet-600 font-semibold text-white' : ''}>{i < 15 ? i + 17 : i - 14}</span>{i === 15 && <div className="mt-2 rounded bg-emerald-50 px-1 py-0.5 text-[9px] text-emerald-700">5 confirmed</div>}</div>)}</div>
                </div>
              )}

              {/* Appointments + Activity */}
              <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                {/* Appointments Table */}
                <section className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                  <div className="border-b border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-sm font-semibold text-slate-900">Appointments</h2>
                        <p className="mt-1 text-[11px] text-slate-500">Showing {filtered.length} of {appointments.length}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 px-2.5">
                          <Search size={13} className="text-slate-400" />
                          <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Filter..."
                            className="bg-transparent text-xs outline-none placeholder:text-slate-400"
                          />
                        </div>
                        <button className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700">
                          <SlidersHorizontalIcon />
                        </button>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 border-t border-slate-200 pt-3">
                      {['Today', 'Tomorrow', 'All'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setRange(tab)}
                          className={`border-b-2 px-3 pb-3 text-xs font-medium transition ${
                            range === tab
                              ? 'border-violet-600 text-violet-700'
                              : 'border-transparent text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {tab}{' '}
                          {tab === 'Today' && (
                            <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[9px]">5</span>
                          )}
                          {tab === 'Tomorrow' && (
                            <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[9px]">1</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Table */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 font-medium text-slate-600">Client</th>
                          <th className="px-4 py-3 font-medium text-slate-600">Staff</th>
                          <th className="px-4 py-3 font-medium text-slate-600">Service</th>
                          <th className="px-4 py-3 font-medium text-slate-600">Scheduled</th>
                          <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                          <th className="px-4 py-3 font-medium text-slate-600">Attempts</th>
                          <th className="px-4 py-3 font-medium text-slate-600">Last contacted</th>
                          <th className="px-4 py-3 font-medium text-slate-600" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-12">
                              <div className="flex flex-col items-center gap-3">
                                <CalendarX2 size={32} className="text-slate-300" />
                                <div className="text-center">
                                  <p className="font-medium text-slate-600">No appointments scheduled</p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Connect your calendar or add manually to get started.
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filtered.map((apt) => (
                            <tr key={apt.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelected(apt)}>
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-900">{apt.name}</div>
                                <div className="mt-0.5 text-slate-500">{apt.phone}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Avatar initials={apt.staffInitials} />
                                  <span className="text-slate-700">{apt.staff}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-700">{apt.service}</td>
                              <td className="px-4 py-3 text-slate-700">
                                {apt.date}, {apt.time}
                              </td>
                              <td className="px-4 py-3">
                                <StatusPill status={apt.status} />
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {apt.attempts} of {apt.maxAttempts}
                              </td>
                              <td className="px-4 py-3 text-slate-600">{apt.lastContacted}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                  }}
                                  className="text-slate-400 hover:text-slate-700"
                                >
                                  <MoreHorizontal size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="divide-y divide-slate-100 md:hidden">
                    {filtered.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
                        <CalendarX2 size={32} className="text-slate-300" />
                        <div>
                          <p className="font-medium text-slate-600">No appointments scheduled</p>
                          <p className="mt-1 text-xs text-slate-500">Connect your calendar or add manually to get started.</p>
                        </div>
                      </div>
                    ) : filtered.map((apt) => (
                      <button key={apt.id} onClick={() => setSelected(apt)} className="block w-full p-4 text-left hover:bg-slate-50">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{apt.name}</p>
                            <p className="mt-0.5 text-[11px] text-slate-500">{apt.phone}</p>
                          </div>
                          <StatusPill status={apt.status} />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                          <span>{apt.service}</span>
                          <span>{apt.date}, {apt.time}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                          <Avatar initials={apt.staffInitials} />
                          <span>{apt.staff}</span>
                          <span className="ml-auto">{apt.attempts} of {apt.maxAttempts} attempts</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Live Activity */}
                <aside className="rounded-lg border border-slate-200 bg-white overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-200 p-4">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">Live activity</h2>
                      <p className="mt-1 text-[11px] text-slate-500">Today, September 13</p>
                    </div>
                    <Activity size={15} className="text-violet-600" />
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {activity.map((entry, i) => (
                      <div key={i} className="flex gap-3 pb-4 last:pb-0">
                        <div
                          className={`relative mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white ${
                            i === 0 ? 'ring-4 ring-violet-50' : ''
                          }`}
                        >
                          {entry.kind === 'warning' && (
                            <AlertCircle size={12} className="text-amber-500" />
                          )}
                          {entry.kind === 'success' && (
                            <Check size={12} className="text-emerald-500" />
                          )}
                          {entry.kind === 'info' && (
                            <Phone size={12} className="text-violet-600" />
                          )}
                        </div>
                        {i < activity.length - 1 && (
                          <div className="absolute left-3 top-6 h-12 w-px bg-slate-200" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-xs font-medium text-slate-700">{entry.title}</p>
                            <time className="shrink-0 text-[10px] text-slate-400">{entry.time}</time>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">{entry.name}</p>
                          <p className="text-[10px] text-slate-400">{entry.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setPage('Call Log')}
                    className="border-t border-slate-200 py-3 text-center text-xs font-medium text-violet-600 hover:text-violet-700"
                  >
                    View call log <ChevronRight size={12} className="inline" />
                  </button>
                </aside>
              </div>
            </>
          )}

          {page === 'Appointments' && (
            <Page title="Appointments" subtitle="Manage every appointment and confirmation.">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {appointments.map((apt) => (
                  <button
                    key={apt.id}
                    onClick={() => setSelected(apt)}
                    className="rounded-lg border border-slate-200 bg-white p-4 text-left hover:border-violet-300 hover:shadow-sm transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">{apt.name}</span>
                      <StatusPill status={apt.status} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {apt.date} · {apt.time} · {apt.staff}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">{apt.service}</p>
                  </button>
                ))}
              </div>
            </Page>
          )}

          {page === 'Staff & Capacity' && (
            <Page title="Staff & Capacity" subtitle="See appointment load and confirmation coverage by staff member.">
              <section className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-medium text-slate-600">Staff member</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Today</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Confirmation rate</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Capacity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staff.map((person) => {
                      const pct = (person.booked / person.capacity) * 100
                      return (
                        <tr key={person.name}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Avatar initials={person.initials} />
                              <span className="font-medium text-slate-900">{person.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{person.today}</td>
                          <td className="px-4 py-3 text-slate-700">{person.rate}%</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 rounded-full bg-slate-200">
                                <div
                                  className="h-2 rounded-full bg-violet-600"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-slate-600">
                                {person.booked}/{person.capacity}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </section>
            </Page>
          )}

          {page === 'Call Log' && (
            <Page title="Call Log" subtitle="Review every reminder attempt and outcome.">
              <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
                {activity.concat(activity).map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 place-items-center rounded-lg bg-violet-50 text-violet-600">
                        <Phone size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-900">
                          {entry.title} · {entry.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">{entry.detail}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">Today, {entry.time}</span>
                  </div>
                ))}
              </div>
            </Page>
          )}

          {page === 'Settings' && (
            <Page title="Settings" subtitle="Tune reminders, scripts, and workspace preferences.">
              <div className="grid max-w-2xl gap-4">
                {/* Calendar Integration */}
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-600">
                        <Calendar size={17} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Calendar integration</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Google Calendar · Downtown Clinic
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => notify('Calendar reconnected')}
                      className="text-xs font-medium text-violet-600 hover:text-violet-700"
                    >
                      Reconnect
                    </button>
                  </div>
                </div>

                {/* Call Timing */}
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <label className="block text-sm font-semibold text-slate-900">
                    Call timing
                  </label>
                  <p className="mt-1 text-xs text-slate-500">
                    Start confirmation calls before each appointment.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue="24"
                      className="w-20 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                    />
                    <span className="text-xs text-slate-600">hours before</span>
                  </div>
                </div>

                {/* Call Script */}
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-600">
                        <FileText size={17} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Call script</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {"Use tokens like {{client_name}}, {{service}}, and {{time}}."}
                        </p>
                      </div>
                    </div>
                  </div>
                  <textarea
                    defaultValue="Hi {{client_name}}, this is NoShowGuard calling on behalf of Downtown Clinic about your {{service}} at {{time}}. Can we count on you to make it?"
                    className="mt-3 min-h-24 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-mono text-[11px] outline-none focus:border-violet-300"
                  />
                  <button
                    onClick={() => notify('Call script saved')}
                    className="mt-3 text-xs font-medium text-violet-600 hover:text-violet-700"
                  >
                    Save changes
                  </button>
                </div>

                {/* CALL-E Usage */}
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">CALL-E account</h3>
                      <p className="mt-1 text-xs text-slate-500">7 of 20 free calls used this month</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-violet-600" style={{ width: '35%' }} />
                  </div>
                  <button
                    onClick={() => notify('Upgrade info opened')}
                    className="mt-3 text-xs font-medium text-violet-600 hover:text-violet-700"
                  >
                    Request more calls or upgrade plan
                  </button>
                </div>
              </div>
            </Page>
          )}
        </main>
      </div>

      {/* Appointment Detail Sheet */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 flex justify-end bg-black/50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white sm:max-w-lg"
          >
            {/* Header */}
            <div className="sticky top-0 border-b border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-slate-900">{selected.name}</h2>
                  <p className="mt-1 text-xs text-slate-500">{selected.phone}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-500">
                    {selected.service} · {selected.date}, {selected.time}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">{selected.staff}</p>
                </div>
                <StatusPill status={selected.status} />
              </div>
            </div>

            {/* Meeting Prep */}
            <div className="border-b border-slate-200 bg-violet-50 p-4">
              <div className="flex items-start gap-2">
                <Sparkles size={14} className="mt-0.5 flex-shrink-0 text-violet-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                    Meeting prep
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-violet-900">
                    {selected.prep}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              {['Conversation', 'Details'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`flex-1 border-b-2 px-4 py-3 text-xs font-medium transition ${
                    detailTab === tab
                      ? 'border-violet-600 text-violet-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {detailTab === 'Conversation' && (
                <div className="space-y-3">
                  {selected.transcript.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-2 ${
                        msg.role === 'client' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-3 py-2 text-xs leading-relaxed ${
                          msg.role === 'client'
                            ? 'bg-violet-50 text-violet-900'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-400">
                        {msg.time}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {detailTab === 'Details' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Call attempts</p>
                    <div className="mt-3 space-y-2">
                      {Array.from({ length: selected.attempts }).map((_, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="mt-0.5 flex size-5 items-center justify-center rounded-full border border-violet-300 bg-violet-50 text-[10px] font-semibold text-violet-700">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-slate-900">
                              Attempt {i + 1}
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-500">
                              {i === 0 && 'Reached and confirmed'}
                              {i === 1 && 'Left voicemail'}
                              {i > 1 && 'No answer'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selected.status === 'Rescheduled' && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-xs font-medium text-blue-900">Reschedule requested</p>
                      <div className="mt-2">
                        <input
                          type="datetime-local"
                          value={rescheduleTime}
                          onChange={(e) => setRescheduleTime(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                        />
                        <button
                          onClick={() => {
                            notify('Reschedule confirmed')
                            setRescheduleTime('')
                          }}
                          className="mt-2 w-full rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
                        >
                          Confirm reschedule
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (selected.attempts >= selected.maxAttempts) {
                      notify('Max attempts reached')
                    } else {
                      notify(`Retry call scheduled for ${selected.name}`)
                    }
                  }}
                  disabled={selected.attempts >= selected.maxAttempts}
                  title={
                    selected.attempts >= selected.maxAttempts
                      ? 'Max attempts reached'
                      : undefined
                  }
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition ${
                    selected.attempts >= selected.maxAttempts
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-violet-600 text-white hover:bg-violet-700'
                  }`}
                >
                  Retry call
                </button>
                <button
                  onClick={() => {
                    notify('Appointment marked as resolved')
                    setSelected(null)
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Resolve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Appointment Dialog */}
      {showAdd && (
        <div
          onClick={() => setShowAdd(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6"
          >
            <h2 className="text-lg font-semibold text-slate-900">Add appointment</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700">Client name</label>
                <input
                  type="text"
                  placeholder="e.g., Jamie Roberts"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-violet-300"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-violet-300"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Service</label>
                <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-violet-300">
                  <option>Initial consultation</option>
                  <option>Follow-up visit</option>
                  <option>Annual check-up</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Assigned staff</label>
                <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-violet-300">
                  {staff.map((s) => (
                    <option key={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Date & time</label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-violet-300"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  notify('Appointment created and call scheduled')
                  setShowAdd(false)
                }}
                className="flex-1 rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white hover:bg-violet-700"
              >
                Add & schedule call
              </button>
            </div>
            <p className="mt-4 text-center text-[10px] text-slate-500">
              or{' '}
              <button className="font-medium text-violet-600 hover:text-violet-700">
                bulk import via CSV
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg">
          <Check size={16} className="text-emerald-600" />
          <p className="text-xs text-slate-700">{toast}</p>
        </div>
      )}
    </div>
  )
}
