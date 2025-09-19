'use client'

import type { EventItem } from '@/types/core'
import { useAutopilotPacks } from './autopilot-packs'

export interface ReminderTask {
  id: string
  type: 'appointment_reminder' | 'insurance_verification' | 'follow_up' | 'payment_reminder'
  patientId: string
  appointmentId?: string
  scheduledFor: Date
  status: 'pending' | 'sent' | 'failed' | 'completed'
  priority: 'low' | 'medium' | 'high'
  message?: string
  metadata?: {
    phone?: string
    email?: string
    insuranceProvider?: string
    lastVerified?: Date
    attemptCount?: number
  }
  createdAt: Date
  completedAt?: Date
}

export interface ReminderActivity {
  id: string
  timestamp: Date
  type: 'reminder_sent' | 'insurance_verified' | 'patient_responded' | 'verification_failed' | 'invoice_generated' | 'payment_processed' | 'clinical_note_created' | 'referral_sent' | 'quality_check' | 'schedule_optimized'
  patientName: string
  appointmentTime?: string
  details: string
  status: 'success' | 'warning' | 'error'
  automated: boolean
  agentName: string
  packId: string
  relevantRoles?: string[]
}

class ReminderEngineService {
  private activities: ReminderActivity[] = []
  private tasks: ReminderTask[] = []
  private timelineCallback?: (event: Omit<EventItem, 'id' | 'ts'>) => void

  constructor() {
    this.initializeDemoData()
  }

  // Set callback to add events to global timeline
  setTimelineCallback(callback: (event: Omit<EventItem, 'id' | 'ts'>) => void) {
    this.timelineCallback = callback
  }

  private initializeDemoData() {
    const now = new Date()
    
    // Add some initial background AI events to global timeline
    if (this.timelineCallback) {
      // Add historical background activities
      this.timelineCallback({
        type: 'reminder.sent',
        summary: 'Sent appointment reminder to Sarah Jones for tomorrow 10:00 AM',
        actor: 'system',
        source: 'cmdk',
        automated: true,
        category: 'reminder',
        patientName: 'Sarah Jones'
      })
      
      this.timelineCallback({
        type: 'insurance.verified',
        summary: 'Insurance coverage verified with Bupa for Michael Chen',
        actor: 'system',
        source: 'cmdk',
        automated: true,
        category: 'verification',
        patientName: 'Michael Chen'
      })
    }
    
    // Generate diverse background AI activities with realistic, plausible tasks
    this.activities = [
      {
        id: '1',
        timestamp: new Date(now.getTime() - 2 * 60 * 1000),
        type: 'appointment_reminder',
        patientName: 'Sarah Jones',
        appointmentTime: 'Tomorrow 10:00 AM',
        details: 'SMS appointment reminder sent for routine check-up. Patient confirmed attendance via text reply.',
        status: 'success',
        automated: true,
        agentName: 'OutreachBot',
        packId: 'patient-outreach',
        relevantRoles: ['Reception', 'Clinician', 'Manager']
      },
      {
        id: '2',
        timestamp: new Date(now.getTime() - 8 * 60 * 1000),
        type: 'insurance_verification',
        patientName: 'Michael Chen',
        details: 'Real-time eligibility check completed with Bupa. Coverage verified for physiotherapy services through Dec 2024.',
        status: 'success',
        automated: true,
        agentName: 'InsuranceBot',
        packId: 'insurance-eligibility',
        relevantRoles: ['Reception', 'Manager']
      },
      {
        id: '3',
        timestamp: new Date(now.getTime() - 22 * 60 * 1000),
        type: 'payment_reminder',
        patientName: 'Emma Thompson',
        details: 'Second payment reminder sent for overdue invoice #INV-2024-0156 (£250.00). Payment link included.',
        status: 'success',
        automated: true,
        agentName: 'CollectionsBot',
        packId: 'collections-billing',
        relevantRoles: ['Reception', 'Manager']
      },
      {
        id: '4',
        timestamp: new Date(now.getTime() - 35 * 60 * 1000),
        type: 'clinical_documentation',
        patientName: 'James Wilson',
        details: 'ICD-10 codes suggested for lower back pain consultation (M54.5). Documentation template pre-filled.',
        status: 'success',
        automated: true,
        agentName: 'ClinicalBot',
        packId: 'clinical-documentation',
        relevantRoles: ['Clinician', 'Manager']
      },
      {
        id: '5',
        timestamp: new Date(now.getTime() - 45 * 60 * 1000),
        type: 'schedule_optimization',
        patientName: 'Lisa Anderson',
        details: 'Cancellation at 2:30 PM automatically filled from waitlist. Patient contacted and confirmed.',
        status: 'success',
        automated: true,
        agentName: 'SchedulingBot',
        packId: 'smart-scheduling',
        relevantRoles: ['Reception', 'Manager']
      },
      {
        id: '6',
        timestamp: new Date(now.getTime() - 1.2 * 60 * 60 * 1000),
        type: 'compliance_check',
        patientName: 'Robert Davis',
        details: 'HIPAA compliance scan completed. Patient consent forms digitally signed and archived.',
        status: 'success',
        automated: true,
        agentName: 'ComplianceBot',
        packId: 'compliance-monitoring',
        relevantRoles: ['Clinician', 'Manager']
      },
      {
        id: '7',
        timestamp: new Date(now.getTime() - 1.5 * 60 * 60 * 1000),
        type: 'call_routing',
        patientName: 'Maria Garcia',
        details: 'Incoming call automatically routed to billing department. Voicemail transcribed and ticket created.',
        status: 'success',
        automated: true,
        agentName: 'CallBot',
        packId: 'call-management',
        relevantRoles: ['Reception', 'Manager']
      },
      {
        id: '8',
        timestamp: new Date(now.getTime() - 2.1 * 60 * 60 * 1000),
        type: 'inventory_alert',
        patientName: 'N/A',
        details: 'Low stock alert: Examination gloves (Size M). Automatic reorder placed with MedSupply Co.',
        status: 'success',
        automated: true,
        agentName: 'InventoryBot',
        packId: 'inventory-supplies',
        relevantRoles: ['Manager']
      },
      {
        id: '9',
        timestamp: new Date(now.getTime() - 2.5 * 60 * 60 * 1000),
        type: 'follow_up_survey',
        patientName: 'Patricia Williams',
        details: 'Post-treatment satisfaction survey sent via email. Response rate: 87% this month.',
        status: 'success',
        automated: true,
        agentName: 'OutreachBot',
        packId: 'patient-outreach',
        relevantRoles: ['Reception', 'Clinician', 'Manager']
      },
      {
        id: '10',
        timestamp: new Date(now.getTime() - 3.2 * 60 * 60 * 1000),
        type: 'prior_authorization',
        patientName: 'David Kim',
        details: 'Prior authorization request submitted to NHS for MRI scan. Expected approval within 48 hours.',
        status: 'warning',
        automated: true,
        agentName: 'InsuranceBot',
        packId: 'insurance-eligibility',
        relevantRoles: ['Reception', 'Manager']
      },
      {
        id: '11',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        type: 'collections_follow_up',
        patientName: 'Andrew Thompson',
        details: 'Payment plan proposal sent for outstanding balance £420.00. 6-month plan at £70/month.',
        status: 'success',
        automated: true,
        agentName: 'CollectionsBot',
        packId: 'collections-billing',
        relevantRoles: ['Reception', 'Manager']
      },
      {
        id: '12',
        timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        type: 'documentation_review',
        patientName: 'Sophie Clarke',
        details: 'Clinical note flagged for incomplete SOAP documentation. Clinician notified for review.',
        status: 'warning',
        automated: true,
        agentName: 'ClinicalBot',
        packId: 'clinical-documentation',
        relevantRoles: ['Clinician', 'Manager']
      }
    ]

    // Generate upcoming tasks
    this.tasks = [
      {
        id: 'task-1',
        type: 'appointment_reminder',
        patientId: 'pat-001',
        appointmentId: 'apt-001',
        scheduledFor: new Date(now.getTime() + 30 * 60 * 1000), // 30 min from now
        status: 'pending',
        priority: 'high',
        message: '24-hour reminder for appointment tomorrow at 10:00 AM',
        metadata: {
          phone: '+44 7700 900123',
          email: 'sarah.jones@email.com'
        },
        createdAt: new Date(now.getTime() - 23.5 * 60 * 60 * 1000) // Created 23.5 hours ago
      },
      {
        id: 'task-2',
        type: 'insurance_verification',
        patientId: 'pat-002',
        scheduledFor: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour from now
        status: 'pending',
        priority: 'medium',
        metadata: {
          insuranceProvider: 'Bupa',
          lastVerified: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
        },
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
      }
    ]
  }

  getRecentActivities(limit: number = 10, role?: string): ReminderActivity[] {
    let filteredActivities = this.activities
    
    // Filter by role if specified
    if (role) {
      filteredActivities = this.activities.filter(activity => {
        const roles = activity.relevantRoles || ['Reception', 'Clinician', 'Manager'] // Default to all roles
        return roles.includes(role)
      })
    }
    
    // For demo purposes, always show activities from core enabled packs
    // In production, this would respect the actual enabled pack states
    const demoEnabledPacks = ['patient-outreach', 'insurance-eligibility', 'collections-billing', 'clinical-documentation', 'smart-scheduling']
    filteredActivities = filteredActivities.filter(activity => 
      demoEnabledPacks.includes(activity.packId)
    )
    
    return filteredActivities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  private getEnabledPackIds(): string[] {
    // In a real app, this would use the autopilot packs store
    // For demo, we'll simulate some enabled packs
    return ['patient-outreach', 'insurance-eligibility', 'collections-billing', 'clinical-documentation', 'smart-scheduling', 'compliance-monitoring', 'call-management', 'inventory-supplies']
  }

  getPendingTasks(): ReminderTask[] {
    return this.tasks.filter(task => task.status === 'pending')
  }

  getTasksForNext24Hours(): ReminderTask[] {
    const now = new Date()
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    return this.tasks.filter(task => 
      task.status === 'pending' && 
      task.scheduledFor <= next24Hours
    )
  }

  // Simulate processing a reminder task
  async processReminderTask(taskId: string): Promise<ReminderActivity> {
    const task = this.tasks.find(t => t.id === taskId)
    if (!task) throw new Error('Task not found')

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mark task as completed
    task.status = 'completed'
    task.completedAt = new Date()

    // Create activity record
    const activity: ReminderActivity = {
      id: `activity-${Date.now()}`,
      timestamp: new Date(),
      type: task.type === 'appointment_reminder' ? 'reminder_sent' : 'insurance_verified',
      patientName: this.getPatientNameFromId(task.patientId),
      appointmentTime: task.appointmentId ? 'Tomorrow 10:00 AM' : undefined,
      details: task.type === 'appointment_reminder' 
        ? `SMS reminder sent successfully for ${task.message}`
        : `Insurance verified with ${task.metadata?.insuranceProvider || 'provider'}`,
      status: Math.random() > 0.1 ? 'success' : 'warning', // 90% success rate
      automated: true
    }

    this.activities.unshift(activity)
    
    // Add to global timeline if callback is set
    if (this.timelineCallback) {
      this.timelineCallback({
        type: activity.type === 'reminder_sent' ? 'reminder.sent' : 'insurance.verified',
        summary: activity.details,
        actor: 'system',
        source: 'cmdk',
        automated: true,
        category: activity.type === 'reminder_sent' ? 'reminder' : 'verification',
        patientName: activity.patientName
      })
    }
    
    return activity
  }

  private getPatientNameFromId(patientId: string): string {
    // In a real system, this would lookup the patient name
    const names = ['Sarah Jones', 'Michael Chen', 'Emma Thompson', 'James Wilson', 'Lisa Anderson']
    return names[Math.floor(Math.random() * names.length)]
  }

  // Get statistics for the dashboard
  getStats() {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const recentActivities = this.activities.filter(a => a.timestamp >= last24Hours)
    
    return {
      totalTasksToday: recentActivities.length,
      successfulReminders: recentActivities.filter(a => a.type === 'reminder_sent' && a.status === 'success').length,
      verifiedInsurance: recentActivities.filter(a => a.type === 'insurance_verified' && a.status === 'success').length,
      pendingTasks: this.getPendingTasks().length,
      next24HourTasks: this.getTasksForNext24Hours().length
    }
  }

  // Simulate real-time background processing
  startBackgroundProcessing() {
    // This would normally be a separate background service
    // For demo purposes, we'll simulate it with intervals
    setInterval(() => {
      const pendingTasks = this.getTasksForNext24Hours()
      
      pendingTasks.forEach(async (task) => {
        const now = new Date()
        // Process tasks that are due (within 5 minutes of scheduled time)
        if (task.scheduledFor.getTime() <= now.getTime() + 5 * 60 * 1000) {
          try {
            await this.processReminderTask(task.id)
            console.log(`✅ Processed reminder task: ${task.id}`)
          } catch (error) {
            console.error(`❌ Failed to process task: ${task.id}`, error)
          }
        }
      })
    }, 30000) // Check every 30 seconds
  }
}

export const reminderEngine = new ReminderEngineService()

// Auto-start background processing in client
if (typeof window !== 'undefined') {
  reminderEngine.startBackgroundProcessing()
}
