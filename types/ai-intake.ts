export type IntakeStatus = 'requested' | 'sent' | 'in_progress' | 'completed' | 'expired' | 'declined'

export type IntakeUrgency = 'routine' | 'urgent' | 'same_day'

export type ConversationRole = 'ai' | 'patient'

export interface IntakeConversationMessage {
  id: string
  role: ConversationRole
  content: string
  timestamp: Date
  metadata?: {
    suggestedResponses?: string[]
    followUpQuestions?: string[]
    confidence?: number
  }
}

export interface IntakeSession {
  id: string
  patientId: string
  patientName: string
  appointmentId: string
  appointmentDate: Date
  requestedBy: string // Doctor name
  requestedAt: Date
  
  // Status and timing
  status: IntakeStatus
  linkSentAt?: Date
  startedAt?: Date
  completedAt?: Date
  expiresAt: Date
  
  // Patient interaction
  accessToken: string // Secure token for patient access
  conversation: IntakeConversationMessage[]
  
  // AI-generated summary
  aiSummary?: {
    chiefConcern: string
    symptoms: string[]
    duration: string
    severity: string
    previousTreatments: string[]
    currentMedications: string[]
    allergies: string[]
    concerns: string[]
    expectations: string[]
    redFlags: string[]
    recommendedFocus: string[]
    confidence: number
    conversationQuality: 'excellent' | 'good' | 'fair' | 'poor'
  }
  
  // Doctor's notes
  doctorNotes?: string
  doctorReviewed?: boolean
  doctorReviewedAt?: Date
}

export interface IntakeTemplate {
  id: string
  name: string
  description: string
  appointmentType: string
  
  // Conversation flow
  openingMessage: string
  keyQuestions: string[]
  followUpPrompts: string[]
  closingMessage: string
  
  // AI behavior
  maxMessages: number
  timeoutMinutes: number
  focusAreas: string[]
}

export interface IntakeStats {
  totalRequested: number
  completionRate: number
  averageMessages: number
  averageDuration: number // in minutes
  patientSatisfaction: number
  doctorSatisfaction: number
  
  // Time savings
  appointmentTimeReduction: number // average minutes saved per appointment
  preparationTimeReduction: number // minutes saved in prep
}

export interface IntakeInsight {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'efficiency' | 'quality' | 'satisfaction'
  metric: string
  value: number
  trend: 'up' | 'down' | 'stable'
}
