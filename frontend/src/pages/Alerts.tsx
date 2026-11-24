import { useState } from 'react'
import { Bell, AlertTriangle, Thermometer, Activity, Wrench, CheckCheck, Trash2, Cpu, Filter } from 'lucide-react'
import clsx from 'clsx'
import { DEMO_ALERTS } from '../hooks/demoData'
import type { Alert } from '../types'

const ALERT_ICONS: Record<string, any> = {
  tool_wear: Wrench,
  tool_failure: AlertTriangle,
  overheating: Thermometer,
  vibration: Activity,
  maintenance: Wrench,
  critical: Cpu,
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS)
  const [severityFilter, setSeverityFilter] = useState<string>('all')

  const acknowledge = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a))
  }

  const dismiss = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id))
  }

  const acknowledgeAll = () => {
    setAlerts(alerts.map(a => ({ ...a, acknowledged: true })))
  }

  const filtered = severityFilter === 'all' ? alerts : alerts.filter(a => a.severity === severityFilter)
  const unreadCount = alerts.filter(a => !a.acknowledged).length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
            <Bell size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Alert & Anomaly Management</h1>
            <p className="text-sm text-slate-500">{unreadCount} unacknowledged issues requiring attention · <span className="text-amber-400 font-semibold">SIMULATED ALERTS</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button className="btn-secondary text-xs" onClick={acknowledgeAll}>
              <CheckCheck size={13} />Acknowledge All ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 items-center">
        <Filter size={14} className="text-slate-500 mr-1" />
        {['all', 'critical', 'warning', 'info'].map(s => (
          <button
            key={s}
            onClick={() => setSeverityFilter(s)}
            className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors border', {
              'bg-cyan-500/20 text-cyan-400 border-cyan-500/40': severityFilter === s,
              'text-slate-400 border-navy-600 hover:border-navy-500 hover:text-slate-200': severityFilter !== s,
            })}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Alert Feed */}
      <div className="space-y-3">
        {filtered.map(a => {
          const Icon = ALERT_ICONS[a.type] || Bell
          return (
            <div
              key={a.id}
              className={clsx('card border flex items-start gap-4 transition-all duration-200', {
                'border-red-900/60 bg-red-950/20': a.severity === 'critical',
                'border-amber-900/60 bg-amber-950/20': a.severity === 'warning',
                'border-navy-700 bg-navy-800': a.severity === 'info',
                'opacity-60': a.acknowledged,
              })}
            >
              <div className={clsx('p-2.5 rounded-lg shrink-0 mt-0.5', {
                'bg-red-900/50 text-red-400 border border-red-800': a.severity === 'critical',
                'bg-amber-900/50 text-amber-400 border border-amber-800': a.severity === 'warning',
                'bg-blue-900/50 text-blue-400 border border-blue-800': a.severity === 'info',
              })}>
                <Icon size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-100 text-sm">{a.title}</span>
                  {!a.acknowledged && (
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" />
                  )}
                  <span className={clsx('text-[11px] font-bold uppercase px-2 py-0.5 rounded-full border', {
                    'text-red-400 bg-red-900/30 border-red-800': a.severity === 'critical',
                    'text-amber-400 bg-amber-900/30 border-amber-800': a.severity === 'warning',
                    'text-blue-400 bg-blue-900/30 border-blue-800': a.severity === 'info',
                  })}>
                    {a.severity}
                  </span>
                </div>

                <p className="text-sm text-slate-300 mt-1">{a.message}</p>

                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                  <span>Machine: <strong className="text-slate-300">{a.machineId}</strong></span>
                  {a.toolId && <span>Tool: <strong className="text-slate-300">{a.toolId}</strong></span>}
                  <span>Time: {new Date(a.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  {a.acknowledged && <span className="text-emerald-400 font-semibold">✓ Acknowledged</span>}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!a.acknowledged && (
                  <button
                    onClick={() => acknowledge(a.id)}
                    className="p-1.5 rounded-lg hover:bg-navy-700 text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Acknowledge alert"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
                <button
                  onClick={() => dismiss(a.id)}
                  className="p-1.5 rounded-lg hover:bg-navy-700 text-slate-400 hover:text-red-400 transition-colors"
                  title="Dismiss alert"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="card text-center py-12 text-slate-500">
            <Bell size={36} className="mx-auto mb-2 opacity-30" />
            <div className="font-semibold text-slate-400">No alerts match the current filter</div>
            <div className="text-xs mt-1">System telemetry within normal operational thresholds.</div>
          </div>
        )}
      </div>
    </div>
  )
}
