import { Plan, PlanStep, ClarificationQuestion } from '@/types/core'
import { sendSurveysPlan, optimizeSchedulePlan, reviewPricingPlan, setupRemindersPlan, setupPaymentPlansPlan, scheduleFollowUpsPlan, optimizeHighRiskSlotsPlan } from './kpi-plans'
import { ambientScribe } from './ambient-scribe'
import { practiceAI } from './ai'
import { 
  enrollToPathwayPlan, 
  closeCareGapPlan, 
  abnormalReadingTriagePlan, 
  medicationAdherenceRiskPlan, 
  dischargeCoordinationPlan,
  bulkHbA1cOrderPlan,
  bulkBPReminderPlan
} from './care-plans'
import { aiIntake } from './ai-intake'

interface PlanContext {
  actor: 'user' | 'autopilot' | 'system'
  source: 'cmdk' | 'drag' | 'kpi' | 'call' | 'scribe'
  role: 'reception' | 'clinician' | 'manager'
  autopilotMode: 'manual' | 'ask' | 'scheduled'
  patients?: any[]
  appointments?: any[]
  invoices?: any[]
}

// Scribe plan factories
async function startScribeRecording(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const patientName = match[1] || undefined
  
  return {
    id: `scribe-start-${Date.now()}`,
    title: `Start ambient scribe recording${patientName ? ` for ${patientName}` : ''}`,
    steps: [
      {
        id: 'step-1',
        label: 'Initialize ambient scribe system',
        run: async () => {
          console.log('Initializing ambient scribe...')
          await new Promise(resolve => setTimeout(resolve, 500))
        },
        undo: async () => {
          console.log('Scribe initialization cancelled')
        }
      },
      {
        id: 'step-2',
        label: 'Request microphone permissions',
        run: async () => {
          console.log('Requesting microphone access...')
          await new Promise(resolve => setTimeout(resolve, 800))
        },
        undo: async () => {
          console.log('Microphone access cancelled')
        }
      },
      {
        id: 'step-3',
        label: `Begin recording consultation${patientName ? ` with ${patientName}` : ''}`,
        run: async () => {
          console.log('Starting ambient recording...')
          await ambientScribe.startRecording(undefined, patientName, undefined, 'current-clinician', 'Current Clinician')
        },
        undo: async () => {
          console.log('Recording stopped')
          await ambientScribe.stopRecording()
        }
      }
    ],
    actor: context.actor,
    source: context.source,
    status: 'pending'
  }
}

async function stopScribeRecording(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  return {
    id: `scribe-stop-${Date.now()}`,
    title: 'Stop ambient scribe and generate clinical note',
    steps: [
      {
        id: 'step-1',
        label: 'Stop ambient recording',
        run: async () => {
          console.log('Stopping ambient recording...')
          await ambientScribe.stopRecording()
        },
        undo: async () => {
          console.log('Recording restart cancelled')
        }
      },
      {
        id: 'step-2',
        label: 'Process audio transcript',
        run: async () => {
          console.log('Processing audio and generating transcript...')
          await new Promise(resolve => setTimeout(resolve, 2000))
        },
        undo: async () => {
          console.log('Processing cancelled')
        }
      },
      {
        id: 'step-3',
        label: 'Generate structured clinical note',
        run: async () => {
          console.log('Creating structured clinical documentation...')
          await new Promise(resolve => setTimeout(resolve, 1500))
        },
        undo: async () => {
          console.log('Note generation cancelled')
        }
      }
    ],
    actor: context.actor,
    source: context.source,
    status: 'pending'
  }
}

async function generateNoteFromCommand(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const noteContent = match[1]
  
  return {
    id: `scribe-note-${Date.now()}`,
    title: `Generate clinical note: ${noteContent}`,
    steps: [
      {
        id: 'step-1',
        label: 'Analyze command context',
        run: async () => {
          console.log('Analyzing clinical context...')
          await new Promise(resolve => setTimeout(resolve, 800))
        },
        undo: async () => {
          console.log('Analysis cancelled')
        }
      },
      {
        id: 'step-2',
        label: 'Generate structured note',
        run: async () => {
          console.log('Creating clinical note from command...')
          await ambientScribe.generateNoteFromCommand(noteContent, context)
        },
        undo: async () => {
          console.log('Note generation cancelled')
        }
      },
      {
        id: 'step-3',
        label: 'Format for review and approval',
        run: async () => {
          console.log('Formatting note for clinician review...')
          await new Promise(resolve => setTimeout(resolve, 600))
        },
        undo: async () => {
          console.log('Formatting cancelled')
        }
      }
    ],
    actor: context.actor,
    source: context.source,
    status: 'pending'
  }
}

// AI Intake plan factory
async function requestAIIntakePlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const patientName = match[1] || 'patient'
  const appointmentContext = match[2] || 'upcoming appointment'
  
  return {
    id: `ai-intake-${Date.now()}`,
    title: `Request AI pre-appointment intake for ${patientName}`,
    actor: context.actor,
    source: context.source,
    steps: [
      {
        id: 'step-1',
        label: `Prepare personalized intake link for ${patientName}`,
        run: async () => {
          console.log(`Creating secure intake session for ${patientName}`)
          // In a real implementation, this would create the session
          await aiIntake.requestIntake(
            'demo-patient-id',
            patientName,
            'demo-appointment-id',
            new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            'Dr. Current User'
          )
          await new Promise(resolve => setTimeout(resolve, 1000))
        },
        undo: async () => {
          console.log('Cancelled intake session creation')
        }
      },
      {
        id: 'step-2',
        label: `Send caring message to ${patientName} with intake link`,
        run: async () => {
          console.log('Sending personalized SMS with intake link')
          await new Promise(resolve => setTimeout(resolve, 800))
        },
        undo: async () => {
          console.log('Cancelled intake invitation')
        }
      },
      {
        id: 'step-3',
        label: 'Set up intake completion monitoring',
        run: async () => {
          console.log('Enabling intake progress tracking')
          await new Promise(resolve => setTimeout(resolve, 600))
        },
        undo: async () => {
          console.log('Disabled intake monitoring')
        }
      },
      {
        id: 'step-4',
        label: 'Schedule intake summary review before appointment',
        run: async () => {
          console.log('Creating review reminder for doctor')
          await new Promise(resolve => setTimeout(resolve, 500))
        },
        undo: async () => {
          console.log('Cancelled review reminder')
        }
      }
    ],
    status: 'pending'
  }
}

// Taxonomy plan factories (inline definitions)
async function createTaskPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const taskDescription = match[1]
  return {
    id: `task-${Date.now()}`,
    title: `Create Task: ${taskDescription}`,
    steps: [
      { 
        id: '1', 
        label: `Create task: "${taskDescription}"`, 
        run: async () => { /* Implementation */ },
        undo: async () => { /* Implementation */ }
      },
      { 
        id: '2', 
        label: 'Assign to appropriate team member', 
        run: async () => { /* Implementation */ },
        undo: async () => { /* Implementation */ }
      }
    ],
    actor: context.actor,
    source: context.source,
    status: 'pending'
  }
}

// Phrase patterns and their corresponding plan factories
const PHRASE_PATTERNS = [
  {
    pattern: /finalise note for (.+?), draft referral to (.+?), send prescription, and task reception for (.+?) review/i,
    factory: clinicianWrapupPlan
  },
  // More flexible clinical patterns
  {
    pattern: /(.+?),?\s*send\s+(?:her|his|their)?\s*prescription\s+and\s+task\s+reception\s+for\s+(?:a\s+)?(.+?)\s+review/i,
    factory: clinicianWrapupPlan
  },
  {
    pattern: /clinical wrap-?up for (.+)/i,
    factory: clinicianWrapupPlan
  },
  
  // CARE AUTOPILOT COMMANDS (GPT-5's 5 scripted plans)
  {
    pattern: /enroll (?:patient )?(.+?) (?:to |in |for )(.+?) pathway/i,
    factory: enrollToPathwayPlan
  },
  {
    pattern: /enroll (.+?) (?:to |in )(?:diabetes|hypertension|copd)/i,
    factory: enrollToPathwayPlan
  },
  {
    pattern: /close care gap[:\s]+overdue (.+?)(?: for (.+?))?/i,
    factory: closeCareGapPlan
  },
  {
    pattern: /(?:triage|handle) abnormal (.+?) (?:reading )?(?:for )?(.+)/i,
    factory: abnormalReadingTriagePlan
  },
  {
    pattern: /(?:address )?medication adherence (?:risk )?(?:for )?(.+?)(?:\s+(.+?))?/i,
    factory: medicationAdherenceRiskPlan
  },
  {
    pattern: /(?:coordinate )?discharge (?:follow-?up )?(?:for )?(.+?)(?:\s+(.+?))?/i,
    factory: dischargeCoordinationPlan
  },
  
  // BULK CARE ACTIONS
  {
    pattern: /order hba1c (?:for |tests for )?(\d+)?\s*(?:diabetic )?patients?/i,
    factory: bulkHbA1cOrderPlan
  },
  {
    pattern: /order hba1c tests? for (\d+) (?:diabetic )?patients?/i,
    factory: bulkHbA1cOrderPlan
  },
  {
    pattern: /send bp (?:monitoring )?reminders? (?:to )?(\d+)?\s*patients?/i,
    factory: bulkBPReminderPlan
  },
  {
    pattern: /(?:nudge|remind) (\d+)?\s*(?:hypertension )?patients? (?:about )?bp monitoring/i,
    factory: bulkBPReminderPlan
  },
  
  // AI INTAKE COMMANDS
  {
    pattern: /request (?:ai )?(?:pre-?appointment )?intake (?:for )?(.+?)(?:\s+(?:for|before)\s+(.+?))?/i,
    factory: requestAIIntakePlan
  },
  {
    pattern: /send (?:ai )?intake (?:to |for )?(.+?)(?:\s+(?:for|before)\s+(.+?))?/i,
    factory: requestAIIntakePlan
  },
  {
    pattern: /(?:ai )?intake (?:for )?(.+?)(?:\s+(?:appointment|visit))?/i,
    factory: requestAIIntakePlan
  },
  {
    pattern: /prepare (.+?) (?:for )?(?:their )?(?:appointment|visit)/i,
    factory: requestAIIntakePlan
  },

  // AMBIENT SCRIBE COMMANDS
  {
    pattern: /start (?:ambient )?(?:scribe|recording)(?: for (.+?))?/i,
    factory: startScribeRecording
  },
  {
    pattern: /begin (?:ambient )?(?:scribe|recording)(?: for (.+?))?/i,
    factory: startScribeRecording
  },
  {
    pattern: /stop (?:ambient )?(?:scribe|recording)/i,
    factory: stopScribeRecording
  },
  {
    pattern: /end (?:ambient )?(?:scribe|recording)/i,
    factory: stopScribeRecording
  },
  {
    pattern: /generate (?:clinical )?note (?:for |from )?(.+)/i,
    factory: generateNoteFromCommand
  },
  {
    pattern: /create (?:clinical )?note (?:for |from )?(.+)/i,
    factory: generateNoteFromCommand
  },
  {
    pattern: /document (?:consultation (?:for |with )?)?(.+)/i,
    factory: generateNoteFromCommand
  },
  
  // A) LOW-FRICTION DO (IN-PMS) - Simple tasks
  {
    pattern: /create task[:\s]+(.+)/i,
    factory: createTaskPlan
  },
  {
    pattern: /add (?:clinical )?note (?:for )?(.+?) (?:using |from )?(.+?)(?: template)?/i,
    factory: createTaskPlan
  },
  {
    pattern: /reschedule (.+?) (?:to |for )(.+?) (?:and notify|with notification)/i,
    factory: createTaskPlan
  },
  {
    pattern: /mark (.+?) (?:as )?DNA (?:and charge|with fee) (?:of )?(.+)/i,
    factory: createTaskPlan
  },
  {
    pattern: /attach referral (?:PDF )?(?:for )?(.+?) (?:to |for )(.+)/i,
    factory: createTaskPlan
  },
  
  // B) MEDIUM/MULTI-STEP DO (orchestration inside PMS)
  {
    pattern: /prepare (?:daily )?clinic pack (?:for )?(.+)/i,
    factory: createTaskPlan
  },
  {
    pattern: /(?:batch )?SMS confirmations? for (.+)/i,
    factory: createTaskPlan
  },
  {
    pattern: /send (?:batch )?(?:SMS )?confirmations? for (.+)/i,
    factory: createTaskPlan
  },
  
  // C) HIGH-FRICTION/OUTSIDE-PMS DO (connected tools)
  {
    pattern: /verify insurance (?:eligibility )?(?:for )?(.+?) (?:with |through )?(.+)/i,
    factory: createTaskPlan
  },
  {
    pattern: /prepare (?:insurer )?claim chase batch/i,
    factory: createTaskPlan
  },
  {
    pattern: /sync (?:invoice )?(.+?) to Xero/i,
    factory: createTaskPlan
  },
  {
    pattern: /send payment link (?:to )?(.+?) (?:for )?(.+)/i,
    factory: createTaskPlan
  },
  {
    pattern: /request (?:consent )?(?:e-?signature )?(?:from )?(.+?) (?:for )?(.+)/i,
    factory: createTaskPlan
  },
  {
    pattern: /(?:e-?prescription|send prescription) (?:for )?(.+?) (?:medication |drug )?(.+?) (?:to )?(.+)/i,
    factory: createTaskPlan
  },
  {
    pattern: /prepare chase batch/i,
    factory: chaseSchedule
  },
  {
    pattern: /schedule (.+?) for (.+?) at (.+)/i,
    factory: scheduleAppointment
  },
  {
    pattern: /verify coverage for (.+)/i,
    factory: verifyCoverage
  },
  {
    pattern: /reschedule (.+?) to (.+)/i,
    factory: rescheduleAppointment
  },
  {
    pattern: /send more surveys/i,
    factory: sendSurveysPlan
  },
  {
    pattern: /optimize schedule/i,
    factory: optimizeSchedulePlan
  },
  {
    pattern: /review pricing/i,
    factory: reviewPricingPlan
  },
  {
    pattern: /setup reminders/i,
    factory: setupRemindersPlan
  },
  {
    pattern: /setup payment plans/i,
    factory: setupPaymentPlansPlan
  },
  {
    pattern: /schedule follow-ups/i,
    factory: scheduleFollowUpsPlan
  },
  {
    pattern: /optimize high-risk slots/i,
    factory: optimizeHighRiskSlotsPlan
  }
]

async function clinicianWrapupPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const patientName = match[1] || match[0].split(' ').pop()
  const referralSpecialty = match[2] || 'specialist'
  const reviewType = match[3] || match[2] || 'follow-up'

  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: `Finalize clinical note for ${patientName}`,
      run: async () => {
        console.log(`Finalizing note for ${patientName}`)
        await new Promise(resolve => setTimeout(resolve, 1200))
      },
      undo: async () => {
        console.log(`Reverted note changes for ${patientName}`)
      }
    },
    {
      id: 'step-2', 
      label: `Draft referral to ${referralSpecialty}`,
      run: async () => {
        console.log(`Creating referral to ${referralSpecialty}`)
        await new Promise(resolve => setTimeout(resolve, 900))
      },
      undo: async () => {
        console.log(`Removed referral draft`)
      }
    },
    {
      id: 'step-3',
      label: `Send prescription to pharmacy`,
      run: async () => {
        console.log('Sending e-prescription')
        await new Promise(resolve => setTimeout(resolve, 800))
      },
      undo: async () => {
        console.log('Cancelled prescription')
      }
    },
    {
      id: 'step-4',
      label: `Task reception for ${reviewType} review`,
      run: async () => {
        console.log(`Creating task for ${reviewType} review`)
        await new Promise(resolve => setTimeout(resolve, 600))
      },
      undo: async () => {
        console.log('Removed reception task')
      }
    }
  ]

  return {
    id: `plan-${Date.now()}`,
    title: `Clinical wrap-up for ${patientName}`,
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}

async function chaseSchedule(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: 'Identify overdue invoices (>30 days)',
      run: async () => {
        console.log('Scanning for overdue invoices...')
        await new Promise(resolve => setTimeout(resolve, 800))
      },
      undo: async () => {
        console.log('Cancelled invoice scan')
      }
    },
    {
      id: 'step-2',
      label: 'Generate personalized chase messages',
      run: async () => {
        console.log('Creating chase messages...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      },
      undo: async () => {
        console.log('Deleted chase messages')
      }
    },
    {
      id: 'step-3',
      label: 'Queue for batch SMS delivery',
      run: async () => {
        console.log('Queueing SMS batch...')
        await new Promise(resolve => setTimeout(resolve, 600))
      },
      undo: async () => {
        console.log('Removed from SMS queue')
      }
    }
  ]

  return {
    id: `plan-${Date.now()}`,
    title: 'Prepare payment chase batch',
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}

async function scheduleAppointment(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const [, patientName, service, timeSlot] = match
  
  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: `Find available slot for ${service} at ${timeSlot}`,
      run: async () => {
        console.log(`Searching for ${service} availability at ${timeSlot}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      },
      undo: async () => {
        console.log('Released slot reservation')
      }
    },
    {
      id: 'step-2',
      label: `Book appointment for ${patientName}`,
      run: async () => {
        console.log(`Creating appointment for ${patientName}`)
        await new Promise(resolve => setTimeout(resolve, 800))
      },
      undo: async () => {
        console.log(`Cancelled appointment for ${patientName}`)
      }
    },
    {
      id: 'step-3',
      label: 'Send confirmation SMS',
      run: async () => {
        console.log('Sending appointment confirmation')
        await new Promise(resolve => setTimeout(resolve, 500))
      },
      undo: async () => {
        console.log('Cancelled confirmation message')
      }
    }
  ]

  return {
    id: `plan-${Date.now()}`,
    title: `Schedule ${patientName} for ${service}`,
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}

async function verifyCoverage(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const description = match[1]
  
  // Simulate some realistic verification steps
  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: 'Check Mr Johnson eligibility (Bupa)',
      run: async () => {
        console.log('Verifying Bupa eligibility')
        await new Promise(resolve => setTimeout(resolve, 1200))
      },
      undo: async () => {
        console.log('Cleared Bupa verification')
      }
    },
    {
      id: 'step-2',
      label: 'Verify Ms Davis self-pay status',
      run: async () => {
        console.log('Checking self-pay verification')
        await new Promise(resolve => setTimeout(resolve, 800))
      },
      undo: async () => {
        console.log('Cleared self-pay verification')
      }
    },
    {
      id: 'step-3',
      label: 'Check Mrs Smith coverage (AXA)',
      run: async () => {
        console.log('Verifying AXA coverage')
        // Simulate failure for this step
        await new Promise(resolve => setTimeout(resolve, 1000))
        throw new Error('Portal unresponsive')
      },
      undo: async () => {
        console.log('Cleared AXA verification')
      }
    }
  ]

  return {
    id: `plan-${Date.now()}`,
    title: `Verify coverage for ${description}`,
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}

async function rescheduleAppointment(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const [, patientName, newTime] = match
  
  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: `Cancel current appointment for ${patientName}`,
      run: async () => {
        console.log(`Cancelling current appointment for ${patientName}`)
        await new Promise(resolve => setTimeout(resolve, 600))
      },
      undo: async () => {
        console.log(`Restored original appointment for ${patientName}`)
      }
    },
    {
      id: 'step-2',
      label: `Book new slot at ${newTime}`,
      run: async () => {
        console.log(`Booking new appointment for ${newTime}`)
        await new Promise(resolve => setTimeout(resolve, 800))
      },
      undo: async () => {
        console.log(`Cancelled new appointment booking`)
      }
    },
    {
      id: 'step-3',
      label: 'Send reschedule notification',
      run: async () => {
        console.log('Sending reschedule notification')
        await new Promise(resolve => setTimeout(resolve, 400))
      },
      undo: async () => {
        console.log('Cancelled notification')
      }
    }
  ]

  return {
    id: `plan-${Date.now()}`,
    title: `Reschedule ${patientName} to ${newTime}`,
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}

// Fallback plan generator for unknown phrases
async function generateFallbackPlan(phrase: string, context: PlanContext): Promise<Plan> {
  try {
    const aiContext = {
      patients: context.patients || [],
      appointments: context.appointments || [],
      invoices: context.invoices || [],
      role: context.role,
      currentTime: new Date().toISOString()
    }
    
    return await practiceAI.generateGenericPlan(phrase, aiContext, context)
  } catch (error) {
    console.error('Fallback plan generation failed:', error)
    
    // Ultimate fallback: create a simple plan
    return {
      id: `plan-${Date.now()}`,
      title: `Execute: ${phrase}`,
      actor: context.actor,
      source: context.source,
      steps: [
        {
          id: 'step-1',
          label: `Processing command: ${phrase}`,
          run: async () => {
            console.log(`Executing: ${phrase}`)
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
          },
          undo: async () => {
            console.log(`Undoing: ${phrase}`)
          }
        }
      ],
      status: 'pending'
    }
  }
}

export async function createPlan(phrase: string, context: PlanContext): Promise<Plan | null> {
  try {
    // Prepare AI context with actual data if available
    const aiContext = {
      patients: context.patients || [],
      appointments: context.appointments || [],
      invoices: context.invoices || [],
      role: context.role,
      currentTime: new Date().toISOString()
    }

    // First try enhanced AI plan creation (with clarification detection)
    const enhancedPlan = await practiceAI.createEnhancedPlan(phrase, aiContext, context)
    if (enhancedPlan) {
      return enhancedPlan
    }
  } catch (error) {
    console.error('Enhanced plan creation failed, trying patterns:', error)
  }

  // Fallback to pattern matching for specific known commands
  for (const { pattern, factory } of PHRASE_PATTERNS) {
    const match = phrase.match(pattern)
    if (match) {
      return await factory(match, context)
    }
  }

  // Final fallback: Use Gemini generic plan for ANY command
  return await generateFallbackPlan(phrase, context)
}