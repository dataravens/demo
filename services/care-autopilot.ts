'use client'

import type { 
  CohortPatient, 
  CohortSummary, 
  CareSignal, 
  PathwayTemplate, 
  PatientPathway, 
  PopulationKPI, 
  CareAutopilotStats,
  CohortType,
  RiskLevel,
  SignalSeverity,
  AutopilotMode,
  PathwayStage
} from '@/types/care-autopilot'
import type { EventItem } from '@/types/core'

class CareAutopilotService {
  private cohortPatients: CohortPatient[] = []
  private careSignals: CareSignal[] = []
  private pathwayTemplates: PathwayTemplate[] = []
  private patientPathways: PatientPathway[] = []
  private timelineCallback?: (event: Omit<EventItem, 'id' | 'ts'>) => void

  constructor() {
    this.initializeDemoData()
  }

  setTimelineCallback(callback: (event: Omit<EventItem, 'id' | 'ts'>) => void) {
    this.timelineCallback = callback
  }

  private initializeDemoData() {
    // Initialize cohort patients with realistic data
    this.cohortPatients = [
      // Diabetes cohort
      {
        id: 'patient-dm-001',
        name: 'Margaret Thompson',
        dateOfBirth: '1965-03-15',
        cohortType: 'diabetes',
        riskLevel: 'high',
        pathwayStage: 'maintain',
        careGaps: [
          {
            id: 'gap-001',
            type: 'overdue_lab',
            description: 'HbA1c overdue by 23 days',
            severity: 'medium',
            dueDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
            overdueDays: 23,
            actionRequired: 'Order HbA1c test',
            estimatedResolution: '2-3 days'
          }
        ],
        nextStep: 'Order HbA1c and review medication compliance',
        owner: 'Dr. Sarah Martinez',
        lastReview: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        autopilotMode: 'ask',
        consentForRemoteMonitoring: true
      },
      {
        id: 'patient-dm-002',
        name: 'Robert Chen',
        dateOfBirth: '1958-11-22',
        cohortType: 'diabetes',
        riskLevel: 'medium',
        pathwayStage: 'stabilise',
        careGaps: [],
        nextStep: 'Continue current management',
        owner: 'Dr. James Wilson',
        lastReview: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        nextReview: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        autopilotMode: 'scheduled',
        consentForRemoteMonitoring: true
      },
      {
        id: 'patient-dm-003',
        name: 'Patricia Williams',
        dateOfBirth: '1972-07-08',
        cohortType: 'diabetes',
        riskLevel: 'high',
        pathwayStage: 'maintain',
        careGaps: [
          {
            id: 'gap-002',
            type: 'no_readings',
            description: 'No blood glucose readings for 12 days',
            severity: 'medium',
            dueDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
            overdueDays: 12,
            actionRequired: 'Patient outreach and education',
            estimatedResolution: 'Same day'
          }
        ],
        nextStep: 'Contact patient about glucose monitoring',
        owner: 'Sarah Johnson (Care Coordinator)',
        lastReview: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        autopilotMode: 'ask',
        consentForRemoteMonitoring: true
      },

      // Hypertension cohort
      {
        id: 'patient-htn-001',
        name: 'David Johnson',
        dateOfBirth: '1960-09-12',
        cohortType: 'hypertension',
        riskLevel: 'medium',
        pathwayStage: 'maintain',
        careGaps: [],
        nextStep: 'Continue home BP monitoring',
        owner: 'Dr. Emily Chen',
        lastReview: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autopilotMode: 'scheduled',
        consentForRemoteMonitoring: true
      },
      {
        id: 'patient-htn-002',
        name: 'Linda Davis',
        dateOfBirth: '1955-04-30',
        cohortType: 'hypertension',
        riskLevel: 'high',
        pathwayStage: 'stabilise',
        careGaps: [
          {
            id: 'gap-003',
            type: 'no_readings',
            description: 'No BP readings for 8 days',
            severity: 'medium',
            dueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            overdueDays: 8,
            actionRequired: 'BP monitoring reminder',
            estimatedResolution: 'Same day'
          }
        ],
        nextStep: 'Send BP monitoring reminder',
        owner: 'Dr. Sarah Martinez',
        lastReview: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        autopilotMode: 'ask',
        consentForRemoteMonitoring: true
      },

      // COPD cohort
      {
        id: 'patient-copd-001',
        name: 'Michael Brown',
        dateOfBirth: '1950-12-05',
        cohortType: 'copd',
        riskLevel: 'high',
        pathwayStage: 'maintain',
        careGaps: [
          {
            id: 'gap-004',
            type: 'follow_up_needed',
            description: 'Post-exacerbation follow-up due',
            severity: 'medium',
            dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            overdueDays: 2,
            actionRequired: 'Schedule follow-up appointment',
            estimatedResolution: '1-2 days'
          }
        ],
        nextStep: 'Schedule post-exacerbation review',
        owner: 'Dr. James Wilson',
        lastReview: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextReview: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        autopilotMode: 'ask',
        consentForRemoteMonitoring: true
      },

      // Post-op cohort
      {
        id: 'patient-postop-001',
        name: 'Jennifer Wilson',
        dateOfBirth: '1968-08-18',
        cohortType: 'post-op',
        riskLevel: 'medium',
        pathwayStage: 'stabilise',
        careGaps: [
          {
            id: 'gap-005',
            type: 'discharge_coordination',
            description: 'Day 7 post-op check needed',
            severity: 'low',
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            actionRequired: 'Schedule post-op appointment',
            estimatedResolution: 'Same day'
          }
        ],
        nextStep: 'Day 7 post-operative assessment',
        owner: 'Dr. Emily Chen',
        lastReview: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        nextReview: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        autopilotMode: 'scheduled',
        consentForRemoteMonitoring: false
      }
    ]

    // Initialize care signals - focused on administrative outreach
    this.careSignals = [
      {
        id: 'signal-001',
        patientId: 'patient-dm-001',
        patientName: 'Margaret Thompson',
        type: 'missed_reading',
        severity: 'low',
        title: 'Missed glucose monitoring check-in',
        description: 'Margaret hasn\'t shared her glucose readings for 5 days - she usually checks in twice weekly',
        detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        source: 'monitor',
        triggerRule: 'No readings for >5 days from regular patient',
        triggerData: { lastReading: '5 days ago', usualFrequency: 'twice weekly' },
        proposedPlan: {
          title: 'Personal check-in with Margaret',
          rationale: 'Margaret is usually very consistent with her monitoring - a gentle personal check-in would show we care',
          steps: [
            'Send personalized message: "Hi Margaret, Dr. Martinez noticed you haven\'t shared your readings this week. Hope you\'re doing well - just wanted to check if everything\'s okay?"',
            'Include easy one-tap response options: "All good" / "Need help" / "Call me"',
            'If no response in 24h, add gentle follow-up task for reception',
            'Note patient\'s usual monitoring pattern for future reference'
          ],
          tools: ['SMS', 'Patient Portal', 'Reception Task'],
          eta: 'Same day',
          riskIfIgnored: 'Patient may feel forgotten or unsupported'
        },
        escalationLevel: 1,
        requiresApproval: false,
        status: 'new'
      },
      {
        id: 'signal-002',
        patientId: 'patient-htn-002',
        patientName: 'Linda Davis',
        type: 'missed_reading',
        severity: 'low',
        title: 'Linda hasn\'t shared BP readings lately',
        description: 'Linda usually sends her weekly BP readings on Sundays - it\'s been 8 days since her last check-in',
        detectedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        source: 'monitor',
        triggerRule: 'No BP readings for >7 days from regular Sunday reporter',
        proposedPlan: {
          title: 'Gentle reminder for Linda',
          rationale: 'Linda has been great about her weekly Sunday readings - a friendly nudge will help maintain the routine',
          steps: [
            'Send caring message: "Hi Linda! Hope you\'re having a good week. We usually get your BP readings on Sundays and wanted to make sure your monitor is working okay?"',
            'Include helpful tip: "Remember, Dr. Chen likes to see readings taken at the same time each day when possible"',
            'Add quick response buttons: "Will send today" / "Monitor issues" / "Forgot, sorry!"',
            'Set gentle 3-day follow-up if no response'
          ],
          tools: ['SMS', 'Patient Portal'],
          eta: 'Same day',
          riskIfIgnored: 'Loss of positive monitoring habit and patient engagement'
        },
        escalationLevel: 1,
        requiresApproval: false,
        status: 'new'
      },
      {
        id: 'signal-003',
        patientId: 'patient-copd-001',
        patientName: 'Michael Brown',
        type: 'trend_alert',
        severity: 'medium',
        title: 'Michael\'s peak flow readings look concerning',
        description: 'Michael\'s peak flow has dropped from his usual 280 to 210 over the past few days - he may need some support',
        detectedAt: new Date(Date.now() - 30 * 60 * 1000),
        source: 'device',
        triggerRule: 'Peak flow decline >20% from personal best',
        triggerData: { baseline: 280, current: 210, trend: 'declining' },
        proposedPlan: {
          title: 'Check in with Michael about his breathing',
          rationale: 'Michael\'s readings suggest he might be having a rough patch - Dr. Wilson would want to know so he can offer support',
          steps: [
            'Send caring message: "Hi Michael, Dr. Wilson noticed your peak flow readings have been lower this week. How are you feeling? Any changes in your breathing or daily routine?"',
            'Include easy response options: "Feeling fine" / "A bit breathless" / "Please call me"',
            'If concerning response, create priority task for Dr. Wilson to call same day',
            'Send gentle reminder about rescue inhaler technique and when to use it'
          ],
          tools: ['SMS', 'Patient Portal', 'Doctor Task'],
          eta: 'Within 2 hours',
          riskIfIgnored: 'Michael may struggle without knowing help is available'
        },
        escalationLevel: 2,
        requiresApproval: true,
        status: 'new'
      },
      {
        id: 'signal-004',
        patientId: 'patient-postop-001',
        patientName: 'Jennifer Wilson',
        type: 'discharge',
        severity: 'low',
        title: 'Jennifer\'s follow-up appointment is tomorrow',
        description: 'Jennifer has her 7-day post-op check with Dr. Chen tomorrow - she seemed a bit anxious about the healing process at discharge',
        detectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        source: 'ehr',
        triggerRule: 'Post-op day 7 follow-up scheduled',
        proposedPlan: {
          title: 'Supportive pre-appointment outreach for Jennifer',
          rationale: 'Jennifer was anxious at discharge - a caring check-in would reassure her and prepare her for tomorrow\'s visit',
          steps: [
            'Send encouraging message: "Hi Jennifer! Hope you\'re recovering well at home. Dr. Chen is looking forward to seeing you tomorrow at 2pm for your check-up."',
            'Include helpful prep: "Feel free to write down any questions or concerns beforehand - Dr. Chen wants to make sure you\'re completely comfortable with your recovery"',
            'Add practical reminder: "Remember to bring your medication list and wear something easy to remove for the examination"',
            'Offer support: "If you have any worries before tomorrow, don\'t hesitate to call us"'
          ],
          tools: ['SMS', 'Patient Portal'],
          eta: 'This afternoon',
          riskIfIgnored: 'Jennifer may arrive tomorrow feeling anxious and unprepared'
        },
        escalationLevel: 1,
        requiresApproval: false,
        status: 'acknowledged'
      },
      {
        id: 'signal-005',
        patientId: 'patient-dm-003',
        patientName: 'Patricia Williams',
        type: 'medication_gap',
        severity: 'medium',
        title: 'Patricia may need her Metformin prescription renewed',
        description: 'Patricia\'s Metformin prescription expired 5 days ago and she hasn\'t requested a refill - she\'s usually very proactive about this',
        detectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        source: 'ehr',
        triggerRule: 'Essential medication >3 days overdue for regular patient',
        proposedPlan: {
          title: 'Caring medication check-in for Patricia',
          rationale: 'Patricia is usually on top of her prescriptions - a gentle check would show we\'re paying attention to her care',
          steps: [
            'Send thoughtful message: "Hi Patricia! We noticed your Metformin prescription expired a few days ago. Since you\'re usually so good about staying on top of things, we wanted to check if you need help with a refill?"',
            'Include easy options: "I have medication" / "Need new prescription" / "Having issues with pharmacy"',
            'If she needs a refill, prepare prescription for Dr. Martinez to approve quickly',
            'Follow up with: "Dr. Martinez appreciates how well you manage your diabetes care - we\'re always here to support you"'
          ],
          tools: ['SMS', 'Patient Portal', 'E-Prescription'],
          eta: 'Same day',
          riskIfIgnored: 'Patricia may feel her care isn\'t being monitored'
        },
        escalationLevel: 2,
        requiresApproval: true,
        status: 'new'
      }
    ]
  }

  // Cohort management
  getCohortSummaries(): CohortSummary[] {
    return [
      {
        type: 'diabetes',
        name: 'Diabetes',
        totalPatients: this.cohortPatients.filter(p => p.cohortType === 'diabetes').length,
        highRisk: this.cohortPatients.filter(p => p.cohortType === 'diabetes' && p.riskLevel === 'high').length,
        careGaps: this.cohortPatients.filter(p => p.cohortType === 'diabetes').reduce((sum, p) => sum + p.careGaps.length, 0),
        activeSignals: this.careSignals.filter(s => this.cohortPatients.find(p => p.id === s.patientId)?.cohortType === 'diabetes' && s.status === 'new').length,
        color: 'bg-blue-500',
        icon: '🩺'
      },
      {
        type: 'hypertension',
        name: 'Hypertension',
        totalPatients: this.cohortPatients.filter(p => p.cohortType === 'hypertension').length,
        highRisk: this.cohortPatients.filter(p => p.cohortType === 'hypertension' && p.riskLevel === 'high').length,
        careGaps: this.cohortPatients.filter(p => p.cohortType === 'hypertension').reduce((sum, p) => sum + p.careGaps.length, 0),
        activeSignals: this.careSignals.filter(s => this.cohortPatients.find(p => p.id === s.patientId)?.cohortType === 'hypertension' && s.status === 'new').length,
        color: 'bg-red-500',
        icon: '❤️'
      },
      {
        type: 'copd',
        name: 'COPD',
        totalPatients: this.cohortPatients.filter(p => p.cohortType === 'copd').length,
        highRisk: this.cohortPatients.filter(p => p.cohortType === 'copd' && p.riskLevel === 'high').length,
        careGaps: this.cohortPatients.filter(p => p.cohortType === 'copd').reduce((sum, p) => sum + p.careGaps.length, 0),
        activeSignals: this.careSignals.filter(s => this.cohortPatients.find(p => p.id === s.patientId)?.cohortType === 'copd' && s.status === 'new').length,
        color: 'bg-green-500',
        icon: '🫁'
      },
      {
        type: 'post-op',
        name: 'Post-Op',
        totalPatients: this.cohortPatients.filter(p => p.cohortType === 'post-op').length,
        highRisk: this.cohortPatients.filter(p => p.cohortType === 'post-op' && p.riskLevel === 'high').length,
        careGaps: this.cohortPatients.filter(p => p.cohortType === 'post-op').reduce((sum, p) => sum + p.careGaps.length, 0),
        activeSignals: this.careSignals.filter(s => this.cohortPatients.find(p => p.id === s.patientId)?.cohortType === 'post-op' && s.status === 'new').length,
        color: 'bg-purple-500',
        icon: '🏥'
      },
      {
        type: 'high-risk',
        name: 'High Risk',
        totalPatients: this.cohortPatients.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length,
        highRisk: this.cohortPatients.filter(p => p.riskLevel === 'critical').length,
        careGaps: this.cohortPatients.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').reduce((sum, p) => sum + p.careGaps.length, 0),
        activeSignals: this.careSignals.filter(s => ['high', 'critical'].includes(s.severity) && s.status === 'new').length,
        color: 'bg-orange-500',
        icon: '⚠️'
      },
      {
        type: 'unassigned',
        name: 'Unassigned',
        totalPatients: 3, // Mock data for patients not yet in pathways
        highRisk: 1,
        careGaps: 2,
        activeSignals: 1,
        color: 'bg-gray-500',
        icon: '❓'
      }
    ]
  }

  getCohortPatients(cohortType?: CohortType): CohortPatient[] {
    if (!cohortType) return this.cohortPatients
    if (cohortType === 'high-risk') {
      return this.cohortPatients.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical')
    }
    return this.cohortPatients.filter(p => p.cohortType === cohortType)
  }

  // Signal management
  getCareSignals(severity?: SignalSeverity): CareSignal[] {
    if (!severity) return this.careSignals.filter(s => s.status === 'new' || s.status === 'acknowledged')
    return this.careSignals.filter(s => s.severity === severity && (s.status === 'new' || s.status === 'acknowledged'))
  }

  acknowledgeSignal(signalId: string, userId: string): void {
    const signal = this.careSignals.find(s => s.id === signalId)
    if (signal) {
      signal.status = 'acknowledged'
      signal.handledBy = userId
      signal.handledAt = new Date()
      
      // Add to timeline
      if (this.timelineCallback) {
        this.timelineCallback({
          type: 'care.signal.acknowledged',
          summary: `Acknowledged ${signal.title} for ${signal.patientName}`,
          actor: 'user',
          source: 'cmdk',
          automated: false,
          category: 'general',
          patientName: signal.patientName
        })
      }
    }
  }

  dismissSignal(signalId: string, userId: string, reason?: string): void {
    const signal = this.careSignals.find(s => s.id === signalId)
    if (signal) {
      signal.status = 'dismissed'
      signal.handledBy = userId
      signal.handledAt = new Date()
      
      // Add to timeline
      if (this.timelineCallback) {
        this.timelineCallback({
          type: 'care.signal.dismissed',
          summary: `Dismissed ${signal.title} for ${signal.patientName}${reason ? `: ${reason}` : ''}`,
          actor: 'user',
          source: 'cmdk',
          automated: false,
          category: 'general',
          patientName: signal.patientName
        })
      }
    }
  }

  // Population KPIs
  getPopulationKPIs(): PopulationKPI[] {
    const diabeticPatients = this.cohortPatients.filter(p => p.cohortType === 'diabetes')
    const hypertensionPatients = this.cohortPatients.filter(p => p.cohortType === 'hypertension')
    
    return [
      {
        id: 'kpi-dm-hba1c',
        title: 'DM: HbA1c Overdue',
        value: 18,
        unit: 'patients',
        trend: 'up',
        trendValue: 3,
        severity: 'medium',
        description: 'Diabetic patients with overdue HbA1c tests',
        actionable: true,
        actionText: 'Order batch',
        cohortFilter: 'diabetes'
      },
      {
        id: 'kpi-htn-readings',
        title: 'HTN: No Readings 7d',
        value: 7,
        unit: 'patients',
        trend: 'stable',
        trendValue: 0,
        severity: 'low',
        description: 'Hypertensive patients without recent BP readings',
        actionable: true,
        actionText: 'Nudge via SMS',
        cohortFilter: 'hypertension'
      },
      {
        id: 'kpi-discharge-followup',
        title: 'Discharge without Follow-up <7d',
        value: 3,
        unit: 'patients',
        trend: 'down',
        trendValue: -1,
        severity: 'medium',
        description: 'Recent discharges lacking scheduled follow-up',
        actionable: true,
        actionText: 'Hold slots + invite',
        cohortFilter: 'post-op'
      },
      {
        id: 'kpi-pathway-adherence',
        title: 'Pathway Adherence',
        value: 87,
        unit: '%',
        trend: 'up',
        trendValue: 2,
        severity: 'low',
        description: 'Patients following their care pathways',
        actionable: true,
        actionText: 'Send catch-up plan'
      }
    ]
  }

  // Statistics
  getAutopilotStats(): CareAutopilotStats {
    const totalCareGaps = this.cohortPatients.reduce((sum, p) => sum + p.careGaps.length, 0)
    const overdueGaps = this.cohortPatients.reduce((sum, p) => 
      sum + p.careGaps.filter(g => g.overdueDays && g.overdueDays > 0).length, 0
    )
    
    return {
      totalPatients: this.cohortPatients.length,
      activePathways: this.cohortPatients.filter(p => p.pathwayStage !== 'review').length,
      openSignals: this.careSignals.filter(s => s.status === 'new' || s.status === 'acknowledged').length,
      resolvedToday: 4, // Mock data
      
      autopilotActions: {
        scheduled: 12,
        executed: 8,
        failed: 1,
        pendingApproval: 3
      },
      
      careGaps: {
        total: totalCareGaps,
        overdue: overdueGaps,
        critical: this.cohortPatients.reduce((sum, p) => 
          sum + p.careGaps.filter(g => g.severity === 'high' || g.severity === 'critical').length, 0
        ),
        closedThisWeek: 6 // Mock data
      },
      
      riskDistribution: {
        low: this.cohortPatients.filter(p => p.riskLevel === 'low').length,
        medium: this.cohortPatients.filter(p => p.riskLevel === 'medium').length,
        high: this.cohortPatients.filter(p => p.riskLevel === 'high').length,
        critical: this.cohortPatients.filter(p => p.riskLevel === 'critical').length
      }
    }
  }

  // Bulk actions
  async executeBulkAction(action: string, patientIds: string[], context?: any): Promise<void> {
    // Add to timeline
    if (this.timelineCallback) {
      this.timelineCallback({
        type: 'care.bulk_action',
        summary: `Executed ${action} for ${patientIds.length} patients`,
        actor: 'user',
        source: 'cmdk',
        automated: false,
        category: 'general'
      })
    }
  }

  // Autopilot simulation
  simulateAutopilotActions(): void {
    // Simulate proactive autopilot actions
    setTimeout(() => {
      if (this.timelineCallback) {
        this.timelineCallback({
          type: 'care.autopilot.action',
          summary: 'Autopilot sent medication reminders to 3 diabetes patients',
          actor: 'autopilot',
          source: 'cmdk',
          automated: true,
          category: 'reminder'
        })
      }
    }, 5000)

    setTimeout(() => {
      if (this.timelineCallback) {
        this.timelineCallback({
          type: 'care.autopilot.action',
          summary: 'Autopilot scheduled follow-up for 2 high-risk patients',
          actor: 'autopilot',
          source: 'cmdk',
          automated: true,
          category: 'general'
        })
      }
    }, 15000)
  }
}

export const careAutopilot = new CareAutopilotService()
