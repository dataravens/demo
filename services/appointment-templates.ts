import { AppointmentTemplate, RecurrenceRule, AppointmentSeries } from '@/types/appointments'

export class AppointmentTemplateService {
  
  /**
   * Pre-defined appointment templates for common healthcare scenarios
   */
  static getDefaultTemplates(): AppointmentTemplate[] {
    return [
      {
        id: 'template-consultation',
        name: 'Initial Consultation',
        description: 'Comprehensive first visit with medical history review',
        duration: 45,
        pricing: {
          basePrice: 120,
          currency: 'GBP',
          insuranceCodes: ['CONS001', 'INIT001']
        },
        preparation: {
          instructions: 'Please bring all current medications and previous medical records',
          forms: ['medical-history', 'consent-form'],
          timeRequired: 15
        },
        followUp: {
          recommendedInterval: 14,
          notes: 'Follow-up to review treatment plan and progress'
        }
      },
      {
        id: 'template-followup',
        name: 'Follow-up Appointment',
        description: 'Regular follow-up visit to monitor progress',
        duration: 20,
        pricing: {
          basePrice: 80,
          currency: 'GBP',
          insuranceCodes: ['FOLL001']
        },
        preparation: {
          instructions: 'Bring medication diary and any questions about treatment',
          timeRequired: 5
        },
        followUp: {
          recommendedInterval: 28,
          notes: 'Continue monitoring and adjust treatment as needed'
        }
      },
      {
        id: 'template-checkup',
        name: 'Annual Health Check',
        description: 'Comprehensive annual health screening',
        duration: 30,
        pricing: {
          basePrice: 95,
          currency: 'GBP',
          insuranceCodes: ['CHECK001', 'PREV001']
        },
        preparation: {
          instructions: 'Fasting required 12 hours before appointment for blood tests',
          forms: ['health-questionnaire'],
          timeRequired: 10
        },
        followUp: {
          recommendedInterval: 365,
          notes: 'Schedule next annual check-up'
        }
      },
      {
        id: 'template-urgent',
        name: 'Urgent Consultation',
        description: 'Same-day urgent medical consultation',
        duration: 25,
        pricing: {
          basePrice: 150,
          currency: 'GBP',
          insuranceCodes: ['URG001']
        },
        preparation: {
          instructions: 'Bring details of current symptoms and any relevant medical history',
          timeRequired: 5
        }
      },
      {
        id: 'template-therapy',
        name: 'Therapy Session',
        description: 'Individual therapy or counseling session',
        duration: 50,
        pricing: {
          basePrice: 100,
          currency: 'GBP',
          insuranceCodes: ['THER001', 'COUNS001']
        },
        preparation: {
          instructions: 'Arrive 5 minutes early to settle in',
          timeRequired: 5
        },
        followUp: {
          recommendedInterval: 7,
          notes: 'Regular weekly sessions recommended initially'
        }
      },
      {
        id: 'template-diabetes',
        name: 'Diabetes Management',
        description: 'Specialized diabetes monitoring and management appointment',
        duration: 35,
        pricing: {
          basePrice: 110,
          currency: 'GBP',
          insuranceCodes: ['DIAB001', 'CHRON001']
        },
        preparation: {
          instructions: 'Bring glucose meter, medication list, and food diary',
          forms: ['diabetes-monitoring'],
          timeRequired: 10
        },
        followUp: {
          recommendedInterval: 90,
          notes: 'Quarterly monitoring recommended for stable patients'
        }
      }
    ]
  }
  
  /**
   * Create a recurring appointment series
   */
  static createAppointmentSeries(params: {
    name: string
    templateId: string
    patientId: string
    practitionerId: string
    siteId: string
    startDate: string
    recurrenceRule: RecurrenceRule
    createdBy: string
  }): AppointmentSeries {
    
    return {
      id: `series-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: params.name,
      templateId: params.templateId,
      recurrenceRule: params.recurrenceRule,
      appointments: [], // Will be populated when appointments are created
      createdAt: new Date().toISOString(),
      createdBy: params.createdBy,
      status: 'active'
    }
  }
  
  /**
   * Generate appointment dates based on recurrence rule
   */
  static generateRecurringDates(startDate: string, recurrenceRule: RecurrenceRule): string[] {
    const dates: string[] = []
    const start = new Date(startDate)
    let current = new Date(start)
    let count = 0
    
    const maxIterations = recurrenceRule.maxOccurrences || 52 // Default max 1 year
    const endDate = recurrenceRule.endDate ? new Date(recurrenceRule.endDate) : null
    
    while (count < maxIterations && (!endDate || current <= endDate)) {
      dates.push(current.toISOString())
      
      // Calculate next occurrence based on pattern
      switch (recurrenceRule.pattern) {
        case 'daily':
          current.setDate(current.getDate() + recurrenceRule.frequency)
          break
          
        case 'weekly':
          current.setDate(current.getDate() + (7 * recurrenceRule.frequency))
          break
          
        case 'biweekly':
          current.setDate(current.getDate() + (14 * recurrenceRule.frequency))
          break
          
        case 'monthly':
          current.setMonth(current.getMonth() + recurrenceRule.frequency)
          // Handle month day preference
          if (recurrenceRule.monthDay) {
            current.setDate(recurrenceRule.monthDay)
          }
          break
          
        case 'quarterly':
          current.setMonth(current.getMonth() + (3 * recurrenceRule.frequency))
          break
          
        default:
          // For custom patterns, we'd need more complex logic
          count = maxIterations // Break out for now
      }
      
      // Filter by weekdays if specified
      if (recurrenceRule.weekdays && recurrenceRule.weekdays.length > 0) {
        while (!recurrenceRule.weekdays.includes(current.getDay()) && count < maxIterations) {
          current.setDate(current.getDate() + 1)
          count++
        }
      }
      
      count++
    }
    
    return dates
  }
  
  /**
   * Get AI-powered template suggestions based on patient history and context
   */
  static suggestTemplates(params: {
    patientId: string
    patientHistory?: any[]
    lastAppointmentType?: string
    clinicalNotes?: string
    urgency?: 'routine' | 'urgent' | 'emergency'
  }): { template: AppointmentTemplate; confidence: number; reasons: string[] }[] {
    
    const templates = this.getDefaultTemplates()
    const suggestions: { template: AppointmentTemplate; confidence: number; reasons: string[] }[] = []
    
    // AI logic for template suggestions (simplified for demo)
    for (const template of templates) {
      let confidence = 0.3 // Base confidence
      const reasons: string[] = []
      
      // First appointment logic
      if (!params.patientHistory || params.patientHistory.length === 0) {
        if (template.id === 'template-consultation') {
          confidence = 0.9
          reasons.push('First appointment - comprehensive consultation recommended')
        }
      }
      
      // Follow-up logic
      if (params.lastAppointmentType === 'consultation') {
        if (template.id === 'template-followup') {
          confidence = 0.8
          reasons.push('Follow-up recommended after initial consultation')
        }
      }
      
      // Urgency-based suggestions
      if (params.urgency === 'urgent' && template.id === 'template-urgent') {
        confidence = 0.95
        reasons.push('Urgent care template matches request priority')
      }
      
      // Clinical notes analysis (simplified keyword matching)
      if (params.clinicalNotes) {
        const notes = params.clinicalNotes.toLowerCase()
        
        if (notes.includes('diabetes') && template.id === 'template-diabetes') {
          confidence = 0.85
          reasons.push('Diabetes mentioned in clinical notes')
        }
        
        if (notes.includes('therapy') || notes.includes('counseling')) {
          if (template.id === 'template-therapy') {
            confidence = 0.8
            reasons.push('Therapy needs identified in clinical notes')
          }
        }
        
        if (notes.includes('annual') || notes.includes('screening')) {
          if (template.id === 'template-checkup') {
            confidence = 0.7
            reasons.push('Screening or annual check mentioned')
          }
        }
      }
      
      if (confidence > 0.4) { // Only suggest if confidence is reasonable
        suggestions.push({ template, confidence, reasons })
      }
    }
    
    // Sort by confidence (highest first)
    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }
  
  /**
   * Validate appointment template compatibility
   */
  static validateTemplate(template: AppointmentTemplate, context: {
    practitionerId: string
    siteId: string
    requestedDuration?: number
  }): { valid: boolean; warnings: string[]; errors: string[] } {
    
    const warnings: string[] = []
    const errors: string[] = []
    
    // Duration validation
    if (context.requestedDuration && context.requestedDuration !== template.duration) {
      warnings.push(`Requested duration (${context.requestedDuration} min) differs from template duration (${template.duration} min)`)
    }
    
    // Practitioner compatibility (would check against practitioner skills/specialties)
    if (template.defaultPractitionerId && template.defaultPractitionerId !== context.practitionerId) {
      warnings.push('Different practitioner than template default')
    }
    
    // Resource requirements (would check against site capabilities)
    if (template.requiredResources && template.requiredResources.length > 0) {
      // In a real system, we'd check if the site has required equipment/rooms
      // For demo, we'll just add an info message
      warnings.push(`Template requires: ${template.requiredResources.join(', ')}`)
    }
    
    return {
      valid: errors.length === 0,
      warnings,
      errors
    }
  }
}
