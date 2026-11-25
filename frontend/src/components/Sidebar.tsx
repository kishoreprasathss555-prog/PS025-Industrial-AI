import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Cpu, Wrench, BrainCircuit,
  CalendarClock, Zap, Bell, ChevronLeft, ChevronRight,
  Activity
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/machines', label: 'Machines', icon: Cpu },
  { to: '/tools', label: 'Tool Health', icon: Wrench },
  { to: '/predictions', label: 'AI Predictions', icon: BrainCircuit },
  { to: '/maintenance', label: 'Maintenance', icon: CalendarClock },
  { to: '/optimization', label: 'Optimization', icon: Zap },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/simulator', label: 'Virtual ESP32', icon: Activity },
]

export default function Sidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <aside className={clsx(
      'flex flex-col border-r border-navy-700 transition-all duration-300 shrink-0',
      open ? 'w-64' : 'w-16'
    )} style={{ background: '#0a0f1e' }}>
      {/* Brand */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-navy-700">
        {open && (
          <div>
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-cyan-400" />
              <span className="text-sm font-bold text-cyan-400 tracking-widest">PS-025</span>
            </div>
            <div className="text-[11px] text-slate-500 leading-tight ml-6">Tool-Life AI System</div>
          </div>
        )}
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-navy-700 text-slate-400 hover:text-cyan-400 transition-colors ml-auto">
          {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
              isActive
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-700'
            )}>
            <item.icon size={18} className="shrink-0" />
            {open && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {open && (
        <div className="p-4 border-t border-navy-700">
          <div className="text-[10px] text-slate-600 text-center leading-relaxed">
            SAKTHI HACKATHON 2.0<br />
            <span className="text-amber-600">⚠️ DEMO / SIMULATED DATA</span>
          </div>
        </div>
      )}
    </aside>
  )
}
