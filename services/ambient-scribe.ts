'use client'

import type { ScribeSession, ClinicalNote, ScribeTemplate, Prescription, DiagnosticOrder, Referral, EventItem } from '@/types/core'
import { practiceAI } from './ai'

class AmbientScribeService {
  private sessions: ScribeSession[] = []
  private templates: ScribeTemplate[] = []
  private activeSession: ScribeSession | null = null
  private timelineCallback?: (event: Omit<EventItem, 'id' | 'ts'>) => void
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []

  constructor() {
    this.initializeDemoData()
  }

  setTimelineCallback(callback: (event: Omit<EventItem, 'id' | 'ts'>) => void) {
    this.timelineCallback = callback
  }

  private initializeDemoData() {
    // Initialize demo templates
    this.templates = [
      {
        id: 'general-consultation',
        name: 'General Consultation',
        appointmentType: 'consultation',
        sections: [
          { name: 'Chief Complaint', prompt: 'What is the main reason for the patient\'s visit?', required: true },
          { name: 'History of Present Illness', prompt: 'Describe the current symptoms and their progression', required: true },
          { name: 'Physical Examination', prompt: 'Document physical examination findings', required: true },
          { name: 'Assessment', prompt: 'Clinical assessment and diagnosis', required: true },
          { name: 'Plan', prompt: 'Treatment plan and next steps', required: true }
        ],
        createdBy: 'Dr. Sarah Martinez',
        createdAt: new Date('2024-01-15')
      },
      {
        id: 'follow-up',
        name: 'Follow-up Visit',
        appointmentType: 'follow-up',
        sections: [
          { name: 'Interval History', prompt: 'What has changed since the last visit?', required: true },
          { name: 'Current Medications', prompt: 'Review current medications and compliance', required: true },
          { name: 'Physical Examination', prompt: 'Focused examination based on condition', required: false },
          { name: 'Assessment', prompt: 'Progress assessment', required: true },
          { name: 'Plan', prompt: 'Adjusted treatment plan', required: true }
        ],
        createdBy: 'Dr. James Wilson',
        createdAt: new Date('2024-01-20')
      },
      {
        id: 'annual-physical',
        name: 'Annual Physical Exam',
        appointmentType: 'physical',
        sections: [
          { name: 'Review of Systems', prompt: 'Comprehensive review of all body systems', required: true },
          { name: 'Past Medical History', prompt: 'Update medical history and medications', required: true },
          { name: 'Social History', prompt: 'Lifestyle factors, occupation, habits', required: true },
          { name: 'Physical Examination', prompt: 'Complete physical examination', required: true },
          { name: 'Preventive Care', prompt: 'Screening recommendations and vaccinations', required: true }
        ],
        createdBy: 'Dr. Emily Chen',
        createdAt: new Date('2024-02-01')
      }
    ]

    // Initialize demo sessions
    this.sessions = [
      {
        id: 'session-001',
        patientId: 'patient-001',
        patientName: 'Sarah Jones',
        appointmentId: 'appt-001',
        clinicianId: 'dr-martinez',
        clinicianName: 'Dr. Sarah Martinez',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 60 * 1000), // 15 min session
        duration: 900, // 15 minutes
        status: 'completed',
        transcript: `Dr. Martinez: Good morning Sarah, how are you feeling today?

Patient: Hi Dr. Martinez, I've been having this persistent cough for about two weeks now. It's been keeping me up at night.

Dr. Martinez: I see. Can you describe the cough? Is it dry or are you bringing up any phlegm?

Patient: It's mostly dry, but sometimes in the morning I do cough up a little bit of clear mucus. No blood or anything like that.

Dr. Martinez: Good, that's reassuring. Any fever, shortness of breath, or chest pain?

Patient: No fever, but I do feel a bit short of breath when I'm walking upstairs. No chest pain though.

Dr. Martinez: Alright, let me listen to your chest. Take some deep breaths for me... I can hear some mild wheezing in your lower lungs. Your oxygen saturation is good at 98%. 

Patient: Is it serious?

Dr. Martinez: It sounds like you might have a mild case of bronchitis. I'd like to prescribe an inhaler to help with the wheezing and some cough suppressant for nighttime. We'll also do a chest X-ray just to be thorough.

Patient: Okay, that sounds good. How long should I expect this to last?

Dr. Martinez: With treatment, you should start feeling better in 3-5 days. If symptoms worsen or don't improve in a week, please come back to see me.`,
        confidence: 0.95,
        reviewedBy: 'Dr. Sarah Martinez',
        reviewedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        tags: ['respiratory', 'cough', 'bronchitis'],
        metadata: {
          appointmentType: 'consultation',
          recordingQuality: 'excellent',
          backgroundNoise: false,
          speakerCount: 2
        }
      },
      {
        id: 'session-002',
        patientId: 'patient-002',
        patientName: 'Michael Chen',
        appointmentId: 'appt-002',
        clinicianId: 'dr-wilson',
        clinicianName: 'Dr. James Wilson',
        startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 4 * 60 * 60 * 1000 + 20 * 60 * 1000),
        duration: 1200, // 20 minutes
        status: 'completed',
        transcript: `Dr. Wilson: Good afternoon Michael, how's your diabetes management going?

Patient: Pretty well overall, Dr. Wilson. I've been checking my blood sugar twice a day like you suggested.

Dr. Wilson: Excellent. What are your typical readings?

Patient: In the morning it's usually around 110-120, and before dinner it's around 140-150.

Dr. Wilson: Those are good numbers. How about your diet and exercise?

Patient: I've been walking 30 minutes most days, and I'm trying to watch my carbs. My wife has been really helpful with meal planning.

Dr. Wilson: That's wonderful to hear. Let me check your feet and do a quick examination... Everything looks good. Your A1C from last month was 7.1, which is much improved.

Patient: That's great news! I was worried about that.

Dr. Wilson: You're doing an excellent job managing your condition. I'd like to continue with your current metformin dose and see you again in three months.

Patient: Sounds good. Should I keep doing anything differently?

Dr. Wilson: Just keep up what you're doing. Maybe try to increase your walking to 45 minutes if you can manage it.`,
        confidence: 0.92,
        reviewedBy: 'Dr. James Wilson',
        reviewedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        tags: ['diabetes', 'follow-up', 'management'],
        metadata: {
          appointmentType: 'follow-up',
          recordingQuality: 'good',
          backgroundNoise: false,
          speakerCount: 2
        }
      }
    ]
  }

  async startRecording(patientId?: string, patientName?: string, appointmentId?: string, clinicianId: string = 'current-clinician', clinicianName: string = 'Current Clinician'): Promise<ScribeSession> {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Create new session
      const session: ScribeSession = {
        id: `session-${Date.now()}`,
        patientId,
        patientName,
        appointmentId,
        clinicianId,
        clinicianName,
        startTime: new Date(),
        status: 'recording'
      }

      // Initialize MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream)
      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data)
      }

      this.mediaRecorder.onstop = () => {
        this.processRecording(session)
      }

      this.mediaRecorder.start()
      this.activeSession = session
      this.sessions.unshift(session)

      // Add timeline event
      if (this.timelineCallback) {
        this.timelineCallback({
          type: 'scribe.started',
          summary: `Started ambient scribe recording${patientName ? ` for ${patientName}` : ''}`,
          actor: 'user',
          source: 'scribe',
          automated: false,
          category: 'scribe',
          patientName
        })
      }

      return session
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw new Error('Could not access microphone. Please check permissions.')
    }
  }

  async stopRecording(): Promise<ScribeSession | null> {
    if (!this.activeSession || !this.mediaRecorder) {
      return null
    }

    const session = this.activeSession
    session.endTime = new Date()
    session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000)
    session.status = 'processing'

    this.mediaRecorder.stop()
    this.activeSession = null

    // Add timeline event
    if (this.timelineCallback) {
      this.timelineCallback({
        type: 'scribe.stopped',
        summary: `Stopped recording and processing clinical note${session.patientName ? ` for ${session.patientName}` : ''}`,
        actor: 'user',
        source: 'scribe',
        automated: false,
        category: 'scribe',
        patientName: session.patientName
      })
    }

    return session
  }

  private async processRecording(session: ScribeSession) {
    try {
      // Create audio blob
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' })
      session.audioUrl = URL.createObjectURL(audioBlob)

      // Simulate AI transcription and note generation
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing time

      // Generate transcript (in real implementation, this would use speech-to-text API)
      session.transcript = this.generateDemoTranscript(session)
      
      // Generate structured clinical note
      session.structuredNote = await this.generateClinicalNote(session)
      session.confidence = 0.88 + Math.random() * 0.1 // Random confidence between 0.88-0.98
      
      session.status = 'completed'

      // Add timeline event
      if (this.timelineCallback) {
        this.timelineCallback({
          type: 'scribe.completed',
          summary: `Clinical note generated and ready for review${session.patientName ? ` for ${session.patientName}` : ''}`,
          actor: 'system',
          source: 'scribe',
          automated: true,
          category: 'scribe',
          patientName: session.patientName
        })
      }

    } catch (error) {
      console.error('Failed to process recording:', error)
      session.status = 'failed'
    }
  }

  private generateDemoTranscript(session: ScribeSession): string {
    const transcripts = [
      `Clinician: Good morning, how are you feeling today?

Patient: I've been experiencing some lower back pain for the past week. It started after I was moving some furniture.

Clinician: I see. Can you rate the pain on a scale of 1 to 10?

Patient: It's about a 6 or 7, especially when I bend over or sit for too long.

Clinician: Any numbness or tingling in your legs?

Patient: No, just the aching pain in my lower back.

Clinician: Let me examine your back. I can feel some muscle tension here. Your range of motion is slightly limited. This appears to be muscular strain.

Patient: Is it serious?

Clinician: No, this is a common muscle strain. I'll prescribe some anti-inflammatory medication and recommend physical therapy. You should start feeling better in a few days.`,

      `Clinician: How has your blood pressure been since our last visit?

Patient: I've been taking the medication as prescribed, and my home readings have been much better.

Clinician: That's excellent. What are your typical readings at home?

Patient: Usually around 125 over 80 in the morning, and similar in the evening.

Clinician: Those are very good numbers. Let me check it now... 128 over 82. Perfect. How are you feeling overall?

Patient: Much better, thank you. The headaches I was having are gone.

Clinician: Wonderful. I think we should continue with your current medication. Keep monitoring at home and I'll see you again in three months.`,

      `Clinician: Tell me about the symptoms you've been experiencing.

Patient: I've had this persistent cough and some congestion for about 10 days now.

Clinician: Any fever or shortness of breath?

Patient: I had a low-grade fever for the first few days, but that's gone now. No shortness of breath.

Clinician: Let me listen to your lungs... I can hear some congestion, but your airways sound clear. Your throat looks a bit red.

Patient: Is it anything serious?

Clinician: This appears to be a viral upper respiratory infection. It should resolve on its own. I'll recommend some supportive care and a cough suppressant if needed.`
    ]

    return transcripts[Math.floor(Math.random() * transcripts.length)]
  }

  private async generateClinicalNote(session: ScribeSession): Promise<ClinicalNote> {
    // In a real implementation, this would use AI to structure the transcript
    const conditions = [
      {
        chief: 'Lower back pain',
        hpi: 'Patient reports onset of lower back pain 1 week ago after moving furniture. Pain rated 6-7/10, worse with bending and prolonged sitting.',
        exam: 'Examination reveals muscle tension in lumbar region with slightly limited range of motion. No neurological deficits noted.',
        assessment: 'Acute lumbar muscle strain',
        plan: 'Prescribed NSAIDs, recommend physical therapy, activity modification. Follow up if symptoms worsen or persist beyond 2 weeks.'
      },
      {
        chief: 'Hypertension follow-up',
        hpi: 'Patient reports good compliance with antihypertensive medication. Home blood pressure readings averaging 125/80.',
        exam: 'Blood pressure 128/82. Patient appears well. No edema noted.',
        assessment: 'Hypertension, well controlled',
        plan: 'Continue current antihypertensive regimen. Continue home monitoring. Return visit in 3 months.'
      },
      {
        chief: 'Persistent cough and congestion',
        hpi: 'Patient reports 10-day history of cough and nasal congestion. Initial low-grade fever has resolved.',
        exam: 'Lung auscultation reveals upper airway congestion but clear lower airways. Mild erythema of throat.',
        assessment: 'Viral upper respiratory infection',
        plan: 'Supportive care, adequate hydration, cough suppressant as needed. Return if symptoms worsen or persist beyond 2 weeks.'
      }
    ]

    const selectedCondition = conditions[Math.floor(Math.random() * conditions.length)]

    return {
      id: `note-${session.id}`,
      sessionId: session.id,
      patientId: session.patientId,
      patientName: session.patientName,
      clinicianId: session.clinicianId,
      clinicianName: session.clinicianName,
      date: new Date(),
      appointmentType: session.metadata?.appointmentType || 'consultation',
      chiefComplaint: selectedCondition.chief,
      historyOfPresentIllness: selectedCondition.hpi,
      physicalExam: selectedCondition.exam,
      assessment: selectedCondition.assessment,
      plan: selectedCondition.plan,
      confidence: 0.85 + Math.random() * 0.13,
      requiresReview: Math.random() > 0.7, // 30% chance requires review
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  async generateNoteFromCommand(command: string, context?: any): Promise<ClinicalNote> {
    // Use AI to generate clinical note from natural language command
    try {
      const prompt = `Generate a structured clinical note from this command: "${command}"
      
      Context: ${context ? JSON.stringify(context) : 'No additional context'}
      
      Respond with a JSON object containing these fields:
      - chiefComplaint: string
      - historyOfPresentIllness: string  
      - physicalExam: string
      - assessment: string
      - plan: string
      - prescriptions: array of {medication, dosage, frequency, duration}
      - diagnosticOrders: array of {type, name, urgency}
      - followUp: string
      
      Make the note realistic and medically appropriate.`

      const result = await practiceAI.model.generateContent(prompt)
      const responseText = result.response.text().trim()
      
      let noteData
      try {
        const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        noteData = JSON.parse(cleanJson)
      } catch (parseError) {
        // Fallback to demo note
        noteData = {
          chiefComplaint: 'Generated from command',
          historyOfPresentIllness: command,
          assessment: 'Clinical assessment pending',
          plan: 'Plan to be determined'
        }
      }

      const note: ClinicalNote = {
        id: `note-cmd-${Date.now()}`,
        sessionId: `cmd-session-${Date.now()}`,
        clinicianId: 'current-clinician',
        clinicianName: 'Current Clinician',
        date: new Date(),
        chiefComplaint: noteData.chiefComplaint,
        historyOfPresentIllness: noteData.historyOfPresentIllness,
        physicalExam: noteData.physicalExam,
        assessment: noteData.assessment,
        plan: noteData.plan,
        followUp: noteData.followUp,
        prescriptions: noteData.prescriptions || [],
        diagnosticOrders: noteData.diagnosticOrders || [],
        confidence: 0.8,
        requiresReview: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      return note
    } catch (error) {
      console.error('Failed to generate note from command:', error)
      throw new Error('Could not generate clinical note')
    }
  }

  getSessions(): ScribeSession[] {
    return [...this.sessions].sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
  }

  getActiveSession(): ScribeSession | null {
    return this.activeSession
  }

  getSession(id: string): ScribeSession | undefined {
    return this.sessions.find(s => s.id === id)
  }

  getTemplates(): ScribeTemplate[] {
    return this.templates
  }

  async reviewAndApprove(sessionId: string, reviewNotes?: string): Promise<void> {
    const session = this.sessions.find(s => s.id === sessionId)
    if (session && session.structuredNote) {
      session.reviewedBy = 'Current Clinician'
      session.reviewedAt = new Date()
      session.structuredNote.reviewNotes = reviewNotes
      session.structuredNote.requiresReview = false

      // Add timeline event
      if (this.timelineCallback) {
        this.timelineCallback({
          type: 'scribe.approved',
          summary: `Clinical note approved and finalized${session.patientName ? ` for ${session.patientName}` : ''}`,
          actor: 'user',
          source: 'scribe',
          automated: false,
          category: 'scribe',
          patientName: session.patientName
        })
      }
    }
  }

  isRecording(): boolean {
    return this.activeSession?.status === 'recording' || false
  }
}

export const ambientScribe = new AmbientScribeService()
