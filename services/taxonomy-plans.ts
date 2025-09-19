import { Plan, PlanStep } from '@/types/core'
import { practiceAI } from './ai'

export interface PlanContext {
  actor: 'user' | 'autopilot' | 'system'
  source: 'cmdk' | 'drag' | 'kpi' | 'call' | 'scribe'
  role: 'reception' | 'clinician' | 'manager'
  autopilotMode: 'manual' | 'ask' | 'scheduled'
  patients?: any[]
  appointments?: any[]
  invoices?: any[]
}

// =============================================================================
// A) LOW-FRICTION DO (IN-PMS) - Simple, single-step actions
// =============================================================================

export async function createTaskPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const taskDescription = match[1]
  return {
    id: `task-${Date.now()}`,
    title: `Create Task: ${taskDescription}`,
    steps: [
      { 
        id: '1', 
        label: `Create task: "${taskDescription}"`, 
        run: async () => {
          console.log(`Creating task: ${taskDescription}`)
          await new Promise(resolve => setTimeout(resolve, 800))
        },
        undo: async () => {
          console.log(`Removed task: ${taskDescription}`)
        }
      },
      { 
        id: '2', 
        label: 'Assign to appropriate team member', 
        run: async () => {
          console.log('Assigning task to team member')
          await new Promise(resolve => setTimeout(resolve, 600))
        },
        undo: async () => {
          console.log('Removed task assignment')
        }
      }
    ],
    actor: context.actor,
    source: context.source,
    status: 'pending'
  }
}

export async function addClinicalNotePlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const [, patientName, noteContent] = match
  return {
    id: `note-${Date.now()}`,
    title: `Add clinical note for ${patientName}`,
    steps: [
      {
        id: 'step-1',
        label: `Open patient record for ${patientName}`,
        run: async () => {
          console.log(`Opening record for ${patientName}`)
          await new Promise(resolve => setTimeout(resolve, 600))
        },
        undo: async () => {
          console.log(`Closed record for ${patientName}`)
        }
      },
      {
        id: 'step-2',
        label: `Add note: ${noteContent}`,
        run: async () => {
          console.log(`Adding clinical note: ${noteContent}`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        },
        undo: async () => {
          console.log('Removed clinical note')
        }
      }
    ],
    actor: context.actor,
    source: context.source,
    status: 'pending'
  }
}

export async function rescheduleWithNotificationPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const [, patientName, newTime] = match
  return {
    id: `reschedule-${Date.now()}`,
    title: `Reschedule ${patientName} to ${newTime}`,
    steps: [
      {
        id: 'step-1',
        label: `Find available slot at ${newTime}`,
        run: async () => {
          console.log(`Searching for availability at ${newTime}`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        },
        undo: async () => {
          console.log('Released slot reservation')
        }
      },
      {
        id: 'step-2',
        label: `Move ${patientName}'s appointment`,
        run: async () => {
          console.log(`Rescheduling ${patientName}`)
          await new Promise(resolve => setTimeout(resolve, 800))
        },
        undo: async () => {
          console.log('Restored original appointment time')
        }
      },
      {
        id: 'step-3',
        label: 'Send notification to patient',
        run: async () => {
          console.log('Sending reschedule notification')
          await new Promise(resolve => setTimeout(resolve, 500))
        },
        undo: async () => {
          console.log('Cancelled notification')
        }
      }
    ],
    actor: context.actor,
    source: context.source,
    status: 'pending'
  }
}

export async function markDNAWithFeePlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const [, patientName, feeAmount] = match
  return {
    id: `dna-${Date.now()}`,
    title: `Mark ${patientName} as DNA and charge ${feeAmount}`,
    steps: [
      {
        id: 'step-1',
        label: `Mark appointment as DNA for ${patientName}`,
        run: async () => {
          console.log(`Marking DNA for ${patientName}`)
          await new Promise(resolve => setTimeout(resolve, 600))
        },
        undo: async () => {
          console.log('Removed DNA status')
        }
      },
      {
        id: 'step-2',
        label: `Generate invoice for ${feeAmount} DNA fee`,
        run: async () => {
          console.log(`Creating DNA fee invoice: ${feeAmount}`)
          await new Promise(resolve => setTimeout(resolve, 800))
        },
        undo: async () => {
          console.log('Cancelled DNA fee invoice')
        }
      },
      {
        id: 'step-3',
        label: 'Send fee notification to patient',
        run: async () => {
          console.log('Sending DNA fee notification')
          await new Promise(resolve => setTimeout(resolve, 400))
        },
        undo: async () => {
          console.log('Cancelled fee notification')
        }
      }
    ],
    actor: context.actor,
    source: context.source,
    status: 'pending'
  }
}

export async function attachReferralPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const [, patientName, service] = match
  return {
    id: `referral-${Date.now()}`,
    title: `Attach referral for ${patientName} to ${service}`,
    steps: [
      {
        id: 'step-1',
        label: `Locate referral document for ${patientName}`,
        run: async () => {
          console.log(`Finding referral document for ${patientName}`)
          await new Promise(resolve => setTimeout(resolve, 800))
        },
        undo: async () => {
          console.log('Cancelled document search')
        }
      },
      {
        id: 'step-2',
        label: `Attach to ${service} record`,
        run: async () => {
          console.log(`Attaching referral to ${service}`)
          await new Promise(resolve => setTimeout(resolve, 600))
        },
        undo: async () => {
          console.log('Removed referral attachment')
        }
      }
    ],
    actor: context.actor,
    source: context.source,
    status: 'pending'
  }
}

// =============================================================================
// B) MEDIUM/MULTI-STEP DO (orchestration inside PMS)
// =============================================================================

export async function prepareClinicPackPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const practitioner = match[1] || 'today'
  return {
    id: `clinic-pack-${Date.now()}`,
    title: `Prepare clinic pack for ${practitioner}`,
    steps: [
      {
        id: 'step-1',
        label: 'Generate appointment list',
        run: async () => {
          console.log('Creating appointment schedule')
          await new Promise(resolve => setTimeout(resolve, 1000))
        },
        undo: async () => {
          console.log('Cancelled appointment list')
        }
      },
      {
        id: 'step-2',
        label: 'Pull patient records and notes',
        run: async () => {
          console.log('Gathering patient records')
          await new Promise(resolve => setTimeout(resolve, 1500))
        },
        undo: async () => {
          console.log('Cleared patient record cache')
        }
      },
      {
        id: 'step-3',
        label: 'Generate consent forms and documents',
        run: async () => {
          console.log('Preparing consent forms')
          await new Promise(resolve => setTimeout(resolve, 800))
        },
        undo: async () => {
          console.log('Removed generated forms')
        }
      },
      {
        id: 'step-4',
        label: 'Compile clinic pack PDF',
        run: async () => {
          console.log('Compiling clinic pack')
          await new Promise(resolve => setTimeout(resolve, 1200))
        },
        undo: async () => {
          console.log('Deleted clinic pack PDF')
        }
      }
    ],
    actor: context.actor,
    source: context.source,
    status: 'pending'
  }
}

export async function batchSMSConfirmationsPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const timeframe = match[1] || 'tomorrow'
  return {
    id: `sms-batch-${Date.now()}`,
    title: `Send SMS confirmations for ${timeframe}`,
    steps: [
      {
        id: 'step-1',
        label: `Identify appointments for ${timeframe}`,
        run: async () => {
          console.log(`Finding appointments for ${timeframe}`)
          await new Promise(resolve => setTimeout(resolve, 800))
        },
        undo: async () => {
          console.log('Cancelled appointment search')
        }
      },
      {
        id: 'step-2',
        label: 'Filter patients requiring confirmation',
        run: async () => {
          console.log('Filtering confirmation list')
          await new Promise(resolve => setTimeout(resolve, 600))
        },
        undo: async () => {
          console.log('Cleared filter results')
        }
      },
      {
        id: 'step-3',
        label: 'Generate personalized SMS messages',
        run: async () => {
          console.log('Creating SMS messages')
          await new Promise(resolve => setTimeout(resolve, 1000))
        },
        undo: async () => {
          console.log('Deleted SMS drafts')
        }
      },
      {
        id: 'step-4',
        label: 'Queue for batch delivery',
        run: async () => {
          console.log('Queueing SMS batch')
          await new Promise(resolve => setTimeout(resolve, 400))
        },
        undo: async () => {
          console.log('Removed from delivery queue')
        }
      }
    ],
    actor: context.actor,
    source: context.source,
    status: 'pending'
  }
}

// =============================================================================
// C) HIGH-FRICTION/OUTSIDE-PMS DO (connected tools)
// =============================================================================

export async function verifyInsuranceEligibilityPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const [, patientName, insurer] = match
  return {
    id: `insurance-${Date.now()}`,
    title: `Verify ${patientName} insurance with ${insurer}`,
    steps: [
      {
        id: 'step-1',
        label: `Connect to ${insurer} portal`,
        run: async () => {
          console.log(`Connecting to ${insurer} system`)
          await new Promise(resolve => setTimeout(resolve, 1200))
        },
        undo: async () => {
          console.log('Disconnected from portal')
        }
      },
      {
        id: 'step-2',
        label: `Submit eligibility check for ${patientName}`,
        run: async () => {
          console.log(`Checking eligibility for ${patientName}`)
          await new Promise(resolve => setTimeout(resolve, 2000))
        },
        undo: async () => {
          console.log('Cancelled eligibility check')
        }
      },
      {
        id: 'step-3',
        label: 'Update patient record with coverage details',
        run: async () => {
          console.log('Updating patient insurance information')
          await new Promise(resolve => setTimeout(resolve, 600))
        },
        undo: async () => {
          console.log('Reverted insurance updates')
        }
      }
    ],
    actor: context.actor,
    source: context.source,
    status: 'pending'
  }
}

export async function prepareClaimChaseBatchPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  return {
    id: `claim-chase-${Date.now()}`,
    title: 'Prepare insurer claim chase batch',
    steps: [
      {
        id: 'step-1',
        label: 'Identify outstanding claims (>45 days)',
        run: async () => {
          console.log('Scanning for overdue claims')
          await new Promise(resolve => setTimeout(resolve, 1500))
        },
        undo: async () => {
          console.log('Cancelled claim scan')
        }
      },
      {
        id: 'step-2',
        label: 'Generate claim status reports',
        run: async () => {
          console.log('Creating claim reports')
          await new Promise(resolve => setTimeout(resolve, 2000))
        },
        undo: async () => {
          console.log('Deleted claim reports')
        }
      },
      {
        id: 'step-3',
        label: 'Prepare chase documentation',
        run: async () => {
          console.log('Compiling chase documentation')
          await new Promise(resolve => setTimeout(resolve, 1000))
        },
        undo: async () => {
          console.log('Removed chase documentation')
        }
      },
      {
        id: 'step-4',
        label: 'Queue for insurer submission',
        run: async () => {
          console.log('Queueing for insurer portals')
          await new Promise(resolve => setTimeout(resolve, 800))
        },
        undo: async () => {
          console.log('Removed from submission queue')
        }
      }
    ],
    actor: context.actor,
    source: context.source,
    status: 'pending'
  }
}

export async function syncToXeroPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const invoiceRef = match[1] || 'pending invoices'
  return {
    id: `xero-sync-${Date.now()}`,
    title: `Sync ${invoiceRef} to Xero`,
    steps: [
      {
        id: 'step-1',
        label: 'Authenticate with Xero API',
        run: async () => {
          console.log('Connecting to Xero')
          await new Promise(resolve => setTimeout(resolve, 1000))
        },
        undo: async () => {
          console.log('Disconnected from Xero')
        }
      },
      {
        id: 'step-2',
        label: `Prepare invoice data for ${invoiceRef}`,
        run: async () => {
          console.log(`Formatting invoice data: ${invoiceRef}`)
          await new Promise(resolve => setTimeout(resolve, 800))
        },
        undo: async () => {
          console.log('Cancelled data preparation')
        }
      },
      {
        id: 'step-3',
        label: 'Submit to Xero and verify sync',
        run: async () => {
          console.log('Syncing to Xero')
          await new Promise(resolve => setTimeout(resolve, 1500))
        },
        undo: async () => {
          console.log('Cancelled Xero sync')
        }
      }
    ],
    actor: context.actor,
    source: context.source,
    status: 'pending'
  }
}

export async function sendPaymentLinkPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const [, patientName, amount] = match
  return {
    id: `payment-link-${Date.now()}`,
    title: `Send payment link to ${patientName} for ${amount}`,
    steps: [
      {
        id: 'step-1',
        label: `Generate secure payment link for ${amount}`,
        run: async () => {
          console.log(`Creating payment link for ${amount}`)
          await new Promise(resolve => setTimeout(resolve, 800))
        },
        undo: async () => {
          console.log('Cancelled payment link')
        }
      },
      {
        id: 'step-2',
        label: `Send via SMS/email to ${patientName}`,
        run: async () => {
          console.log(`Sending payment link to ${patientName}`)
          await new Promise(resolve => setTimeout(resolve, 600))
        },
        undo: async () => {
          console.log('Cancelled payment link delivery')
        }
      },
      {
        id: 'step-3',
        label: 'Set up payment tracking',
        run: async () => {
          console.log('Enabling payment tracking')
          await new Promise(resolve => setTimeout(resolve, 400))
        },
        undo: async () => {
          console.log('Disabled payment tracking')
        }
      }
    ],
    actor: context.actor,
    source: context.source,
    status: 'pending'
  }
}

export async function requestConsentSignaturePlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const [, patientName, consentType] = match
  return {
    id: `consent-${Date.now()}`,
    title: `Request e-signature from ${patientName} for ${consentType}`,
    steps: [
      {
        id: 'step-1',
        label: `Prepare ${consentType} consent form`,
        run: async () => {
          console.log(`Generating ${consentType} consent form`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        },
        undo: async () => {
          console.log('Cancelled consent form generation')
        }
      },
      {
        id: 'step-2',
        label: `Send to ${patientName} for e-signature`,
        run: async () => {
          console.log(`Sending e-signature request to ${patientName}`)
          await new Promise(resolve => setTimeout(resolve, 600))
        },
        undo: async () => {
          console.log('Cancelled e-signature request')
        }
      },
      {
        id: 'step-3',
        label: 'Set up signature tracking and reminders',
        run: async () => {
          console.log('Configuring signature tracking')
          await new Promise(resolve => setTimeout(resolve, 400))
        },
        undo: async () => {
          console.log('Disabled signature tracking')
        }
      }
    ],
    actor: context.actor,
    source: context.source,
    status: 'pending'
  }
}

export async function sendEPrescriptionPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const [, patientName, medication, pharmacy] = match
  return {
    id: `eprescription-${Date.now()}`,
    title: `Send e-prescription for ${patientName}: ${medication} to ${pharmacy}`,
    steps: [
      {
        id: 'step-1',
        label: `Verify prescription details for ${medication}`,
        run: async () => {
          console.log(`Verifying prescription: ${medication}`)
          await new Promise(resolve => setTimeout(resolve, 800))
        },
        undo: async () => {
          console.log('Cancelled prescription verification')
        }
      },
      {
        id: 'step-2',
        label: `Connect to ${pharmacy} system`,
        run: async () => {
          console.log(`Connecting to ${pharmacy}`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        },
        undo: async () => {
          console.log(`Disconnected from ${pharmacy}`)
        }
      },
      {
        id: 'step-3',
        label: `Transmit prescription for ${patientName}`,
        run: async () => {
          console.log(`Sending e-prescription to ${pharmacy}`)
          await new Promise(resolve => setTimeout(resolve, 1200))
        },
        undo: async () => {
          console.log('Cancelled prescription transmission')
        }
      },
      {
        id: 'step-4',
        label: 'Confirm receipt and update patient record',
        run: async () => {
          console.log('Updating prescription status')
          await new Promise(resolve => setTimeout(resolve, 500))
        },
        undo: async () => {
          console.log('Reverted prescription status')
        }
      }
    ],
    actor: context.actor,
    source: context.source,
    status: 'pending'
  }
}