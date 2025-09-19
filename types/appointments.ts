export type AppointmentStatus = 'scheduled' | 'confirmed' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'dna' | 'rescheduled'

export type RecurrencePattern = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'custom'

export interface AppointmentTemplate {
  id: string
  name: string
  description?: string
  duration: number // minutes
  serviceId?: string
  defaultPractitionerId?: string
  requiredResources?: string[] // room types, equipment
  pricing?: {
    basePrice: number
    currency: string
    insuranceCodes?: string[]
  }
  preparation?: {
    instructions: string
    forms?: string[]
    timeRequired: number // minutes before appointment
  }
  followUp?: {
    recommendedInterval: number // days
    notes?: string
  }
}

export interface RecurrenceRule {
  pattern: RecurrencePattern
  frequency: number // e.g., every 2 weeks
  endDate?: string
  maxOccurrences?: number
  weekdays?: number[] // 0=Sunday, 1=Monday, etc.
  monthDay?: number // day of month for monthly patterns
  customRule?: string // cron-like expression for complex patterns
}

export interface AppointmentSeries {
  id: string
  name: string
  templateId?: string
  recurrenceRule: RecurrenceRule
  appointments: string[] // appointment IDs
  createdAt: string
  createdBy: string
  status: 'active' | 'paused' | 'completed' | 'cancelled'
}

export interface AppointmentConflict {
  type: 'practitioner' | 'room' | 'patient' | 'resource'
  conflictingId: string
  conflictingName: string
  severity: 'error' | 'warning' | 'info'
  message: string
  suggestedAlternatives?: {
    time?: string
    practitionerId?: string
    roomId?: string
  }[]
}

export interface AvailabilitySlot {
  start: string
  end: string
  practitionerId: string
  practitionerName: string
  roomId?: string
  roomName?: string
  siteId: string
  siteName: string
  available: boolean
  reason?: string // why not available
  confidence?: number // AI confidence score 0-1
  recommendations?: {
    score: number
    reasons: string[]
    patientFit: number // how well this slot fits patient preferences
  }
}

export interface WaitlistEntry {
  id: string
  patientId: string
  patientName: string
  appointmentTemplateId?: string
  preferredPractitionerId?: string
  preferredSiteId?: string
  preferredTimeSlots: {
    dayOfWeek: number
    startTime: string
    endTime: string
  }[]
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  notes?: string
  createdAt: string
  notifiedAt?: string[]
  maxWaitDays?: number
}

// Enhanced appointment interface
export interface EnhancedAppointment {
  id: string
  patientId: string
  patientName?: string
  
  // Scheduling details
  start: string
  end: string
  duration: number // minutes
  
  // Resources
  practitionerId: string
  practitionerName: string
  roomId?: string
  roomName?: string
  siteId: string
  siteName: string
  
  // Appointment details
  templateId?: string
  appointmentType: string
  status: AppointmentStatus
  
  // Series management
  seriesId?: string
  isRecurring: boolean
  recurrencePosition?: number // e.g., 3rd in a series of 6
  
  // Clinical information
  serviceIds: string[]
  notes?: string
  clinicalNotes?: string
  preparation?: {
    completed: boolean
    forms?: { id: string; completed: boolean }[]
  }
  
  // Booking metadata
  bookedAt: string
  bookedBy: string // user ID
  bookingSource: 'manual' | 'online' | 'phone' | 'ai_suggestion'
  
  // Communication
  confirmationSent?: boolean
  remindersSent?: string[]
  
  // Conflicts and validations
  conflicts?: AppointmentConflict[]
  validated: boolean
  
  // AI enhancements
  aiSuggestions?: {
    optimalTime?: string
    alternativePractitioners?: string[]
    preparationReminders?: string[]
    followUpRecommendations?: string[]
  }
}
