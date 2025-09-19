export type SystemRole = 'reception' | 'clinician' | 'manager'

export interface RolePermissions {
  // Navigation access
  canViewCalendar: boolean
  canViewPatients: boolean
  canViewBilling: boolean
  canViewMessages: boolean
  canViewTasks: boolean
  canViewInsights: boolean
  canViewSettings: boolean
  canViewCalls: boolean
  
  // Feature access
  canManageAppointments: boolean
  canViewMedicalRecords: boolean
  canPrescribe: boolean
  canManageBilling: boolean
  canViewReports: boolean
  canManageUsers: boolean
  canAccessAI: boolean
  canUseScribe: boolean
  
  // Widget visibility
  showRevenueWidgets: boolean
  showClinicalWidgets: boolean
  showOperationalWidgets: boolean
}

export const ROLE_PERMISSIONS: Record<SystemRole, RolePermissions> = {
  reception: {
    // Navigation - Reception focuses on scheduling, communication, and basic admin
    canViewCalendar: true,
    canViewPatients: true,
    canViewBilling: true,
    canViewMessages: true,
    canViewTasks: true,
    canViewInsights: false,
    canViewSettings: false,
    canViewCalls: true,
    
    // Features - Front desk operations
    canManageAppointments: true,
    canViewMedicalRecords: false, // Basic demographics only
    canPrescribe: false,
    canManageBilling: true,
    canViewReports: false,
    canManageUsers: false,
    canAccessAI: true, // AI assistant for scheduling/admin
    canUseScribe: false, // Not for clinical documentation
    
    // Widgets - Operational focus
    showRevenueWidgets: false,
    showClinicalWidgets: false,
    showOperationalWidgets: true
  },
  
  clinician: {
    // Navigation - Clinical focus with patient care tools
    canViewCalendar: true,
    canViewPatients: true,
    canViewBilling: false, // Can see but not manage
    canViewMessages: true,
    canViewTasks: true,
    canViewInsights: false, // Clinical metrics only
    canViewSettings: false,
    canViewCalls: false, // Typically don't handle reception calls
    
    // Features - Clinical care
    canManageAppointments: true, // Own appointments
    canViewMedicalRecords: true,
    canPrescribe: true,
    canManageBilling: false,
    canViewReports: false,
    canManageUsers: false,
    canAccessAI: true, // AI for clinical decision support
    canUseScribe: true, // Primary users of ambient scribe
    
    // Widgets - Clinical focus
    showRevenueWidgets: false,
    showClinicalWidgets: true,
    showOperationalWidgets: false
  },
  
  manager: {
    // Navigation - Full access for practice oversight
    canViewCalendar: true,
    canViewPatients: true,
    canViewBilling: true,
    canViewMessages: true,
    canViewTasks: true,
    canViewInsights: true,
    canViewSettings: true,
    canViewCalls: true,
    
    // Features - Full management capabilities
    canManageAppointments: true,
    canViewMedicalRecords: true, // For oversight, not direct care
    canPrescribe: false, // Unless also a clinician
    canManageBilling: true,
    canViewReports: true,
    canManageUsers: true,
    canAccessAI: true, // AI for business intelligence
    canUseScribe: true, // Can review and oversee scribe usage
    
    // Widgets - Business and operational oversight
    showRevenueWidgets: true,
    showClinicalWidgets: true,
    showOperationalWidgets: true
  }
}

export const ROLE_DISPLAY_NAMES: Record<SystemRole, string> = {
  reception: 'Reception',
  clinician: 'Clinician', 
  manager: 'Manager'
}

export const ROLE_DESCRIPTIONS: Record<SystemRole, string> = {
  reception: 'Front desk operations, scheduling, and patient communication',
  clinician: 'Patient care, medical records, and clinical decision support',
  manager: 'Practice oversight, analytics, and business management'
}