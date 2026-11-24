// All shared TypeScript types for PS-025

export type MachineStatus = 'running' | 'idle' | 'maintenance' | 'offline'
export type ToolStatus = 'healthy' | 'warning' | 'critical' | 'expired'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type AlertSeverity = 'info' | 'warning' | 'critical'
export type UserRole = 'admin' | 'engineer' | 'viewer'

export interface User {
  id: number
  username: string
  email: string
  role: UserRole
  fullName: string
}

export interface Machine {
  id: string
  name: string
  type: string
  status: MachineStatus
  spindleSpeed: number
  feedRate: number
  cuttingTemp: number
  vibration: number
  cuttingForce: number
  powerConsumption: number
  operatingHours: number
  utilization: number
  lastUpdated: string
}

export interface Tool {
  id: string
  name: string
  type: string
  machineId: string
  status: ToolStatus
  healthScore: number
  wearPercentage: number
  operatingHours: number
  estimatedRUL: number
  installedAt: string
  lastReplaced: string
}

export interface PredictionResult {
  rul: number
  health_percentage: number
  failure_probability: number
  risk_level: RiskLevel
  wear_estimate: number
  is_simulated: boolean
  confidence: number
  metrics: { mae: number; rmse: number; r2: number }
}

export interface MaintenanceRecord {
  id: string
  machineId: string
  toolId: string | null
  type: 'scheduled' | 'predictive' | 'emergency'
  status: 'upcoming' | 'overdue' | 'completed' | 'in_progress'
  priority: 'low' | 'medium' | 'high' | 'critical'
  scheduledAt: string
  estimatedCost: number
  description: string
  technicianAssigned?: string
}

export interface Alert {
  id: string
  type: 'tool_wear' | 'tool_failure' | 'overheating' | 'vibration' | 'maintenance' | 'critical'
  severity: AlertSeverity
  title: string
  message: string
  machineId: string
  toolId?: string
  createdAt: string
  acknowledged: boolean
}

export interface DashboardStats {
  totalMachines: number
  activeMachines: number
  totalTools: number
  healthyTools: number
  warningTools: number
  criticalTools: number
  avgToolHealth: number
  predictedFailures: number
  avgRUL: number
  maintenanceDue: number
}

export interface OptimizationSuggestion {
  machineId: string
  toolId?: string
  current: { spindleSpeed: number; feedRate: number; depthOfCut: number; cuttingSpeed: number }
  suggested: { spindleSpeed: number; feedRate: number; depthOfCut: number; cuttingSpeed: number }
  predictedRULImprovement: number
  estimatedProductivityGain: number
  estimatedCostSaving: number
  isSimulated: boolean
  generatedAt: string
}
