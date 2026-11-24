import { useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Cpu, Thermometer, Zap, Activity, Upload, RefreshCw } from 'lucide-react'
import clsx from 'clsx'
import { DEMO_MACHINES, generateMachineHistory } from '../hooks/demoData'

const CHART_STYLE = { background: '#0d1526', border: '1px solid #1e3356', borderRadius: '8px', color: '#f8fafc', fontSize: 11 }

export default function MachinesPage() {
  const [selected, setSelected] = useState(DEMO_MACHINES[0].id)
  const [refreshKey, setRefreshKey] = useState(0)

  const machine = DEMO_MACHINES.find(m => m.id === selected)!
  const history = useMemo(() => generateMachineHistory(machine, 20), [machine, refreshKey])

  const params = [
    { label: 'Spindle Speed', value: machine.spindleSpeed > 0 ? `${machine.spindleSpeed.toLocaleString()} RPM` : '—', color: 'text-cyan-400' },
    { label: 'Feed Rate', value: machine.feedRate > 0 ? `${machine.feedRate} mm/min` : '—', color: 'text-blue-400' },
    { label: 'Cutting Temp', value: `${machine.cuttingTemp} °C`, color: machine.cuttingTemp > 85 ? 'text-red-400' : 'text-orange-400' },
    { label: 'Vibration', value: `${machine.vibration} g`, color: machine.vibration > 0.4 ? 'text-amber-400' : 'text-green-400' },
    { label: 'Cutting Force', value: machine.cuttingForce > 0 ? `${machine.cuttingForce} N` : '—', color: 'text-purple-400' },
    { label: 'Power Consumption', value: `${machine.powerConsumption} kW`, color: 'text-yellow-400' },
    { label: 'Operating Hours', value: `${machine.operatingHours.toLocaleString()} h`, color: 'text-slate-400' },
    { label: 'Utilization', value: `${machine.utilization}%`, color: machine.utilization > 80 ? 'text-emerald-400' : machine.utilization > 50 ? 'text-amber-400' : 'text-slate-400' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Machine Monitoring</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time sensor data · <span className="text-amber-400">SIMULATED</span></p>
        </div>
        <div className="flex gap-2">
          <label className="btn-secondary cursor-pointer text-xs">
            <Upload size={13} />Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={() => alert('CSV import feature: Connect to backend /api/machines/import-csv endpoint. Demo mode active.')} />
          </label>
          <button className="btn-primary text-xs" onClick={() => setRefreshKey(k => k + 1)}>
            <RefreshCw size={13} />Refresh Data
          </button>
        </div>
      </div>

      {/* Machine Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {DEMO_MACHINES.map(m => (
          <button key={m.id} onClick={() => setSelected(m.id)}
            className={clsx('card text-left transition-all border-2', {
              'border-cyan-500/60': selected === m.id,
              'border-transparent hover:border-navy-500': selected !== m.id,
            })}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-400">{m.id}</span>
              <span className={`badge-${m.status}`}>{m.status}</span>
            </div>
            <div className="text-sm font-semibold text-slate-200 truncate">{m.name}</div>
            <div className="text-xs text-slate-500 truncate">{m.type}</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-navy-700 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${m.utilization}%` }} />
              </div>
              <span className="text-xs text-slate-400">{m.utilization}%</span>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters */}
        <div className="card">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2 mb-4">
            <Cpu size={15} className="text-cyan-400" />{machine.name}
          </h3>
          <div className="space-y-0.5">
            {params.map(p => (
              <div key={p.label} className="flex items-center justify-between py-2 border-b border-navy-700 last:border-0">
                <span className="text-xs text-slate-500">{p.label}</span>
                <span className={clsx('text-sm font-semibold', p.color)}>{p.value}</span>
              </div>
            ))}
          </div>
          {machine.vibration > 0.4 && (
            <div className="mt-3 p-2 rounded-lg border border-amber-800/50 bg-amber-900/20 text-xs text-amber-300">
              ⚠️ Vibration above normal limit (0.40 g). Inspect spindle bearing.
            </div>
          )}
          {machine.status === 'maintenance' && (
            <div className="mt-3 p-2 rounded-lg border border-orange-800/50 bg-orange-900/20 text-xs text-orange-300">
              🔧 Machine is under maintenance. Production paused.
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Spindle Speed — Last 60 min <span className="sim-badge ml-2">SIMULATED</span></h4>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3356" />
                <XAxis dataKey="t" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={CHART_STYLE} />
                <Area type="monotone" dataKey="rpm" name="RPM" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5"><Thermometer size={12} className="text-orange-400" />Temperature <span className="sim-badge">SIM</span></h4>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3356" />
                  <XAxis dataKey="t" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Area type="monotone" dataKey="temp" name="°C" stroke="#f97316" fill="#f97316" fillOpacity={0.1} strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5"><Activity size={12} className="text-purple-400" />Vibration <span className="sim-badge">SIM</span></h4>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3356" />
                  <XAxis dataKey="t" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Area type="monotone" dataKey="vib" name="g" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5"><Zap size={12} className="text-yellow-400" />Power (kW) <span className="sim-badge">SIM</span></h4>
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={history}>
                  <XAxis dataKey="t" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Area type="monotone" dataKey="power" name="kW" stroke="#eab308" fill="#eab308" fillOpacity={0.1} strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5"><Zap size={12} className="text-indigo-400" />Cutting Force (N) <span className="sim-badge">SIM</span></h4>
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={history}>
                  <XAxis dataKey="t" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Area type="monotone" dataKey="force" name="N" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
