import { useMemo, useState } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Cpu, Wrench, AlertTriangle, CheckCircle, TrendingDown, Clock, Zap, Activity, BrainCircuit, Calendar, RefreshCw } from 'lucide-react'
import clsx from 'clsx'
import { DEMO_MACHINES, DEMO_TOOLS, DEMO_STATS, DEMO_ALERTS, AI_INSIGHTS, generateTrendData } from '../hooks/demoData'

function KPICard({ label, value, sub, icon: Icon, color, trend }: any) {
  return (
    <div className="card flex items-start gap-3 hover:border-cyan-500/30 transition-all duration-200">
      <div className={clsx('p-2.5 rounded-lg shrink-0', color)}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="card-title">{label}</div>
        <div className="text-xl font-bold text-slate-100">{value}</div>
        {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
        {trend !== undefined && (
          <div className={clsx('text-xs mt-1 font-medium', trend > 0 ? 'text-emerald-400' : 'text-red-400')}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last shift
          </div>
        )}
      </div>
    </div>
  )
}

const CHART_STYLE = { background: '#0d1526', border: '1px solid #1e3356', borderRadius: '8px', color: '#f8fafc', fontSize: 11 }

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const trendData = useMemo(() => generateTrendData(24), [refreshKey])
  const machineUtil = DEMO_MACHINES.map(m => ({ name: m.id, utilization: m.utilization }))
  const unack = DEMO_ALERTS.filter(a => !a.acknowledged)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            PS-025 · Sakthi Hackathon 2.0 · <span className="text-amber-400 font-semibold">DEMO / SIMULATED DATA</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Activity size={12} className="text-emerald-400 animate-pulse" />
            Live · {new Date().toLocaleTimeString('en-IN')}
          </div>
          <button className="btn-secondary text-xs" onClick={() => setRefreshKey(k => k + 1)}>
            <RefreshCw size={13} />Refresh
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard label="Total Machines" value={DEMO_STATS.totalMachines} icon={Cpu} color="bg-blue-500/10 text-blue-400" sub={`${DEMO_STATS.activeMachines} active`} />
        <KPICard label="Healthy Tools" value={DEMO_STATS.healthyTools} icon={CheckCircle} color="bg-emerald-500/10 text-emerald-400" sub={`of ${DEMO_STATS.totalTools} total`} />
        <KPICard label="Warning Tools" value={DEMO_STATS.warningTools} icon={AlertTriangle} color="bg-amber-500/10 text-amber-400" />
        <KPICard label="Critical Tools" value={DEMO_STATS.criticalTools} icon={AlertTriangle} color="bg-red-500/10 text-red-400" />
        <KPICard label="Avg Tool Health" value={`${DEMO_STATS.avgToolHealth.toFixed(1)}%`} icon={Activity} color="bg-cyan-500/10 text-cyan-400" trend={-4.2} />
        <KPICard label="Predicted Failures" value={DEMO_STATS.predictedFailures} icon={TrendingDown} color="bg-red-500/10 text-red-400" sub="next 24 h" />
        <KPICard label="Avg RUL" value={`${DEMO_STATS.avgRUL.toFixed(0)} min`} icon={Clock} color="bg-purple-500/10 text-purple-400" />
        <KPICard label="Maintenance Due" value={DEMO_STATS.maintenanceDue} icon={Calendar} color="bg-orange-500/10 text-orange-400" />
        <KPICard label="Active Machines" value={DEMO_STATS.activeMachines} icon={Zap} color="bg-green-500/10 text-green-400" sub="online now" />
        <KPICard label="AI Insights" value="5 New" icon={BrainCircuit} color="bg-indigo-500/10 text-indigo-400" sub="simulated" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-200">Tool Health & RUL Trend</h3>
              <p className="text-xs text-slate-500">Last 24 hours</p>
            </div>
            <span className="sim-badge">SIMULATED</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gHealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRUL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3356" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} interval={3} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={CHART_STYLE} />
              <Area type="monotone" dataKey="toolHealth" name="Health %" stroke="#06b6d4" fill="url(#gHealth)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="rul" name="RUL (min)" stroke="#a855f7" fill="url(#gRUL)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-200">Machine Utilization</h3>
              <p className="text-xs text-slate-500">Current shift</p>
            </div>
            <span className="sim-badge">SIMULATED</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={machineUtil}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3356" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={CHART_STYLE} formatter={(v: any) => [`${v}%`, 'Utilization']} />
              <Bar dataKey="utilization" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Status */}
        <div className="card">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2"><Cpu size={15} className="text-cyan-400" />Machine Status</h3>
          <div className="space-y-2">
            {DEMO_MACHINES.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-navy-700" style={{ background: '#0d1526' }}>
                <div className={clsx('w-2.5 h-2.5 rounded-full shrink-0', {
                  'bg-emerald-400 animate-pulse': m.status === 'running',
                  'bg-amber-400': m.status === 'idle',
                  'bg-orange-400': m.status === 'maintenance',
                  'bg-slate-500': m.status === 'offline',
                })} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200 truncate">{m.name}</div>
                  <div className="text-xs text-slate-500">{m.id} · {m.utilization}% util</div>
                </div>
                <span className={clsx('text-xs font-semibold capitalize', {
                  'text-emerald-400': m.status === 'running',
                  'text-amber-400': m.status === 'idle',
                  'text-orange-400': m.status === 'maintenance',
                  'text-slate-400': m.status === 'offline',
                })}>{m.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2"><AlertTriangle size={15} className="text-red-400" />Recent Alerts</h3>
            <span className="text-xs text-red-400 font-semibold">{unack.length} Unread</span>
          </div>
          <div className="space-y-2">
            {DEMO_ALERTS.map(a => (
              <div key={a.id} className={clsx('p-3 rounded-lg border', {
                'border-red-900/50': a.severity === 'critical',
                'border-amber-900/50': a.severity === 'warning',
                'border-navy-700': a.severity === 'info',
              })} style={{ background: a.severity === 'critical' ? 'rgba(239,68,68,0.05)' : a.severity === 'warning' ? 'rgba(245,158,11,0.05)' : '#0d1526' }}>
                <div className="text-sm font-medium text-slate-200">{a.title}</div>
                <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.message}</div>
                <div className="text-xs text-slate-600 mt-1">{a.machineId} · {new Date(a.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit size={15} className="text-indigo-400" />
            <h3 className="font-semibold text-slate-200">AI Operational Insights</h3>
          </div>
          <div className="space-y-2">
            {AI_INSIGHTS.map((insight, i) => (
              <div key={i} className="p-3 rounded-lg border border-indigo-900/40" style={{ background: 'rgba(99,102,241,0.05)' }}>
                <p className="text-xs text-slate-300 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-3 text-center">⚠️ AI insights are simulated for demonstration</p>
        </div>
      </div>

      {/* Tool Health Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-700">
          <h3 className="font-semibold text-slate-200">Tool Fleet Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-navy-700">
              <tr>
                {['Tool ID', 'Name', 'Machine', 'Status', 'Health', 'Wear %', 'Est. RUL'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEMO_TOOLS.map(t => (
                <tr key={t.id} className="border-b border-navy-800 hover:bg-navy-700/30 transition-colors">
                  <td className="table-td font-mono text-cyan-400">{t.id}</td>
                  <td className="table-td text-slate-200">{t.name}</td>
                  <td className="table-td text-slate-400">{t.machineId}</td>
                  <td className="table-td">
                    <span className={`badge-${t.status}`}>{t.status}</span>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-navy-700 rounded-full overflow-hidden">
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
                  <td className={clsx('table-td font-semibold', {
                    'text-red-400': t.estimatedRUL < 30,
                    'text-amber-400': t.estimatedRUL >= 30 && t.estimatedRUL < 80,
                    'text-emerald-400': t.estimatedRUL >= 80,
                  })}>{t.estimatedRUL > 0 ? `${t.estimatedRUL} min` : 'Expired'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
