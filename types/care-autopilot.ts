export type CohortType = 'diabetes' | 'hypertension' | 'copd' | 'post-op' | 'high-risk' | 'unassigned'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type PathwayStage = 'enroll' | 'stabilise' | 'maintain' | 'review'

export type SignalSeverity = 'low' | 'medium' | 'high' | 'critical'

export type AutopilotMode = 'shadow' | 'ask' | 'scheduled' | 'manual'

export type CareGapType = 
  | 'overdue_lab' 
  | 'missed_appointment' 
  | 'no_readings' 
  | 'medication_gap' 
  | 'follow_up_needed'
  | 'discharge_coordination'

export interface CohortPatient {
  id: string
  name: string
  dateOfBirth: string
  cohortType: CohortType
  riskLevel: RiskLevel
  pathwayStage: PathwayStage
  careGaps: CareGap[]
  nextStep: string
  owner: string // Care coordinator or clinician
  lastReview: Date
  nextReview: Date
  autopilotMode: AutopilotMode
  consentForRemoteMonitoring: boolean
}

export interface CareGap {
  id: string
  type: CareGapType
  description: string
  severity: SignalSeverity
  dueDate: Date
  overdueDays?: number
  actionRequired: string
  estimatedResolution: string // e.g., "2-3 days", "Same day"
}

export interface CohortSummary {
  type: CohortType
  name: string
  totalPatients: number
  highRisk: number
  careGaps: number
  activeSignals: number
  color: string
  icon: string
}

export interface CareSignal {
  id: string
  patientId: string
  patientName: string
  type: 'abnormal_reading' | 'missed_reading' | 'ed_visit' | 'discharge' | 'medication_gap' | 'trend_alert'
  severity: SignalSeverity
  title: string
  description: string
  detectedAt: Date
  source: 'monitor' | 'ehr' | 'device' | 'manual'
  
  // Why this was flagged
  triggerRule: string
  triggerData?: any
  
  // Proposed response
  proposedPlan: {
    title: string
    rationale: string
    steps: string[]
    tools: string[] // ['Diary', 'SMS', 'Labs', 'Docs']
    eta: string
    riskIfIgnored: string
  }
  
  // Triage ladder
  escalationLevel: 1 | 2 | 3 | 4 // SMS → task → hold slot → clinician page
  requiresApproval: boolean
  
  // Status
  status: 'new' | 'acknowledged' | 'planned' | 'resolved' | 'dismissed'
  handledBy?: string
  handledAt?: Date
}

export interface PathwayTemplate {
  id: string
  name: string
  condition: CohortType
  description: string
  
  // Stages and flow
  stages: {
    stage: PathwayStage
    name: string
    description: string
    averageDuration: string
    tasks: string[]
  }[]
  
  // Monitoring and triggers
  triggers: {
    event: string
    condition: string
    action: string
  }[]
  
  defaultTasks: {
    stage: PathwayStage
    task: string
    frequency: string
    owner: 'clinician' | 'coordinator' | 'patient'
  }[]
  
  monitoringSchedule: {
    metric: string
    frequency: string
    alertThresholds: {
      low: string
      medium: string
      high: string
    }
  }[]
  
  escalationRules: {
    trigger: string
    action: string
    approvalRequired: boolean
  }[]
}

export interface PatientPathway {
  id: string
  patientId: string
  templateId: string
  condition: CohortType
  currentStage: PathwayStage
  riskLevel: RiskLevel
  owner: string
  autopilotMode: AutopilotMode
  
  // Progress tracking
  enrolledAt: Date
  stageStartedAt: Date
  expectedStageCompletion: Date
  nextReview: Date
  
  // Goals and metrics
  goals: {
    id: string
    description: string
    target: string
    current: string
    status: 'on_track' | 'at_risk' | 'behind'
  }[]
  
  // Active tasks
  activeTasks: {
    id: string
    description: string
    dueDate: Date
    owner: string
    status: 'pending' | 'in_progress' | 'completed' | 'overdue'
    priority: 'low' | 'medium' | 'high'
  }[]
  
  // Signals and alerts
  activeSignals: CareSignal[]
  
  // Next best step
  nextBestStep?: {
    action: string
    rationale: string
    urgency: 'low' | 'medium' | 'high'
    estimatedTime: string
  }
  
  // History
  stageHistory: {
    stage: PathwayStage
    startDate: Date
    endDate?: Date
    outcomes: string[]
  }[]
}

export interface PopulationKPI {
  id: string
  title: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  severity: SignalSeverity
  description: string
  actionable: boolean
  actionText?: string // e.g., "Order batch", "Send nudges"
  cohortFilter?: CohortType
  
  // Drill-down data
  breakdown?: {
    label: string
    value: number
    percentage: number
  }[]
}

export interface CareAutopilotStats {
  totalPatients: number
  activePathways: number
  openSignals: number
  resolvedToday: number
  
  // Autopilot performance
  autopilotActions: {
    scheduled: number
    executed: number
    failed: number
    pendingApproval: number
  }
  
  // Care gaps
  careGaps: {
    total: number
    overdue: number
    critical: number
    closedThisWeek: number
  }
  
  // Population health
  riskDistribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
}
