import { useState, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { BrainCircuit, Play, AlertTriangle, CheckCircle, Clock, TrendingDown, Info, Download } from 'lucide-react'
import clsx from 'clsx'
import api from '../api/client'

const FEATURE_IMPORTANCE = [
  { name: 'Tool Wear', value: 28.4 },
  { name: 'Operating Time', value: 22.1 },
  { name: 'Cutting Temp', value: 16.8 },
  { name: 'Vibration', value: 12.5 },
  { name: 'Cutting Force', value: 9.3 },
  { name: 'Feed Rate', value: 5.7 },
  { name: 'Spindle Speed', value: 3.2 },
  { name: 'Power', value: 2.0 },
]

const MODEL_METRICS = { mae: 8.4, rmse: 11.2, r2: 0.891 }

const DEFAULT_INPUT = {
  toolType: 'End Mill', toolId: 'TL-001',
  spindleSpeed: 4500, feedRate: 850, depthOfCut: 2.5,
  cuttingTemp: 72, vibration: 0.42, cuttingForce: 1850,
  powerConsumption: 14.2, operatingTime: 48, toolWear: 18,
}

function demoPredict(inputs: typeof DEFAULT_INPUT) {
  const { toolWear: wear, operatingTime: time, cuttingTemp: temp, vibration: vib } = inputs
  const degradation = (wear * 0.40 + Math.min(time / 300, 1) * 100 * 0.30 + Math.min(temp / 150, 1) * 100 * 0.20 + Math.min(vib, 1) * 100 * 0.10) / 100
  const rul = Math.max(5, Math.round(280 * (1 - Math.min(degradation, 0.95))))
  const health = Math.max(5, Math.round(100 - wear * 0.9 - Math.min(time / 300, 1) * 20))
  const failProb = Math.min(95, Math.round(wear * 0.8 + vib * 20 + (temp / 150) * 15))
  const risk: any = failProb > 70 ? 'critical' : failProb > 45 ? 'high' : failProb > 25 ? 'medium' : 'low'
  const wearEst = Math.round(wear + 5 * degradation * 10) / 10
  return { rul, health_percentage: health, failure_probability: failProb, risk_level: risk, wear_estimate: wearEst, is_simulated: true, confidence: 0.73, metrics: MODEL_METRICS }
}

const CHART_STYLE = { background: '#0d1526', border: '1px solid #1e3356', borderRadius: '8px', color: '#f8fafc', fontSize: 11 }
const RISK_STYLES: Record<string, string> = {
  low: 'text-emerald-400 bg-emerald-900/30 border-emerald-800',
  medium: 'text-amber-400 bg-amber-900/30 border-amber-800',
  high: 'text-orange-400 bg-orange-900/30 border-orange-800',
  critical: 'text-red-400 bg-red-900/30 border-red-800',
}

type PredResult = ReturnType<typeof demoPredict>

export default function PredictionsPage() {
  const [inputs, setInputs] = useState(DEFAULT_INPUT)
  const [result, setResult] = useState<PredResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<Array<PredResult & { ts: string; tool: string }>>([])

  const runPrediction = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.post('/predictions/predict', inputs)
      const res = r.data
      setResult(res)
      setHistory(h => [{ ...res, ts: new Date().toLocaleTimeString('en-IN'), tool: inputs.toolType }, ...h.slice(0, 9)])
    } catch {
      // offline fallback
      await new Promise(resolve => setTimeout(resolve, 900))
      const res = demoPredict(inputs)
      setResult(res)
      setHistory(h => [{ ...res, ts: new Date().toLocaleTimeString('en-IN'), tool: inputs.toolType }, ...h.slice(0, 9)])
    }
    setLoading(false)
  }, [inputs])

  const exportHistory = () => {
    if (!history.length) return
    const header = 'Time,Tool,RUL(min),Health%,FailProb%,Risk,WearEstimate,Simulated'
    const rows = history.map(r => `${r.ts},"${r.tool}",${r.rul},${r.health_percentage},${r.failure_probability},${r.risk_level},${r.wear_estimate},${r.is_simulated}`)
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'ps025_prediction_history.csv'
    a.click()
  }

  const fields = [
    { key: 'toolType', label: 'Tool Type', type: 'select', options: ['End Mill', 'Drill Bit', 'Turning Insert', 'Ball Mill', 'Face Mill', 'Tap'] },
    { key: 'spindleSpeed', label: 'Spindle Speed (RPM)', type: 'number', min: 0, max: 20000 },
    { key: 'feedRate', label: 'Feed Rate (mm/min)', type: 'number', min: 0, max: 5000 },
    { key: 'depthOfCut', label: 'Depth of Cut (mm)', type: 'number', min: 0.1, max: 20, step: 0.1 },
    { key: 'cuttingTemp', label: 'Cutting Temp (°C)', type: 'number', min: 20, max: 250 },
    { key: 'vibration', label: 'Vibration (g)', type: 'number', min: 0, max: 2, step: 0.01 },
    { key: 'cuttingForce', label: 'Cutting Force (N)', type: 'number', min: 0, max: 10000 },
    { key: 'powerConsumption', label: 'Power Consumption (kW)', type: 'number', min: 0, max: 50, step: 0.1 },
    { key: 'operatingTime', label: 'Operating Time (h)', type: 'number', min: 0, max: 500 },
    { key: 'toolWear', label: 'Tool Wear (%)', type: 'number', min: 0, max: 100 },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BrainCircuit size={22} className="text-indigo-400" />
          <div>
            <h1 className="text-xl font-bold text-slate-100">AI Predictive Tool Life</h1>
            <p className="text-sm text-slate-500">ML-based RUL estimation · <span className="text-amber-400 font-semibold">ALL PREDICTIONS SIMULATED</span></p>
          </div>
        </div>
        {history.length > 0 && (
          <button className="btn-secondary text-xs" onClick={exportHistory}>
            <Download size={13} />Export History CSV
          </button>
        )}
      </div>

      <div className="p-3 rounded-lg border border-indigo-800/40 flex gap-2" style={{ background: 'rgba(99,102,241,0.08)' }}>
        <Info size={14} className="text-indigo-400 mt-0.5 shrink-0" />
        <p className="text-xs text-indigo-300">
          This module uses a <strong>demo ML model</strong> trained on synthetic data. Predictions are illustrative only and not validated for production use.
          Real predictions require integration with actual CNC sensor hardware (ESP32 / IoT — planned hardware integration).
          All outputs are labelled <span className="text-amber-400 font-semibold">SIMULATED</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="card space-y-3 lg:col-span-1 overflow-y-auto max-h-[80vh]">
          <h3 className="font-semibold text-slate-200 sticky top-0 pb-2 border-b border-navy-700" style={{ background: '#0d1526' }}>Prediction Inputs</h3>
          {fields.map(f => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              {f.type === 'select' ? (
                <select className="input" value={(inputs as any)[f.key]}
                  onChange={e => setInputs(p => ({ ...p, [f.key]: e.target.value }))}>
                  {f.options!.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type="number" className="input" value={(inputs as any)[f.key]}
                  min={f.min} max={f.max} step={f.step || 1}
                  onChange={e => setInputs(p => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))} />
              )}
            </div>
          ))}
          <button onClick={runPrediction} disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2 sticky bottom-0">
            <Play size={14} />{loading ? 'Predicting...' : 'Run AI Prediction'}
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="card">
                  <div className="card-title">Remaining Useful Life</div>
                  <div className="text-3xl font-bold text-cyan-400">{result.rul} <span className="text-base font-normal text-slate-500">min</span></div>
                  <div className="text-xs text-amber-500 mt-1">⚠️ SIMULATED</div>
                </div>
                <div className="card">
                  <div className="card-title">Tool Health</div>
                  <div className={clsx('text-3xl font-bold', result.health_percentage > 70 ? 'text-emerald-400' : result.health_percentage > 40 ? 'text-amber-400' : 'text-red-400')}>
                    {result.health_percentage}%
                  </div>
                  <div className="mt-2 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                    <div className={clsx('h-full rounded-full', result.health_percentage > 70 ? 'bg-emerald-500' : result.health_percentage > 40 ? 'bg-amber-500' : 'bg-red-500')}
                      style={{ width: `${result.health_percentage}%`, transition: 'width 0.6s' }} />
                  </div>
                </div>
                <div className="card">
                  <div className="card-title">Failure Probability</div>
                  <div className={clsx('text-3xl font-bold', result.failure_probability > 60 ? 'text-red-400' : result.failure_probability > 35 ? 'text-amber-400' : 'text-emerald-400')}>
                    {result.failure_probability}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Confidence: {(result.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="card-title">Risk Assessment</div>
                    <span className={clsx('px-3 py-1 rounded-full text-sm font-bold border capitalize', RISK_STYLES[result.risk_level])}>
                      {result.risk_level} Risk
                    </span>
                  </div>
                  <div className="text-sm text-slate-400">
                    Wear Estimate: <span className="text-cyan-400 font-semibold">{result.wear_estimate}%</span>
                  </div>
                </div>
                {(result.risk_level === 'critical' || result.risk_level === 'high') && (
                  <div className="mt-3 flex items-start gap-2 p-3 rounded-lg border border-red-900/50" style={{ background: 'rgba(239,68,68,0.08)' }}>
                    <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-300">
                      {result.risk_level === 'critical' ? 'CRITICAL: Immediate tool replacement recommended. Stop machining to avoid tool failure.' : 'HIGH RISK: Schedule tool replacement within the next 24 hours.'}
                      <span className="block mt-1 text-slate-500">⚠️ This is a simulated prediction. Verify with actual sensor readings before action.</span>
                    </p>
                  </div>
                )}
                {result.risk_level === 'low' && (
                  <div className="mt-3 flex items-start gap-2 p-3 rounded-lg border border-emerald-900/50" style={{ background: 'rgba(16,185,129,0.08)' }}>
                    <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-emerald-300">Tool condition is good. No immediate action required. Continue monitoring regularly.</p>
                  </div>
                )}
                <div className="mt-3 p-3 rounded-lg border border-indigo-900/30" style={{ background: 'rgba(99,102,241,0.08)' }}>
                  <p className="text-xs text-indigo-300">⚠️ <strong>SIMULATED PREDICTION</strong> — Generated by demo ML model using synthetic training data. For demonstration only.</p>
                </div>
              </div>

              {/* Model Metrics */}
              <div className="card">
                <h4 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />Model Performance Metrics <span className="sim-badge">DEMO MODEL</span>
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'MAE', value: MODEL_METRICS.mae, unit: 'min', color: 'text-cyan-400' },
                    { label: 'RMSE', value: MODEL_METRICS.rmse, unit: 'min', color: 'text-blue-400' },
                    { label: 'R² Score', value: MODEL_METRICS.r2, unit: '', color: 'text-indigo-400' },
                  ].map(m => (
                    <div key={m.label} className="text-center p-3 rounded-lg" style={{ background: '#0d1526' }}>
                      <div className={clsx('text-2xl font-bold', m.color)}>{m.value}{m.unit}</div>
                      <div className="text-xs text-slate-500 mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center h-56 text-center">
              <BrainCircuit size={44} className="text-indigo-400/30 mb-3" />
              <p className="text-slate-500 text-sm">Configure parameters on the left and click</p>
              <p className="text-slate-400 font-semibold text-sm">Run AI Prediction</p>
              <p className="text-xs text-slate-600 mt-2">The model will estimate RUL, health %, and failure risk</p>
            </div>
          )}

          {/* Feature Importance */}
          <div className="card">
            <h4 className="font-semibold text-slate-200 mb-4">Feature Importance <span className="sim-badge">DEMO MODEL</span></h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={FEATURE_IMPORTANCE} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3356" />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} width={90} />
                <Tooltip contentStyle={CHART_STYLE} formatter={(v: any) => [`${v}%`, 'Importance']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {FEATURE_IMPORTANCE.map((entry, i) => (
                    <Cell key={i} fill={i === 0 ? '#06b6d4' : i === 1 ? '#3b82f6' : i === 2 ? '#8b5cf6' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Prediction History */}
          {history.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-3 border-b border-navy-700 flex items-center justify-between">
                <h4 className="font-semibold text-slate-200 flex items-center gap-2"><TrendingDown size={14} className="text-indigo-400" />Prediction History</h4>
                <span className="sim-badge">SIMULATED</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr>{['Time', 'Tool', 'RUL (min)', 'Health %', 'Fail Prob', 'Risk'].map(h => <th key={h} className="table-th">{h}</th>)}</tr></thead>
                  <tbody>
                    {history.map((r, i) => (
                      <tr key={i} className="border-t border-navy-800 hover:bg-navy-700/30">
                        <td className="table-td text-xs text-slate-500">{r.ts}</td>
                        <td className="table-td text-slate-300">{r.tool}</td>
                        <td className="table-td text-cyan-400 font-semibold">{r.rul}</td>
                        <td className="table-td text-slate-300">{r.health_percentage}%</td>
                        <td className="table-td text-slate-300">{r.failure_probability}%</td>
                        <td className="table-td">
                          <span className={clsx('capitalize text-xs font-semibold px-2 py-0.5 rounded-full border', RISK_STYLES[r.risk_level])}>{r.risk_level}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
