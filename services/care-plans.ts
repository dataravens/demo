import { Plan, PlanStep } from '@/types/core'

interface PlanContext {
  actor: 'user' | 'autopilot' | 'system'
  source: 'cmdk' | 'drag' | 'kpi' | 'call' | 'scribe'
  role: 'reception' | 'clinician' | 'manager'
  autopilotMode: 'manual' | 'ask' | 'scheduled'
  patients?: any[]
  appointments?: any[]
  invoices?: any[]
}

// GPT-5's 5 Scripted Care Plans

export async function enrollToPathwayPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const [, patientName, condition] = match
  
  return {
    id: `enroll-pathway-${Date.now()}`,
    title: `Welcome ${patientName} to personalized ${condition} support`,
    actor: context.actor,
    source: context.source,
    steps: [
      {
        id: 'step-1',
        label: `Send warm welcome message to ${patientName}`,
        run: async () => {
          console.log(`Sending personalized welcome message to ${patientName}`)
          await new Promise(resolve => setTimeout(resolve, 800))
        },
        undo: async () => {
          console.log('Cancelled welcome message')
        }
      },
      {
        id: 'step-2',
        label: `Set up personalized check-in schedule based on ${patientName}'s preferences`,
        run: async () => {
          console.log('Creating personalized monitoring schedule')
          await new Promise(resolve => setTimeout(resolve, 1000))
        },
        undo: async () => {
          console.log('Removed personalized schedule')
        }
      },
      {
        id: 'step-3',
        label: `Share helpful resources tailored to ${patientName}'s lifestyle`,
        run: async () => {
          console.log('Sending personalized educational resources')
          await new Promise(resolve => setTimeout(resolve, 600))
        },
        undo: async () => {
          console.log('Cancelled resource sharing')
        }
      },
      {
        id: 'step-4',
        label: `Schedule comfortable follow-up chat with doctor`,
        run: async () => {
          console.log('Booking relaxed follow-up appointment')
          await new Promise(resolve => setTimeout(resolve, 700))
        },
        undo: async () => {
          console.log('Cancelled follow-up appointment')
        }
      }
    ],
    status: 'pending'
  }
}

export async function closeCareGapPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const [, testType, patientName] = match
  
  return {
    id: `close-gap-${Date.now()}`,
    title: `Gentle reminder for ${patientName || 'patient'}'s ${testType}`,
    actor: context.actor,
    source: context.source,
    steps: [
      {
        id: 'step-1',
        label: `Send caring reminder about ${testType} to ${patientName}`,
        run: async () => {
          console.log(`Sending personalized ${testType} reminder to ${patientName}`)
          await new Promise(resolve => setTimeout(resolve, 900))
        },
        undo: async () => {
          console.log('Cancelled reminder message')
        }
      },
      {
        id: 'step-2',
        label: 'Offer convenient appointment booking options',
        run: async () => {
          console.log('Providing easy booking choices')
          await new Promise(resolve => setTimeout(resolve, 600))
        },
        undo: async () => {
          console.log('Cancelled booking options')
        }
      },
      {
        id: 'step-3',
        label: 'Set up friendly follow-up check-in',
        run: async () => {
          console.log('Scheduling supportive follow-up')
          await new Promise(resolve => setTimeout(resolve, 500))
        },
        undo: async () => {
          console.log('Cancelled follow-up check-in')
        }
      }
    ],
    status: 'pending'
  }
}

export async function abnormalReadingTriagePlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const [, readingType, patientName] = match
  
  return {
    id: `abnormal-triage-${Date.now()}`,
    title: `Supportive outreach for ${patientName}'s ${readingType} readings`,
    actor: context.actor,
    source: context.source,
    steps: [
      {
        id: 'step-1',
        label: `Review ${patientName}'s recent ${readingType} patterns`,
        run: async () => {
          console.log(`Reviewing ${readingType} trends for context`)
          await new Promise(resolve => setTimeout(resolve, 1200))
        },
        undo: async () => {
          console.log('Cancelled pattern review')
        }
      },
      {
        id: 'step-2',
        label: `Send caring check-in message to ${patientName}`,
        run: async () => {
          console.log('Sending supportive message about readings')
          await new Promise(resolve => setTimeout(resolve, 800))
        },
        undo: async () => {
          console.log('Cancelled check-in message')
        }
      },
      {
        id: 'step-3',
        label: 'Offer easy ways for patient to connect with doctor',
        run: async () => {
          console.log('Providing convenient consultation options')
          await new Promise(resolve => setTimeout(resolve, 400))
        },
        undo: async () => {
          console.log('Cancelled consultation options')
        }
      },
      {
        id: 'step-4',
        label: 'Flag for doctor\'s personal attention during next interaction',
        run: async () => {
          console.log('Adding note for doctor\'s awareness')
          await new Promise(resolve => setTimeout(resolve, 600))
        },
        undo: async () => {
          console.log('Removed doctor notification')
        }
      }
    ],
    status: 'pending'
  }
}

export async function medicationAdherenceRiskPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const [, patientName, medication] = match
  
  return {
    id: `med-adherence-${Date.now()}`,
    title: `Supportive medication check-in for ${patientName}`,
    actor: context.actor,
    source: context.source,
    steps: [
      {
        id: 'step-1',
        label: `Send understanding message about medication routine to ${patientName}`,
        run: async () => {
          console.log('Sending empathetic medication support message')
          await new Promise(resolve => setTimeout(resolve, 1000))
        },
        undo: async () => {
          console.log('Cancelled support message')
        }
      },
      {
        id: 'step-2',
        label: 'Offer practical help with medication management',
        run: async () => {
          console.log('Providing medication management resources')
          await new Promise(resolve => setTimeout(resolve, 700))
        },
        undo: async () => {
          console.log('Cancelled management resources')
        }
      },
      {
        id: 'step-3',
        label: 'Schedule comfortable conversation with care team',
        run: async () => {
          console.log('Arranging supportive care team chat')
          await new Promise(resolve => setTimeout(resolve, 500))
        },
        undo: async () => {
          console.log('Cancelled care team conversation')
        }
      }
    ],
    status: 'pending'
  }
}

export async function dischargeCoordinationPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const [, patientName, dischargeDate] = match
  
  return {
    id: `discharge-coord-${Date.now()}`,
    title: `Caring discharge support for ${patientName}`,
    actor: context.actor,
    source: context.source,
    steps: [
      {
        id: 'step-1',
        label: `Send warm "welcome home" message to ${patientName}`,
        run: async () => {
          console.log('Sending caring welcome home message')
          await new Promise(resolve => setTimeout(resolve, 800))
        },
        undo: async () => {
          console.log('Cancelled welcome message')
        }
      },
      {
        id: 'step-2',
        label: 'Share easy-to-understand home care instructions',
        run: async () => {
          console.log('Providing clear home care guidance')
          await new Promise(resolve => setTimeout(resolve, 600))
        },
        undo: async () => {
          console.log('Cancelled care instructions')
        }
      },
      {
        id: 'step-3',
        label: 'Schedule comfortable follow-up appointment',
        run: async () => {
          console.log('Booking relaxed follow-up visit')
          await new Promise(resolve => setTimeout(resolve, 700))
        },
        undo: async () => {
          console.log('Cancelled follow-up appointment')
        }
      },
      {
        id: 'step-4',
        label: 'Offer 24/7 support contact for any concerns',
        run: async () => {
          console.log('Providing reassuring support contact')
          await new Promise(resolve => setTimeout(resolve, 400))
        },
        undo: async () => {
          console.log('Cancelled support contact offer')
        }
      }
    ],
    status: 'pending'
  }
}

// Bulk action plans for cohort management
export async function bulkHbA1cOrderPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const patientCount = match[1] || '12'
  
  return {
    id: `bulk-hba1c-${Date.now()}`,
    title: `Order HbA1c tests for ${patientCount} diabetic patients`,
    actor: context.actor,
    source: context.source,
    steps: [
      {
        id: 'step-1',
        label: `Identify ${patientCount} patients with overdue HbA1c`,
        run: async () => {
          console.log(`Scanning diabetes cohort for overdue tests`)
          await new Promise(resolve => setTimeout(resolve, 1200))
        },
        undo: async () => {
          console.log('Cancelled patient identification')
        }
      },
      {
        id: 'step-2',
        label: 'Generate batch lab orders',
        run: async () => {
          console.log('Creating lab order batch')
          await new Promise(resolve => setTimeout(resolve, 1500))
        },
        undo: async () => {
          console.log('Cancelled lab orders')
        }
      },
      {
        id: 'step-3',
        label: 'Send appointment booking invitations',
        run: async () => {
          console.log('Sending booking invitations')
          await new Promise(resolve => setTimeout(resolve, 800))
        },
        undo: async () => {
          console.log('Cancelled booking invitations')
        }
      },
      {
        id: 'step-4',
        label: 'Update care gap tracking',
        run: async () => {
          console.log('Updating patient care gaps')
          await new Promise(resolve => setTimeout(resolve, 600))
        },
        undo: async () => {
          console.log('Reverted care gap updates')
        }
      }
    ],
    status: 'pending'
  }
}

export async function bulkBPReminderPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const patientCount = match[1] || '7'
  
  return {
    id: `bulk-bp-reminder-${Date.now()}`,
    title: `Send BP monitoring reminders to ${patientCount} patients`,
    actor: context.actor,
    source: context.source,
    steps: [
      {
        id: 'step-1',
        label: `Identify ${patientCount} patients without recent BP readings`,
        run: async () => {
          console.log('Scanning hypertension cohort')
          await new Promise(resolve => setTimeout(resolve, 900))
        },
        undo: async () => {
          console.log('Cancelled patient scan')
        }
      },
      {
        id: 'step-2',
        label: 'Generate personalized reminder messages',
        run: async () => {
          console.log('Creating reminder messages')
          await new Promise(resolve => setTimeout(resolve, 1000))
        },
        undo: async () => {
          console.log('Deleted reminder messages')
        }
      },
      {
        id: 'step-3',
        label: 'Queue SMS delivery batch',
        run: async () => {
          console.log('Queueing SMS batch')
          await new Promise(resolve => setTimeout(resolve, 500))
        },
        undo: async () => {
          console.log('Removed from SMS queue')
        }
      },
      {
        id: 'step-4',
        label: 'Set up monitoring compliance tracking',
        run: async () => {
          console.log('Enabling compliance tracking')
          await new Promise(resolve => setTimeout(resolve, 400))
        },
        undo: async () => {
          console.log('Disabled compliance tracking')
        }
      }
    ],
    status: 'pending'
  }
}
