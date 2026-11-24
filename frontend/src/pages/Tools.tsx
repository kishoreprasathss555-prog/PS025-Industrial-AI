import { useState } from 'react'
import { Wrench, Clock, AlertTriangle, Download } from 'lucide-react'
import clsx from 'clsx'
import { DEMO_TOOLS } from '../hooks/demoData'
import type { Tool } from '../types'

function HealthGauge({ value }: { value: number }) {
  const r = 38, cx = 50, cy = 52
  const totalArc = 2 * Math.PI * r * 0.75
  const filled = totalArc * (value / 100)
  const color = value > 70 ? '#10b981' : value > 40 ? '#f59e0b' : '#ef4444'
  return (
    <svg viewBox="0 0 100 70" className="w-32 h-24">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e3356" strokeWidth={8}
        strokeDasharray={`${totalArc} ${2 * Math.PI * r}`} strokeLinecap="round"
        style={{ transform: 'rotate(135deg)', transformOrigin: '50px 52px' }} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${filled} ${2 * Math.PI * r}`} strokeLinecap="round"
        style={{ transform: 'rotate(135deg)', transformOrigin: '50px 52px', transition: 'stroke-dasharray 0.6s ease' }} />
      <text x="50" y="54" textAnchor="middle" fill="#f8fafc" fontSize="18" fontWeight="bold">{value}%</text>
      <text x="50" y="66" textAnchor="middle" fill="#64748b" fontSize="8">HEALTH</text>
    </svg>
  )
}

export default function ToolsPage() {
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<Tool>(DEMO_TOOLS[0])

  const filters = [
    { key: 'all', label: 'All', count: DEMO_TOOLS.length },
    { key: 'healthy', label: 'Healthy', count: DEMO_TOOLS.filter(t => t.status === 'healthy').length },
    { key: 'warning', label: 'Warning', count: DEMO_TOOLS.filter(t => t.status === 'warning').length },
    { key: 'critical', label: 'Critical', count: DEMO_TOOLS.filter(t => t.status === 'critical').length },
    { key: 'expired', label: 'Expired', count: DEMO_TOOLS.filter(t => t.status === 'expired').length },
  ]

  const filtered = filter === 'all' ? DEMO_TOOLS : DEMO_TOOLS.filter(t => t.status === filter)

  const exportCSV = () => {
    const header = 'ID,Name,Type,Machine,Status,Health%,Wear%,Hours,RUL(min),Installed,LastReplaced'
    const rows = DEMO_TOOLS.map(t =>
      `${t.id},"${t.name}","${t.type}",${t.machineId},${t.status},${t.healthScore},${t.wearPercentage},${t.operatingHours},${t.estimatedRUL},${t.installedAt},${t.lastReplaced}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'ps025_tool_health_report.csv'
    a.click()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Tool Health Monitoring</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tool inventory & wear tracking · <span className="text-amber-400">SIMULATED DATA</span></p>
        </div>
        <button className="btn-secondary text-xs" onClick={exportCSV}>
          <Download size={13} />Export CSV Report
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border', {
              'bg-cyan-500/20 text-cyan-400 border-cyan-500/40': filter === f.key,
              'text-slate-400 border-navy-600 hover:border-navy-500 hover:text-slate-200': filter !== f.key,
            })}>
            {f.label} <span className="text-xs opacity-60">({f.count})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tool Table */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-navy-700">
                <tr>
                  {['Tool ID', 'Name', 'Machine', 'Status', 'Health', 'Wear %', 'RUL (min)'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} onClick={() => setSelected(t)}
                    className={clsx('border-b border-navy-800 cursor-pointer transition-colors', {
                      'bg-cyan-500/5': selected.id === t.id,
                      'hover:bg-navy-700/50': selected.id !== t.id,
                    })}>
                    <td className="table-td font-mono text-cyan-400 text-xs">{t.id}</td>
                    <td className="table-td text-slate-200 max-w-32 truncate">{t.name}</td>
                    <td className="table-td text-slate-400 text-xs">{t.machineId}</td>
                    <td className="table-td"><span className={`badge-${t.status}`}>{t.status}</span></td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                          <div className={clsx('h-full rounded-full', {
                            'bg-emerald-500': t.healthScore > 70,
                            'bg-amber-500': t.healthScore > 40 && t.healthScore <= 70,
                            'bg-red-500': t.healthScore <= 40,
                          })} style={{ width: `${t.healthScore}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">{t.healthScore}%</span>
                      </div>
                    </td>
                    <td className="table-td text-slate-300">{t.wearPercentage}%</td>
                    <td className={clsx('table-td font-semibold text-sm', {
                      'text-red-400': t.estimatedRUL < 30,
                      'text-amber-400': t.estimatedRUL >= 30 && t.estimatedRUL < 80,
                      'text-emerald-400': t.estimatedRUL >= 80,
                    })}>{t.estimatedRUL > 0 ? t.estimatedRUL : 'EXPIRED'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2"><Wrench size={15} className="text-cyan-400" />Tool Detail</h3>
          <div className="flex justify-center py-2">
            <HealthGauge value={selected.healthScore} />
          </div>
          <div className="text-center">
            <div className="font-semibold text-slate-100">{selected.name}</div>
            <div className="text-xs text-slate-500">{selected.id} · {selected.type}</div>
            <span className={clsx('mt-2 inline-block', `badge-${selected.status}`)}>{selected.status}</span>
          </div>

          <div className="space-y-2 pt-2 border-t border-navy-700">
            {[
              { l: 'Machine', v: selected.machineId },
              { l: 'Tool Wear', v: `${selected.wearPercentage}%` },
              { l: 'Operating Hours', v: `${selected.operatingHours} h` },
              { l: 'Estimated RUL', v: selected.estimatedRUL > 0 ? `${selected.estimatedRUL} min` : 'EXPIRED' },
              { l: 'Health Score', v: `${selected.healthScore}%` },
              { l: 'Installed', v: selected.installedAt },
              { l: 'Last Replaced', v: selected.lastReplaced },
            ].map(r => (
              <div key={r.l} className="flex justify-between text-sm">
                <span className="text-slate-500">{r.l}</span>
                <span className="text-slate-200 font-medium">{r.v}</span>
              </div>
            ))}
          </div>

          {(selected.status === 'critical' || selected.status === 'expired') && (
            <div className="p-3 rounded-lg border border-red-900/50 flex gap-2" style={{ background: 'rgba(239,68,68,0.08)' }}>
              <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-300">Immediate replacement required. Contact maintenance team. Do not continue machining.</p>
            </div>
          )}
          {selected.status === 'warning' && (
            <div className="p-3 rounded-lg border border-amber-900/50 flex gap-2" style={{ background: 'rgba(245,158,11,0.08)' }}>
              <Clock size={14} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300">Schedule replacement within 24 hours to avoid production impact.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
