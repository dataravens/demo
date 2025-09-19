import { Plan, PlanStep } from '@/types/core'
import { CallRecord } from '@/store/slices/calls'

interface CallPlanContext {
  actor: 'user' | 'autopilot' | 'system'
  source: 'call'
  role: 'reception' | 'clinician' | 'manager'
  autopilotMode: 'manual' | 'ask' | 'scheduled'
  call: CallRecord
}

// Primary follow-up: Reschedule + notify
export async function rescheduleFromCallPlan(call: CallRecord, context: CallPlanContext): Promise<Plan> {
  const patientName = call.patientName || 'caller'
  
  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: `Find ${patientName}'s current appointment`,
      run: async () => {
        console.log(`🔍 Located appointment for ${patientName}`)
        await new Promise(resolve => setTimeout(resolve, 600))
      },
      undo: async () => {
        console.log('Cleared appointment lookup')
      }
    },
    {
      id: 'step-2', 
      label: 'Check availability for preferred time',
      run: async () => {
        console.log('📅 Found available slot next Thursday 2:30pm')
        await new Promise(resolve => setTimeout(resolve, 800))
      },
      undo: async () => {
        console.log('Released held time slot')
      }
    },
    {
      id: 'step-3',
      label: `Move appointment to new time`,
      run: async () => {
        console.log(`✅ Appointment rescheduled for ${patientName}`)
        await new Promise(resolve => setTimeout(resolve, 500))
      },
      undo: async () => {
        console.log('Reverted to original appointment time')
      }
    },
    {
      id: 'step-4',
      label: 'Send confirmation SMS',
      run: async () => {
        console.log('📱 SMS confirmation sent to patient')
        await new Promise(resolve => setTimeout(resolve, 400))
      },
      undo: async () => {
        console.log('SMS notification cancelled')
      }
    }
  ]

  return {
    id: `plan-${Date.now()}`,
    title: `Reschedule ${patientName} + notify`,
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}

// Secondary follow-up: Create task
export async function createTaskFromCallPlan(call: CallRecord, context: CallPlanContext): Promise<Plan> {
  const patientName = call.patientName || 'caller'
  const taskDescription = `Follow up on call with ${patientName} - ${call.summary}`
  
  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: 'Create follow-up task',
      run: async () => {
        console.log(`📋 Task created: ${taskDescription}`)
        await new Promise(resolve => setTimeout(resolve, 400))
      },
      undo: async () => {
        console.log('Task removed')
      }
    },
    {
      id: 'step-2',
      label: 'Assign to appropriate staff member',
      run: async () => {
        console.log('👤 Task assigned to reception team')
        await new Promise(resolve => setTimeout(resolve, 300))
      },
      undo: async () => {
        console.log('Task assignment cleared')
      }
    },
    {
      id: 'step-3',
      label: 'Set reminder for tomorrow',
      run: async () => {
        console.log('⏰ Reminder scheduled for tomorrow 9am')
        await new Promise(resolve => setTimeout(resolve, 200))
      },
      undo: async () => {
        console.log('Reminder cancelled')
      }
    }
  ]

  return {
    id: `plan-${Date.now()}`,
    title: `Create follow-up task for ${patientName}`,
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}

// Insurance verification follow-up
export async function verifyInsuranceFromCallPlan(call: CallRecord, context: CallPlanContext): Promise<Plan> {
  const patientName = call.patientName || 'caller'
  
  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: `Check ${patientName}'s insurance details`,
      run: async () => {
        console.log('🔍 Retrieving insurance information from patient record')
        await new Promise(resolve => setTimeout(resolve, 700))
      },
      undo: async () => {
        console.log('Cleared insurance lookup')
      }
    },
    {
      id: 'step-2',
      label: 'Contact insurer for eligibility verification',
      run: async () => {
        console.log('📞 Contacting AXA for coverage verification')
        await new Promise(resolve => setTimeout(resolve, 1200))
      },
      undo: async () => {
        console.log('Cancelled insurer contact')
      }
    },
    {
      id: 'step-3',
      label: 'Update patient record with verification status',
      run: async () => {
        console.log('✅ Coverage verified - valid until March 2025')
        await new Promise(resolve => setTimeout(resolve, 400))
      },
      undo: async () => {
        console.log('Removed verification status from record')
      }
    }
  ]

  return {
    id: `plan-${Date.now()}`,
    title: `Verify insurance for ${patientName}`,
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}

// Payment link follow-up
export async function sendPaymentLinkFromCallPlan(call: CallRecord, context: CallPlanContext): Promise<Plan> {
  const patientName = call.patientName || 'caller'
  const amount = '£145.00' // Demo amount
  
  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: `Generate secure payment link for ${amount}`,
      run: async () => {
        console.log('💳 Created Stripe payment link: stripe.com/pay/demo123')
        await new Promise(resolve => setTimeout(resolve, 500))
      },
      undo: async () => {
        console.log('Payment link invalidated')
      }
    },
    {
      id: 'step-2',
      label: `Send payment SMS to ${patientName}`,
      run: async () => {
        console.log('📱 SMS with payment link sent to patient')
        await new Promise(resolve => setTimeout(resolve, 300))
      },
      undo: async () => {
        console.log('Payment SMS cancelled')
      }
    }
  ]

  return {
    id: `plan-${Date.now()}`,
    title: `Send ${amount} payment link to ${patientName}`,
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}

// New patient creation follow-up
export async function createPatientFromCallPlan(call: CallRecord, context: CallPlanContext): Promise<Plan> {
  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: 'Create new patient record',
      run: async () => {
        console.log(`👤 New patient record created for ${call.phone}`)
        await new Promise(resolve => setTimeout(resolve, 600))
      },
      undo: async () => {
        console.log('Patient record deleted')
      }
    },
    {
      id: 'step-2',
      label: 'Send welcome information pack',
      run: async () => {
        console.log('📧 Welcome email sent with practice information')
        await new Promise(resolve => setTimeout(resolve, 400))
      },
      undo: async () => {
        console.log('Welcome email cancelled')
      }
    },
    {
      id: 'step-3',
      label: 'Schedule initial consultation',
      run: async () => {
        console.log('📅 Initial consultation booked for next week')
        await new Promise(resolve => setTimeout(resolve, 500))
      },
      undo: async () => {
        console.log('Initial consultation cancelled')
      }
    }
  ]

  return {
    id: `plan-${Date.now()}`,
    title: 'Create new patient + welcome',
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}

// New booking follow-up
export async function newBookingFromCallPlan(call: CallRecord, context: CallPlanContext): Promise<Plan> {
  const patientName = call.patientName || 'new patient'
  
  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: 'Check practitioner availability',
      run: async () => {
        console.log('📅 Found available slots with Dr Patel next week')
        await new Promise(resolve => setTimeout(resolve, 700))
      },
      undo: async () => {
        console.log('Released availability check')
      }
    },
    {
      id: 'step-2',
      label: `Book appointment for ${patientName}`,
      run: async () => {
        console.log('✅ Appointment booked for Tuesday 3:00pm')
        await new Promise(resolve => setTimeout(resolve, 500))
      },
      undo: async () => {
        console.log('Appointment cancelled')
      }
    },
    {
      id: 'step-3',
      label: 'Send confirmation with directions',
      run: async () => {
        console.log('📱 Confirmation SMS sent with clinic address and parking info')
        await new Promise(resolve => setTimeout(resolve, 400))
      },
      undo: async () => {
        console.log('Confirmation message cancelled')
      }
    }
  ]

  return {
    id: `plan-${Date.now()}`,
    title: `New booking for ${patientName}`,
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}
