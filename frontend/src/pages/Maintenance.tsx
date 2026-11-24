import { useState } from 'react'
import { CalendarClock, AlertTriangle, CheckCircle, Clock, DollarSign, Download, Plus, Wrench } from 'lucide-react'
import clsx from 'clsx'
import { DEMO_MAINTENANCE } from '../hooks/demoData'
import type { MaintenanceRecord } from '../types'

const PRIORITY_BADGES: Record<string, string> = {
  critical: 'badge-critical',
  high: 'badge-critical',
  medium: 'badge-warning',
  low: 'badge-healthy',
}

const STATUS_ICONS: Record<string, any> = {
  overdue: AlertTriangle,
  upcoming: Clock,
  completed: CheckCircle,
  in_progress: Wrench,
}

const STATUS_COLORS: Record<string, string> = {
  overdue: 'text-red-400',
  upcoming: 'text-amber-400',
  completed: 'text-emerald-400',
  in_progress: 'text-blue-400',
}

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>(DEMO_MAINTENANCE)
  const [filter, setFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [newRec, setNewRec] = useState({
    machineId: 'MC-01',
    toolId: 'TL-001',
    type: 'predictive' as const,
    priority: 'high' as const,
    scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
    estimatedCost: 250,
    description: '',
  })

  const overdue = records.filter(m => m.status === 'overdue')
  const upcoming = records.filter(m => m.status === 'upcoming')
  const completed = records.filter(m => m.status === 'completed')
  const totalCost = records.filter(m => m.status !== 'completed').reduce((s, m) => s + m.estimatedCost, 0)

  const filtered = filter === 'all' ? records : records.filter(m => m.status === filter)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRec.description) return
    const record: MaintenanceRecord = {
      id: `M-00${records.length + 1}`,
      machineId: newRec.machineId,
      toolId: newRec.toolId,
      type: newRec.type,
      status: 'upcoming',
      priority: newRec.priority,
      scheduledAt: newRec.scheduledAt,
      estimatedCost: Number(newRec.estimatedCost),
      description: newRec.description,
    }
    setRecords([record, ...records])
    setShowModal(false)
    setNewRec({
      machineId: 'MC-01',
      toolId: 'TL-001',
      type: 'predictive',
      priority: 'high',
      scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
      estimatedCost: 250,
      description: '',
    })
  }

  const exportCSV = () => {
    const header = 'ID,Machine,Tool,Type,Status,Priority,ScheduledAt,EstimatedCost,Description'
    const rows = records.map(r => `${r.id},${r.machineId},${r.toolId || ''},${r.type},${r.status},${r.priority},${r.scheduledAt},${r.estimatedCost},"${r.description}"`)
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'ps025_maintenance_schedule.csv'
    a.click()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Predictive Maintenance</h1>
          <p className="text-sm text-slate-500 mt-0.5">Schedules, recommendations & work orders · <span className="text-amber-400">SIMULATED DATA</span></p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs" onClick={exportCSV}>
            <Download size={13} />Export CSV
          </button>
          <button className="btn-primary text-xs" onClick={() => setShowModal(true)}>
            <Plus size={13} />Schedule Maintenance
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="card-title">Overdue Tasks</div>
            <div className="text-2xl font-bold text-red-400">{overdue.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Requires urgent action</div>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <div className="card-title">Upcoming</div>
            <div className="text-2xl font-bold text-amber-400">{upcoming.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Next 7 days</div>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="card-title">Completed</div>
            <div className="text-2xl font-bold text-emerald-400">{completed.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">This month</div>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="card-title">Est. Pending Cost</div>
            <div className="text-2xl font-bold text-cyan-400">₹{totalCost.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-0.5">Simulated estimate</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'overdue', 'upcoming', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors border', {
              'bg-cyan-500/20 text-cyan-400 border-cyan-500/40': filter === f,
              'text-slate-400 border-navy-600 hover:border-navy-500 hover:text-slate-200': filter !== f,
            })}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-700 flex items-center justify-between">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2">
            <CalendarClock size={16} className="text-cyan-400" />
            Maintenance Operations & Tool Replacement Schedule
          </h3>
          <span className="sim-badge">SIMULATED</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-navy-700">
              <tr>
                {['ID', 'Machine', 'Target Tool', 'Type', 'Status', 'Priority', 'Scheduled Date', 'Est. Cost', 'Description'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const SIcon = STATUS_ICONS[m.status] || Clock
                return (
                  <tr key={m.id} className="border-b border-navy-800 hover:bg-navy-700/30 transition-colors">
                    <td className="table-td font-mono text-cyan-400 text-xs">{m.id}</td>
                    <td className="table-td text-slate-200 font-medium">{m.machineId}</td>
                    <td className="table-td text-slate-400 font-mono text-xs">{m.toolId || 'Whole Machine'}</td>
                    <td className="table-td text-xs text-slate-400 capitalize">{m.type}</td>
                    <td className="table-td">
                      <span className={clsx('inline-flex items-center gap-1 text-xs font-semibold', STATUS_COLORS[m.status])}>
                        <SIcon size={13} />
                        <span className="capitalize">{m.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="table-td">
                      <span className={PRIORITY_BADGES[m.priority] || 'badge-warning'}>{m.priority}</span>
                    </td>
                    <td className="table-td text-xs text-slate-400 whitespace-nowrap">{m.scheduledAt}</td>
                    <td className="table-td text-sm font-semibold text-slate-200">₹{m.estimatedCost.toLocaleString()}</td>
                    <td className="table-td text-xs text-slate-400 max-w-xs">{m.description}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md space-y-4">
            <h3 className="font-bold text-slate-100 text-lg">Schedule Predictive Maintenance</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="label">Machine ID</label>
                <select className="input" value={newRec.machineId} onChange={e => setNewRec({ ...newRec, machineId: e.target.value })}>
                  <option value="MC-01">MC-01 (Haas VF-2SS)</option>
                  <option value="MC-02">MC-02 (Mazak Integrex 400)</option>
                  <option value="MC-03">MC-03 (DMG Mori NHX 5000)</option>
                  <option value="MC-04">MC-04 (Okuma Genos M560)</option>
                </select>
              </div>
              <div>
                <label className="label">Target Tool ID (Optional)</label>
                <select className="input" value={newRec.toolId} onChange={e => setNewRec({ ...newRec, toolId: e.target.value })}>
                  <option value="TL-001">TL-001 (Carbide End Mill 12mm)</option>
                  <option value="TL-002">TL-002 (Twist Drill 8mm)</option>
                  <option value="TL-003">TL-003 (Indexable Insert CNMG)</option>
                  <option value="TL-004">TL-004 (Ball Nose 10mm)</option>
                  <option value="TL-005">TL-005 (Face Mill 50mm)</option>
                  <option value="TL-006">TL-006 (Thread Tap M10)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Priority</label>
                  <select className="input" value={newRec.priority} onChange={e => setNewRec({ ...newRec, priority: e.target.value as any })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="label">Estimated Cost (₹)</label>
                  <input type="number" className="input" value={newRec.estimatedCost} onChange={e => setNewRec({ ...newRec, estimatedCost: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="label">Scheduled Date & Time</label>
                <input type="text" className="input" value={newRec.scheduledAt} onChange={e => setNewRec({ ...newRec, scheduledAt: e.target.value })} />
              </div>
              <div>
                <label className="label">Work Description</label>
                <textarea className="input h-20" placeholder="Describe the maintenance action..." value={newRec.description} onChange={e => setNewRec({ ...newRec, description: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-secondary text-xs" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary text-xs">Create Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
