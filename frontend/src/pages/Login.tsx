import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Lock, User, BrainCircuit, AlertCircle, Activity } from 'lucide-react'

export default function LoginPage() {
  const { token, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (token) return <Navigate to="/" replace />

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) { setError('Please enter username and password'); return }
    setLoading(true); setError('')
    try {
      await login(username.trim(), password)
    } catch (err: any) {
      setError('Login failed. Using demo mode — any credentials accepted.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #020817 0%, #0a0f1e 50%, #0d1526 100%)' }}>
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)' }}>
            <BrainCircuit size={30} className="text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">PS-025</h1>
          <p className="text-sm text-cyan-400 font-semibold tracking-widest mt-1">AI PREDICTIVE TOOL-LIFE MONITORING</p>
          <p className="text-xs text-slate-600 mt-1">Sakthi Hackathon 2.0 — Industrial AI System</p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="card space-y-4 shadow-2xl">
          <div className="text-center pb-2 border-b border-navy-700">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Activity size={14} className="text-emerald-400 animate-pulse" />
              <span>System Online — Demo Mode Active</span>
            </div>
          </div>

          <div>
            <label className="label">Username</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input pl-9" placeholder="admin" value={username}
                onChange={e => setUsername(e.target.value)} autoFocus autoComplete="username" />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="password" className="input pl-9" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle size={13} className="shrink-0" />{error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>

          <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <p className="text-xs text-indigo-300">
              Demo credentials: <strong className="text-white">admin</strong> / <strong className="text-white">admin123</strong>
            </p>
            <p className="text-xs text-slate-500 mt-1">Roles: Admin · Engineer · Viewer</p>
          </div>
        </form>

        <p className="text-center text-xs text-slate-700 mt-4">
          ⚠️ All data shown is simulated for demonstration purposes only.
        </p>
      </div>
    </div>
  )
}
