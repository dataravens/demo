'use client'

import type { 
  IntakeSession, 
  IntakeTemplate, 
  IntakeStats, 
  IntakeInsight,
  IntakeConversationMessage,
  IntakeStatus
} from '@/types/ai-intake'
import type { EventItem } from '@/types/core'
import { practiceAI } from './ai'

class AIIntakeService {
  private sessions: IntakeSession[] = []
  private templates: IntakeTemplate[] = []
  private timelineCallback?: (event: Omit<EventItem, 'id' | 'ts'>) => void

  constructor() {
    this.initializeTemplates()
    this.initializeDemoSessions()
  }

  setTimelineCallback(callback: (event: Omit<EventItem, 'id' | 'ts'>) => void) {
    this.timelineCallback = callback
  }

  private addEventToTimeline(event: Omit<EventItem, 'id' | 'ts'>) {
    if (this.timelineCallback) {
      this.timelineCallback(event)
    }
  }

  private initializeTemplates() {
    this.templates = [
      {
        id: 'general-consultation',
        name: 'General Consultation',
        description: 'Standard intake for routine appointments',
        appointmentType: 'consultation',
        openingMessage: "Hi! I'm Dr. {doctorName}'s AI assistant. I'm here to help make your upcoming appointment more productive by understanding what's bringing you in today. This should only take a few minutes.",
        keyQuestions: [
          "What's the main reason you'd like to see Dr. {doctorName}?",
          "How long have you been experiencing this?",
          "On a scale of 1-10, how would you rate your concern level?",
          "Have you tried anything to help with this?",
          "Are you currently taking any medications?",
          "Is there anything specific you're hoping to get from this appointment?"
        ],
        followUpPrompts: [
          "Can you tell me more about that?",
          "When did you first notice this?",
          "How is this affecting your daily life?",
          "Have you had this before?"
        ],
        closingMessage: "Thank you for sharing this information. Dr. {doctorName} will review this before your appointment to make sure you get the most out of your time together.",
        maxMessages: 20,
        timeoutMinutes: 30,
        focusAreas: ['symptoms', 'duration', 'severity', 'medications', 'expectations']
      },
      {
        id: 'follow-up',
        name: 'Follow-up Appointment',
        description: 'For returning patients with ongoing conditions',
        appointmentType: 'follow-up',
        openingMessage: "Hello! I'm here to help prepare for your follow-up appointment with Dr. {doctorName}. Let's check in on how you've been doing since your last visit.",
        keyQuestions: [
          "How have you been feeling since your last appointment?",
          "Have you been taking your prescribed medications as directed?",
          "Have you noticed any changes or new symptoms?",
          "How well is your current treatment working for you?",
          "Do you have any concerns or questions for Dr. {doctorName}?"
        ],
        followUpPrompts: [
          "That's helpful to know. Can you elaborate?",
          "How often has this been happening?",
          "What seems to make it better or worse?",
          "Any side effects from your medications?"
        ],
        closingMessage: "Perfect! This information will help Dr. {doctorName} provide you with the best possible care during your follow-up.",
        maxMessages: 15,
        timeoutMinutes: 30,
        focusAreas: ['progress', 'medications', 'side_effects', 'new_symptoms', 'satisfaction']
      },
      {
        id: 'urgent-consultation',
        name: 'Urgent Consultation',
        description: 'For same-day or urgent appointments',
        appointmentType: 'urgent',
        openingMessage: "Hi, I understand you need to see Dr. {doctorName} urgently today. I'm here to gather some quick information to help the doctor prepare for your visit.",
        keyQuestions: [
          "What's happening that made you need to be seen today?",
          "When did this start?",
          "How severe would you say this is on a scale of 1-10?",
          "Have you taken any medications or tried anything for this?",
          "Do you have any allergies I should know about?"
        ],
        followUpPrompts: [
          "That sounds concerning. Tell me more.",
          "Is this getting worse, better, or staying the same?",
          "Any other symptoms along with this?",
          "Have you had anything like this before?"
        ],
        closingMessage: "Thank you. Dr. {doctorName} will be prepared to address your urgent concern when you arrive.",
        maxMessages: 12,
        timeoutMinutes: 15,
        focusAreas: ['urgent_symptoms', 'severity', 'onset', 'allergies', 'immediate_needs']
      }
    ]
  }

  private initializeDemoSessions() {
    const now = Date.now()
    
    this.sessions = [
      {
        id: 'intake-001',
        patientId: 'patient-sarah-jones',
        patientName: 'Sarah Jones',
        appointmentId: 'apt-001',
        appointmentDate: new Date(now + 24 * 60 * 60 * 1000), // Tomorrow
        requestedBy: 'Dr. Emily Chen',
        requestedAt: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'completed',
        linkSentAt: new Date(now - 2 * 60 * 60 * 1000),
        startedAt: new Date(now - 90 * 60 * 1000), // 90 min ago
        completedAt: new Date(now - 75 * 60 * 1000), // 75 min ago
        expiresAt: new Date(now + 22 * 60 * 60 * 1000),
        accessToken: 'secure-token-sarah-001',
        conversation: [
          {
            id: 'msg-001',
            role: 'ai',
            content: "Hi Sarah! I'm Dr. Chen's AI assistant. I'm here to help make your upcoming appointment more productive by understanding what's bringing you in today. This should only take a few minutes.",
            timestamp: new Date(now - 90 * 60 * 1000)
          },
          {
            id: 'msg-002',
            role: 'patient',
            content: "Hi! I've been having some persistent headaches for the past few weeks and wanted to get them checked out.",
            timestamp: new Date(now - 89 * 60 * 1000)
          },
          {
            id: 'msg-003',
            role: 'ai',
            content: "I understand you've been experiencing headaches. Can you tell me more about them? When do they typically occur and how would you describe the pain?",
            timestamp: new Date(now - 88 * 60 * 1000)
          },
          {
            id: 'msg-004',
            role: 'patient',
            content: "They usually happen in the afternoon, around 2-3pm. It's like a dull ache that starts at the back of my head and spreads forward. Sometimes it gets quite intense.",
            timestamp: new Date(now - 87 * 60 * 1000)
          },
          {
            id: 'msg-005',
            role: 'ai',
            content: "That's helpful information. On a scale of 1-10, how would you rate the intensity when they're at their worst? And have you noticed anything that seems to trigger them?",
            timestamp: new Date(now - 86 * 60 * 1000)
          },
          {
            id: 'msg-006',
            role: 'patient',
            content: "At worst, probably a 7. I've noticed they seem worse on days when I'm working long hours at my computer. I work in graphic design so I'm staring at screens a lot.",
            timestamp: new Date(now - 85 * 60 * 1000)
          },
          {
            id: 'msg-007',
            role: 'ai',
            content: "That connection to screen time is very useful information. Have you tried anything to help with the headaches? Any over-the-counter medications or other remedies?",
            timestamp: new Date(now - 84 * 60 * 1000)
          },
          {
            id: 'msg-008',
            role: 'patient',
            content: "I've been taking ibuprofen when they get bad, which helps temporarily. I also try to take breaks from the computer but it's hard with deadlines. I drink plenty of water too.",
            timestamp: new Date(now - 83 * 60 * 1000)
          },
          {
            id: 'msg-009',
            role: 'ai',
            content: "You're doing some good things already. Are you currently taking any other medications regularly? And do you have any known allergies?",
            timestamp: new Date(now - 82 * 60 * 1000)
          },
          {
            id: 'msg-010',
            role: 'patient',
            content: "Just a daily vitamin D supplement. No known allergies to medications. I'm hoping Dr. Chen can help figure out if this is related to my work setup or if there's something else going on.",
            timestamp: new Date(now - 81 * 60 * 1000)
          },
          {
            id: 'msg-011',
            role: 'ai',
            content: "Thank you for sharing all this information, Sarah. Dr. Chen will review this before your appointment to make sure you get the most out of your time together. She'll be well-prepared to discuss your headaches and explore both ergonomic factors and other potential causes.",
            timestamp: new Date(now - 80 * 60 * 1000)
          }
        ],
        aiSummary: {
          chiefConcern: 'Persistent afternoon headaches for several weeks',
          symptoms: ['Dull ache starting at back of head', 'Pain spreading forward', 'Intensity up to 7/10'],
          duration: 'Several weeks',
          severity: 'Moderate to severe (7/10)',
          previousTreatments: ['Ibuprofen (temporary relief)', 'Computer breaks', 'Adequate hydration'],
          currentMedications: ['Vitamin D supplement'],
          allergies: ['No known drug allergies'],
          concerns: ['Work-related screen time impact', 'Underlying cause'],
          expectations: ['Ergonomic assessment', 'Rule out other causes', 'Better management strategies'],
          redFlags: ['None identified'],
          recommendedFocus: ['Ergonomic evaluation', 'Tension headache assessment', 'Preventive strategies', 'Screen time management'],
          confidence: 0.92,
          conversationQuality: 'excellent'
        },
        doctorReviewed: true,
        doctorReviewedAt: new Date(now - 70 * 60 * 1000),
        doctorNotes: 'Excellent intake. Clear work-related pattern. Plan to assess ergonomics and consider tension headache management.'
      },
      
      {
        id: 'intake-002',
        patientId: 'patient-michael-brown',
        patientName: 'Michael Brown',
        appointmentId: 'apt-002',
        appointmentDate: new Date(now + 3 * 24 * 60 * 60 * 1000), // In 3 days
        requestedBy: 'Dr. James Wilson',
        requestedAt: new Date(now - 4 * 60 * 60 * 1000), // 4 hours ago
        status: 'completed',
        linkSentAt: new Date(now - 4 * 60 * 60 * 1000),
        startedAt: new Date(now - 3 * 60 * 60 * 1000),
        completedAt: new Date(now - 2.5 * 60 * 60 * 1000),
        expiresAt: new Date(now + 2 * 24 * 60 * 60 * 1000),
        accessToken: 'secure-token-michael-002',
        conversation: [
          {
            id: 'msg-101',
            role: 'ai',
            content: "Hello Michael! I'm here to help prepare for your follow-up appointment with Dr. Wilson. Let's check in on how you've been doing since your last visit.",
            timestamp: new Date(now - 3 * 60 * 60 * 1000)
          },
          {
            id: 'msg-102',
            role: 'patient',
            content: "Hi there. Overall I've been doing better with my breathing since starting the new inhaler, but I still have some rough days.",
            timestamp: new Date(now - 179 * 60 * 1000)
          },
          {
            id: 'msg-103',
            role: 'ai',
            content: "I'm glad to hear you're seeing some improvement! Can you tell me more about the rough days? How often are they happening and what makes them different?",
            timestamp: new Date(now - 178 * 60 * 1000)
          },
          {
            id: 'msg-104',
            role: 'patient',
            content: "Maybe 2-3 times a week I wake up feeling more tight in my chest. It's usually on days when the weather changes or when I've been around my neighbor's cat.",
            timestamp: new Date(now - 177 * 60 * 1000)
          },
          {
            id: 'msg-105',
            role: 'ai',
            content: "Those triggers make sense - weather changes and pet allergens can definitely affect COPD. Have you been taking your prescribed medications as directed? Both the daily inhaler and the rescue inhaler?",
            timestamp: new Date(now - 176 * 60 * 1000)
          },
          {
            id: 'msg-106',
            role: 'patient',
            content: "Yes, I use the daily inhaler every morning like Dr. Wilson said. I've had to use the rescue inhaler maybe 4-5 times in the past two weeks, mostly on those rough mornings.",
            timestamp: new Date(now - 175 * 60 * 1000)
          },
          {
            id: 'msg-107',
            role: 'ai',
            content: "That frequency sounds reasonable for managing flare-ups. Any side effects from either inhaler that you've noticed?",
            timestamp: new Date(now - 174 * 60 * 1000)
          },
          {
            id: 'msg-108',
            role: 'patient',
            content: "Not really, though sometimes my mouth feels a bit dry after using the daily one. Dr. Wilson mentioned that might happen. I rinse my mouth after like he suggested.",
            timestamp: new Date(now - 173 * 60 * 1000)
          },
          {
            id: 'msg-109',
            role: 'ai',
            content: "Perfect - you're doing exactly the right thing with the mouth rinsing. Do you have any concerns or questions you'd like to discuss with Dr. Wilson at your appointment?",
            timestamp: new Date(now - 172 * 60 * 1000)
          },
          {
            id: 'msg-110',
            role: 'patient',
            content: "I'm wondering if there's anything else I can do about the weather sensitivity. And maybe we could talk about whether I need to completely avoid my neighbor's cat or if there are other options.",
            timestamp: new Date(now - 171 * 60 * 1000)
          },
          {
            id: 'msg-111',
            role: 'ai',
            content: "Those are excellent questions that Dr. Wilson will be able to address. Thank you for this update, Michael. This information will help him provide you with the best possible care during your follow-up.",
            timestamp: new Date(now - 170 * 60 * 1000)
          }
        ],
        aiSummary: {
          chiefConcern: 'COPD follow-up with ongoing weather and allergen sensitivity',
          symptoms: ['Chest tightness on rough days', 'Weather-related flares', 'Cat allergy reactions'],
          duration: 'Since last visit (ongoing condition)',
          severity: 'Mild to moderate (well-controlled overall)',
          previousTreatments: ['Daily inhaler (good compliance)', 'Rescue inhaler as needed'],
          currentMedications: ['Daily COPD inhaler', 'Rescue inhaler (PRN)'],
          allergies: ['Cat allergen sensitivity'],
          concerns: ['Weather sensitivity management', 'Pet allergen avoidance strategies'],
          expectations: ['Weather management advice', 'Allergen exposure guidance', 'Continued symptom control'],
          redFlags: ['None - stable condition'],
          recommendedFocus: ['Weather trigger management', 'Allergen avoidance strategies', 'Medication effectiveness review'],
          confidence: 0.95,
          conversationQuality: 'excellent'
        },
        doctorReviewed: true,
        doctorReviewedAt: new Date(now - 2.3 * 60 * 60 * 1000),
        doctorNotes: 'Good compliance and improvement. Focus on environmental trigger management and allergen strategies.'
      },

      {
        id: 'intake-003',
        patientId: 'patient-emma-davis',
        patientName: 'Emma Davis',
        appointmentId: 'apt-003',
        appointmentDate: new Date(now + 6 * 60 * 60 * 1000), // In 6 hours (urgent)
        requestedBy: 'Dr. Sarah Martinez',
        requestedAt: new Date(now - 30 * 60 * 1000), // 30 min ago
        status: 'in_progress',
        linkSentAt: new Date(now - 30 * 60 * 1000),
        startedAt: new Date(now - 10 * 60 * 1000),
        expiresAt: new Date(now + 5 * 60 * 60 * 1000),
        accessToken: 'secure-token-emma-003',
        conversation: [
          {
            id: 'msg-201',
            role: 'ai',
            content: "Hi Emma, I understand you need to see Dr. Martinez urgently today. I'm here to gather some quick information to help the doctor prepare for your visit.",
            timestamp: new Date(now - 10 * 60 * 1000)
          },
          {
            id: 'msg-202',
            role: 'patient',
            content: "Yes, I woke up this morning with severe abdominal pain that's been getting worse.",
            timestamp: new Date(now - 9 * 60 * 1000)
          },
          {
            id: 'msg-203',
            role: 'ai',
            content: "I'm sorry you're experiencing this pain. Can you tell me where exactly the pain is located and how you would rate it on a scale of 1-10?",
            timestamp: new Date(now - 8 * 60 * 1000)
          },
          {
            id: 'msg-204',
            role: 'patient',
            content: "It's mainly on my right side, lower abdomen. Started as a dull ache around my belly button but now it's sharp and probably an 8 out of 10.",
            timestamp: new Date(now - 7 * 60 * 1000)
          }
        ],
        aiSummary: {
          chiefConcern: 'Severe right lower abdominal pain',
          symptoms: ['Sharp pain (8/10)', 'Started periumbilical', 'Migrated to RLQ'],
          duration: 'Since this morning',
          severity: 'Severe (8/10)',
          previousTreatments: ['None yet'],
          currentMedications: ['To be determined'],
          allergies: ['To be determined'],
          concerns: ['Severe pain', 'Worsening symptoms'],
          expectations: ['Urgent evaluation', 'Pain relief'],
          redFlags: ['Possible appendicitis pattern'],
          recommendedFocus: ['Urgent abdominal assessment', 'Rule out appendicitis', 'Pain management'],
          confidence: 0.85,
          conversationQuality: 'good'
        }
      },

      {
        id: 'intake-004',
        patientId: 'patient-david-wilson',
        patientName: 'David Wilson',
        appointmentId: 'apt-004',
        appointmentDate: new Date(now + 2 * 24 * 60 * 60 * 1000), // In 2 days
        requestedBy: 'Dr. Emily Chen',
        requestedAt: new Date(now - 6 * 60 * 60 * 1000),
        status: 'sent',
        linkSentAt: new Date(now - 6 * 60 * 60 * 1000),
        expiresAt: new Date(now + 1.5 * 24 * 60 * 60 * 1000),
        accessToken: 'secure-token-david-004',
        conversation: []
      }
    ]
  }

  // Public methods
  getSessions(status?: IntakeStatus): IntakeSession[] {
    if (!status) return this.sessions
    return this.sessions.filter(session => session.status === status)
  }

  getSessionById(sessionId: string): IntakeSession | undefined {
    return this.sessions.find(session => session.id === sessionId)
  }

  getSessionByToken(accessToken: string): IntakeSession | undefined {
    return this.sessions.find(session => session.accessToken === accessToken)
  }

  getUpcomingAppointmentsWithIntake(): IntakeSession[] {
    const now = new Date()
    return this.sessions.filter(session => 
      session.appointmentDate > now && 
      (session.status === 'completed' || session.status === 'in_progress')
    ).sort((a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime())
  }

  async requestIntake(patientId: string, patientName: string, appointmentId: string, appointmentDate: Date, doctorName: string): Promise<IntakeSession> {
    const session: IntakeSession = {
      id: `intake-${Date.now()}`,
      patientId,
      patientName,
      appointmentId,
      appointmentDate,
      requestedBy: doctorName,
      requestedAt: new Date(),
      status: 'requested',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      accessToken: `secure-token-${patientId}-${Date.now()}`,
      conversation: []
    }

    this.sessions.push(session)

    // Add to timeline
    this.addEventToTimeline({
      type: 'intake.requested',
      summary: `AI pre-appointment intake requested for ${patientName}`,
      actor: 'user',
      source: 'cmdk',
      automated: false,
      category: 'general',
      patientName
    })

    return session
  }

  async sendIntakeLink(sessionId: string): Promise<void> {
    const session = this.sessions.find(s => s.id === sessionId)
    if (session) {
      session.status = 'sent'
      session.linkSentAt = new Date()

      this.addEventToTimeline({
        type: 'intake.link_sent',
        summary: `AI intake link sent to ${session.patientName}`,
        actor: 'system',
        source: 'cmdk',
        automated: true,
        category: 'general',
        patientName: session.patientName
      })
    }
  }

  getStats(): IntakeStats {
    const completed = this.sessions.filter(s => s.status === 'completed')
    const total = this.sessions.length

    return {
      totalRequested: total,
      completionRate: total > 0 ? (completed.length / total) * 100 : 0,
      averageMessages: completed.length > 0 ? completed.reduce((sum, s) => sum + s.conversation.length, 0) / completed.length : 0,
      averageDuration: completed.length > 0 ? completed.reduce((sum, s) => {
        if (s.startedAt && s.completedAt) {
          return sum + (s.completedAt.getTime() - s.startedAt.getTime()) / (1000 * 60)
        }
        return sum
      }, 0) / completed.length : 0,
      patientSatisfaction: 4.7, // Mock data
      doctorSatisfaction: 4.8, // Mock data
      appointmentTimeReduction: 8.5, // Mock data
      preparationTimeReduction: 12.3 // Mock data
    }
  }

  getInsights(): IntakeInsight[] {
    return [
      {
        id: 'insight-1',
        title: 'Appointment Efficiency Boost',
        description: 'Doctors spend 8.5 minutes less per appointment when patients complete AI intake',
        impact: 'high',
        category: 'efficiency',
        metric: 'Minutes saved per appointment',
        value: 8.5,
        trend: 'up'
      },
      {
        id: 'insight-2',
        title: 'Patient Preparation Quality',
        description: 'Patients who complete intake arrive more focused and prepared',
        impact: 'high',
        category: 'quality',
        metric: 'Preparation score',
        value: 4.6,
        trend: 'up'
      },
      {
        id: 'insight-3',
        title: 'Completion Rate Excellence',
        description: 'High completion rate indicates strong patient engagement',
        impact: 'medium',
        category: 'satisfaction',
        metric: 'Completion rate',
        value: 85,
        trend: 'stable'
      }
    ]
  }

  async markReviewed(sessionId: string, doctorNotes?: string): Promise<void> {
    const session = this.sessions.find(s => s.id === sessionId)
    if (session) {
      session.doctorReviewed = true
      session.doctorReviewedAt = new Date()
      if (doctorNotes) {
        session.doctorNotes = doctorNotes
      }

      this.addEventToTimeline({
        type: 'intake.reviewed',
        summary: `AI intake reviewed for ${session.patientName}`,
        actor: 'user',
        source: 'cmdk',
        automated: false,
        category: 'general',
        patientName: session.patientName
      })
    }
  }
}

export const aiIntake = new AIIntakeService()
