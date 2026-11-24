import { useState } from 'react'
import { Zap, AlertTriangle, Info, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react'
import clsx from 'clsx'

interface Suggestion {
  machine: string
  tool: string
  operation: string
  current: { spindle: number; feed: number; depth: number; speed: number }
  suggested: { spindle: number; feed: number; depth: number; speed: number }
  rulGain: number
  productivityGain: number
  costSaving: number
}

const OPTIMIZATION_SUGGESTIONS: Suggestion[] = [
  {
    machine: 'MC-01',
    tool: 'TL-001 (End Mill 12mm)',
    operation: 'Face Profiling',
    current: { spindle: 4500, feed: 850, depth: 2.5, speed: 200 },
    suggested: { spindle: 4200, feed: 810, depth: 2.1, speed: 188 },
    rulGain: 28,
    productivityGain: 4.2,
    costSaving: 1450,
  },
  {
    machine: 'MC-02',
    tool: 'TL-003 (Turning Insert)',
    operation: 'Outer Diameter Roughing',
    current: { spindle: 3200, feed: 620, depth: 1.8, speed: 160 },
    suggested: { spindle: 2950, feed: 575, depth: 1.5, speed: 148 },
    rulGain: 35,
    productivityGain: 3.1,
    costSaving: 2100,
  },
  {
    machine: 'MC-01',
    tool: 'TL-002 (Twist Drill 8mm)',
    operation: 'Deep Hole Drilling',
    current: { spindle: 2800, feed: 340, depth: 15.0, speed: 70 },
    suggested: { spindle: 2600, feed: 310, depth: 15.0, speed: 65 },
    rulGain: 19,
    productivityGain: 2.5,
    costSaving: 880,
  },
]

export default function OptimizationPage() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [applied, setApplied] = useState(false)
  const item = OPTIMIZATION_SUGGESTIONS[selectedIdx]

  const handleApply = () => {
    setApplied(true)
    setTimeout(() => setApplied(false), 3000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
            <Zap size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">AI Machining Optimization</h1>
            <p className="text-sm text-slate-500">Autonomous cutting parameter recommendation engine · <span className="text-amber-400 font-semibold">SIMULATED / DEMO ONLY</span></p>
          </div>
        </div>
      </div>

      <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg flex gap-2">
        <AlertTriangle size={15} className="text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-300">
          <strong>Safety Notice:</strong> All optimization suggestions are computed using theoretical wear degradation curves and simulated demo models. Never implement suggested parameters without prior inspection and confirmation from a certified process/machining engineer. Parameter boundaries remain strictly locked within configured machine and tool safety thresholds.
        </p>
      </div>

      {/* Target Selector */}
      <div className="flex gap-3 flex-wrap">
        {OPTIMIZATION_SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => { setSelectedIdx(idx); setApplied(false) }}
            className={clsx('px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all text-left', {
              'bg-yellow-500/10 text-yellow-400 border-yellow-500/40': selectedIdx === idx,
              'text-slate-400 border-navy-600 hover:border-navy-500 hover:text-slate-200': selectedIdx !== idx,
            })}
          >
            <div>{s.machine} · {s.tool}</div>
            <div className="text-xs opacity-60 font-normal">{s.operation}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparison Table */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-200">Parameter Comparison (Current vs AI Optimized)</h3>
            <span className="sim-badge">SIMULATED</span>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-700">
                {['Parameter', 'Current', 'AI Suggested', 'Delta'].map(h => (
                  <th key={h} className="text-left px-2 py-2 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Spindle Speed', current: `${item.current.spindle} RPM`, suggested: `${item.suggested.spindle} RPM`, diff: item.suggested.spindle - item.current.spindle, unit: 'RPM' },
                { label: 'Feed Rate', current: `${item.current.feed} mm/min`, suggested: `${item.suggested.feed} mm/min`, diff: item.suggested.feed - item.current.feed, unit: 'mm/min' },
                { label: 'Depth of Cut', current: `${item.current.depth} mm`, suggested: `${item.suggested.depth} mm`, diff: +(item.suggested.depth - item.current.depth).toFixed(1), unit: 'mm' },
                { label: 'Cutting Speed', current: `${item.current.speed} m/min`, suggested: `${item.suggested.speed} m/min`, diff: item.suggested.speed - item.current.speed, unit: 'm/min' },
              ].map(r => (
                <tr key={r.label} className="border-b border-navy-800 last:border-0">
                  <td className="px-2 py-3 text-slate-400 font-medium">{r.label}</td>
                  <td className="px-2 py-3 font-mono text-slate-300">{r.current}</td>
                  <td className="px-2 py-3 font-mono text-cyan-400 font-bold">{r.suggested}</td>
                  <td className="px-2 py-3 font-semibold text-xs text-emerald-400">
                    {r.diff > 0 ? `+${r.diff}` : r.diff} {r.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pt-2">
            <button
              onClick={handleApply}
              className={clsx('btn-primary w-full justify-center py-2.5', {
                'bg-emerald-500 text-navy-900': applied,
              })}
            >
              {applied ? (
                <>
                  <CheckCircle size={15} />
                  Parameters Dispatched to Machine Controller (Simulated)
                </>
              ) : (
                <>
                  <RefreshCw size={15} />
                  Deploy Optimized Profile to {item.machine}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Benefits & Insights */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="card-title">RUL Extended By</div>
              <div className="text-3xl font-bold text-cyan-400">+{item.rulGain} <span className="text-sm font-normal text-slate-500">min</span></div>
              <div className="text-xs text-slate-500 mt-1">Est. tool life increase</div>
            </div>
            <div className="card">
              <div className="card-title">Productivity Gain</div>
              <div className="text-3xl font-bold text-emerald-400">+{item.productivityGain}%</div>
              <div className="text-xs text-slate-500 mt-1">Throughput efficiency</div>
            </div>
            <div className="card">
              <div className="card-title">Est. Cost Saving</div>
              <div className="text-3xl font-bold text-yellow-400">₹{item.costSaving.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">Per 1,000 components</div>
            </div>
          </div>

          <div className="card space-y-3">
            <h4 className="font-semibold text-slate-200 flex items-center gap-2">
              <TrendingUp size={16} className="text-cyan-400" />
              Optimization Rationale & Model Evidence
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              By reducing spindle speed by ~6.6% and trimming depth of cut by 0.4 mm, the thermal gradient at the tool-workpiece interface drops from 72°C to approximately 64°C. This significantly decelerates flank wear propagation while keeping overall MRR (Material Removal Rate) within 96% of peak target.
            </p>
            <div className="p-3 bg-navy-900 rounded-lg border border-navy-700 text-xs text-slate-400 space-y-1">
              <div>• Safety Interlock: Spindle limits [500 - 10,000 RPM] → <strong>Compliant (4,200 RPM)</strong></div>
              <div>• Max Feed Limit: 1,200 mm/min → <strong>Compliant (810 mm/min)</strong></div>
              <div>• Power Ceiling: 18.0 kW → <strong>Compliant (12.4 kW predicted)</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
