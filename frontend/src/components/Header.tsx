import { Bell, Menu, User, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <header className="h-16 border-b border-navy-700 flex items-center justify-between px-6 shrink-0" style={{ background: '#0a0f1e' }}>
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-1.5 rounded-lg hover:bg-navy-700 text-slate-400 hover:text-slate-200 transition-colors lg:hidden">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-slate-200">PS-025 — AI Predictive Tool-Life Monitoring</h1>
          <p className="text-xs text-slate-500">Machine: MC-01 · Status: <span className="text-emerald-400 font-semibold">Running</span> · Sakthi Hackathon 2.0</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden sm:block sim-badge">⚠️ SIMULATED DATA</span>

        <button className="p-2 rounded-lg hover:bg-navy-700 text-slate-400 hover:text-slate-200 transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </button>

        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-navy-700 transition-colors border border-navy-600">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <User size={14} className="text-cyan-400" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-200">{user?.username || 'Demo User'}</div>
              <div className="text-[10px] text-slate-500 capitalize">{user?.role || 'engineer'}</div>
            </div>
            <ChevronDown size={12} className="text-slate-500" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-navy-800 border border-navy-600 rounded-xl shadow-2xl z-50">
              <div className="p-3 border-b border-navy-700">
                <div className="text-sm font-medium text-slate-200">{user?.fullName || 'Demo Engineer'}</div>
                <div className="text-xs text-slate-500">{user?.email || 'demo@ps025.com'}</div>
                <div className="text-xs text-cyan-400 font-semibold capitalize mt-0.5">{user?.role || 'engineer'}</div>
              </div>
              <button onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-navy-700 transition-colors rounded-b-xl">
                <LogOut size={14} />Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
