// Demo data — clearly labelled SIMULATED. Used when backend is unavailable.
import type { Machine, Tool, Alert, DashboardStats, MaintenanceRecord } from '../types'

export const DEMO_MACHINES: Machine[] = [
  { id: 'MC-01', name: 'Haas VF-2SS', type: 'CNC Machining Center', status: 'running', spindleSpeed: 4500, feedRate: 850, cuttingTemp: 72, vibration: 0.42, cuttingForce: 1850, powerConsumption: 14.2, operatingHours: 3240, utilization: 87, lastUpdated: new Date().toISOString() },
  { id: 'MC-02', name: 'Mazak Integrex 400', type: 'CNC Turning Center', status: 'running', spindleSpeed: 3200, feedRate: 620, cuttingTemp: 68, vibration: 0.31, cuttingForce: 1420, powerConsumption: 11.8, operatingHours: 2810, utilization: 79, lastUpdated: new Date().toISOString() },
  { id: 'MC-03', name: 'DMG Mori NHX 5000', type: 'Horizontal Machining Center', status: 'maintenance', spindleSpeed: 0, feedRate: 0, cuttingTemp: 28, vibration: 0.05, cuttingForce: 0, powerConsumption: 2.1, operatingHours: 4120, utilization: 0, lastUpdated: new Date().toISOString() },
  { id: 'MC-04', name: 'Okuma Genos M560', type: 'CNC Milling Machine', status: 'idle', spindleSpeed: 0, feedRate: 0, cuttingTemp: 32, vibration: 0.08, cuttingForce: 0, powerConsumption: 3.4, operatingHours: 1890, utilization: 0, lastUpdated: new Date().toISOString() },
]

export const DEMO_TOOLS: Tool[] = [
  { id: 'TL-001', name: 'Carbide End Mill 12mm', type: 'End Mill', machineId: 'MC-01', status: 'healthy', healthScore: 92, wearPercentage: 8, operatingHours: 48, estimatedRUL: 220, installedAt: '2026-11-01', lastReplaced: '2026-11-01' },
  { id: 'TL-002', name: 'Twist Drill 8mm', type: 'Drill Bit', machineId: 'MC-01', status: 'warning', healthScore: 54, wearPercentage: 46, operatingHours: 112, estimatedRUL: 65, installedAt: '2026-10-15', lastReplaced: '2026-10-15' },
  { id: 'TL-003', name: 'Indexable Insert CNMG', type: 'Turning Insert', machineId: 'MC-02', status: 'critical', healthScore: 21, wearPercentage: 79, operatingHours: 189, estimatedRUL: 18, installedAt: '2026-09-20', lastReplaced: '2026-09-20' },
  { id: 'TL-004', name: 'Ball Nose 10mm', type: 'Ball Mill', machineId: 'MC-02', status: 'healthy', healthScore: 88, wearPercentage: 12, operatingHours: 36, estimatedRUL: 185, installedAt: '2026-11-10', lastReplaced: '2026-11-10' },
  { id: 'TL-005', name: 'Face Mill 50mm', type: 'Face Mill', machineId: 'MC-04', status: 'expired', healthScore: 0, wearPercentage: 100, operatingHours: 260, estimatedRUL: 0, installedAt: '2026-08-01', lastReplaced: '2026-08-01' },
  { id: 'TL-006', name: 'Thread Tap M10', type: 'Tap', machineId: 'MC-01', status: 'healthy', healthScore: 76, wearPercentage: 24, operatingHours: 88, estimatedRUL: 140, installedAt: '2026-10-28', lastReplaced: '2026-10-28' },
]

export const DEMO_STATS: DashboardStats = {
  totalMachines: 4, activeMachines: 2, totalTools: 6,
  healthyTools: 3, warningTools: 1, criticalTools: 1,
  avgToolHealth: 55.2, predictedFailures: 2, avgRUL: 104.7, maintenanceDue: 3,
}

export const DEMO_ALERTS: Alert[] = [
  { id: 'AL-001', type: 'tool_failure', severity: 'critical', title: 'Tool Failure Risk — TL-003', message: 'Turning Insert on MC-02 has 79% wear. Immediate replacement recommended to avoid unplanned downtime.', machineId: 'MC-02', toolId: 'TL-003', createdAt: new Date(Date.now() - 3600000).toISOString(), acknowledged: false },
  { id: 'AL-002', type: 'tool_wear', severity: 'warning', title: 'High Wear — TL-002', message: 'Twist Drill 8mm on MC-01 wear at 46%. Schedule replacement within 24 hours.', machineId: 'MC-01', toolId: 'TL-002', createdAt: new Date(Date.now() - 7200000).toISOString(), acknowledged: false },
  { id: 'AL-003', type: 'maintenance', severity: 'warning', title: 'Maintenance Overdue — MC-03', message: 'DMG Mori NHX 5000 scheduled maintenance is 2 days overdue. Coordinate with maintenance team.', machineId: 'MC-03', createdAt: new Date(Date.now() - 86400000).toISOString(), acknowledged: true },
  { id: 'AL-004', type: 'vibration', severity: 'warning', title: 'Elevated Vibration — MC-01', message: 'Vibration reading 0.42g exceeds the 0.40g upper control limit. Inspect spindle bearing.', machineId: 'MC-01', createdAt: new Date(Date.now() - 1800000).toISOString(), acknowledged: false },
]

export const DEMO_MAINTENANCE: MaintenanceRecord[] = [
  { id: 'M-001', machineId: 'MC-02', toolId: 'TL-003', type: 'predictive', status: 'overdue', priority: 'critical', scheduledAt: '2026-11-23 08:00', estimatedCost: 450, description: 'Replace CNMG Turning Insert — wear at 79%, critical risk. Predicted failure within 18 hours.' },
  { id: 'M-002', machineId: 'MC-01', toolId: 'TL-002', type: 'predictive', status: 'upcoming', priority: 'high', scheduledAt: '2026-11-25 09:00', estimatedCost: 180, description: 'Replace Twist Drill 8mm — wear at 46%, approaching critical threshold.' },
  { id: 'M-003', machineId: 'MC-03', toolId: null, type: 'scheduled', status: 'overdue', priority: 'high', scheduledAt: '2026-11-21 06:00', estimatedCost: 1200, description: 'Full preventive maintenance — DMG Mori NHX 5000 quarterly service.' },
  { id: 'M-004', machineId: 'MC-04', toolId: 'TL-005', type: 'scheduled', status: 'upcoming', priority: 'medium', scheduledAt: '2026-11-26 14:00', estimatedCost: 320, description: 'Replace expired Face Mill 50mm and inspect spindle bearing.' },
  { id: 'M-005', machineId: 'MC-01', toolId: 'TL-006', type: 'predictive', status: 'upcoming', priority: 'low', scheduledAt: '2026-12-01 10:00', estimatedCost: 90, description: 'Thread Tap M10 — scheduled rotation, 140 min estimated RUL remaining.' },
  { id: 'M-006', machineId: 'MC-02', toolId: 'TL-004', type: 'scheduled', status: 'completed', priority: 'medium', scheduledAt: '2026-11-15 08:00', estimatedCost: 220, description: 'Ball Nose 10mm replaced. Tool life extended by 185 min.' },
]

export const AI_INSIGHTS = [
  '🔮 TL-003 on MC-02 predicted to fail within 18 operating hours. Immediate replacement recommended.',
  '📈 MC-01 utilization at 87% — optimal range. Current parameters recommended to continue.',
  '⚡ Reducing MC-02 feed rate by 8% could extend TL-004 life by an estimated 22 hours.',
  '🔧 MC-03 maintenance window: schedule within next 48 hours to avoid production impact.',
  '💡 Average tool health across fleet has declined 4.2% over the past 7 days.',
]

// Generate realistic time-series demo data
export function generateTrendData(hours = 24) {
  return Array.from({ length: hours }, (_, i) => {
    const h = hours - 1 - i
    return {
      time: new Date(Date.now() - h * 3600000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      toolHealth: Math.round(Math.max(10, 82 - i * 0.6 + Math.sin(i * 0.8) * 4)),
      rul: Math.round(Math.max(5, 190 - i * 3.5 + Math.cos(i) * 8)),
      vibration: parseFloat((0.25 + Math.sin(i * 0.5) * 0.08 + Math.random() * 0.05).toFixed(2)),
      spindleRPM: Math.round(4500 + Math.sin(i * 0.3) * 200 + Math.random() * 100),
      temp: Math.round(65 + Math.sin(i * 0.4) * 8 + Math.random() * 3),
    }
  })
}

export function generateMachineHistory(machine: Machine, points = 20) {
  return Array.from({ length: points }, (_, i) => ({
    t: `${i * 3}m`,
    rpm: Math.round(machine.spindleSpeed + (Math.random() - 0.5) * 300),
    temp: Math.round(machine.cuttingTemp + (Math.random() - 0.5) * 10),
    vib: parseFloat((machine.vibration + (Math.random() - 0.5) * 0.06).toFixed(2)),
    force: Math.round(machine.cuttingForce + (Math.random() - 0.5) * 150),
    power: parseFloat((machine.powerConsumption + (Math.random() - 0.5) * 1.5).toFixed(1)),
  }))
}
