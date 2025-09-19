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

// Additional KPI plan factories
export async function sendSurveysPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: 'Identify recent patients (last 7 days)',
      run: async () => {
        console.log('Scanning recent patient visits')
        await new Promise(resolve => setTimeout(resolve, 1000))
      },
      undo: async () => {
        console.log('Cancelled patient scan')
      }
    },
    {
      id: 'step-2',
      label: 'Generate personalized survey links',
      run: async () => {
        console.log('Creating survey links')
        await new Promise(resolve => setTimeout(resolve, 1200))
      },
      undo: async () => {
        console.log('Deleted survey links')
      }
    },
    {
      id: 'step-3',
      label: 'Send via SMS with follow-up schedule',
      run: async () => {
        console.log('Dispatching survey SMS batch')
        await new Promise(resolve => setTimeout(resolve, 800))
      },
      undo: async () => {
        console.log('Cancelled SMS dispatch')
      }
    }
  ]

  return {
    id: `surveys-${Date.now()}`,
    title: 'Send patient satisfaction surveys',
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}

export async function optimizeSchedulePlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: 'Analyze current appointment gaps',
      run: async () => {
        console.log('Analyzing schedule efficiency')
        await new Promise(resolve => setTimeout(resolve, 1500))
      },
      undo: async () => {
        console.log('Cancelled schedule analysis')
      }
    },
    {
      id: 'step-2',
      label: 'Identify optimization opportunities',
      run: async () => {
        console.log('Finding schedule improvements')
        await new Promise(resolve => setTimeout(resolve, 1000))
      },
      undo: async () => {
        console.log('Cleared optimization suggestions')
      }
    },
    {
      id: 'step-3',
      label: 'Propose schedule adjustments',
      run: async () => {
        console.log('Generating schedule recommendations')
        await new Promise(resolve => setTimeout(resolve, 800))
      },
      undo: async () => {
        console.log('Removed schedule recommendations')
      }
    }
  ]

  return {
    id: `optimize-${Date.now()}`,
    title: 'Optimize appointment schedule',
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}

export async function reviewPricingPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: 'Compare current pricing with market rates',
      run: async () => {
        console.log('Analyzing market pricing data')
        await new Promise(resolve => setTimeout(resolve, 2000))
      },
      undo: async () => {
        console.log('Cancelled pricing analysis')
      }
    },
    {
      id: 'step-2',
      label: 'Review service profitability',
      run: async () => {
        console.log('Calculating service margins')
        await new Promise(resolve => setTimeout(resolve, 1200))
      },
      undo: async () => {
        console.log('Cleared profitability calculations')
      }
    },
    {
      id: 'step-3',
      label: 'Generate pricing recommendations',
      run: async () => {
        console.log('Creating pricing strategy recommendations')
        await new Promise(resolve => setTimeout(resolve, 1000))
      },
      undo: async () => {
        console.log('Removed pricing recommendations')
      }
    }
  ]

  return {
    id: `pricing-${Date.now()}`,
    title: 'Review and optimize pricing strategy',
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}

export async function setupRemindersPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: 'Configure appointment reminder templates',
      run: async () => {
        console.log('Setting up reminder templates')
        await new Promise(resolve => setTimeout(resolve, 800))
      },
      undo: async () => {
        console.log('Removed reminder templates')
      }
    },
    {
      id: 'step-2',
      label: 'Set reminder timing preferences',
      run: async () => {
        console.log('Configuring reminder schedule')
        await new Promise(resolve => setTimeout(resolve, 600))
      },
      undo: async () => {
        console.log('Reset reminder timing')
      }
    },
    {
      id: 'step-3',
      label: 'Enable automated reminder system',
      run: async () => {
        console.log('Activating reminder automation')
        await new Promise(resolve => setTimeout(resolve, 500))
      },
      undo: async () => {
        console.log('Disabled reminder automation')
      }
    }
  ]

  return {
    id: `reminders-${Date.now()}`,
    title: 'Setup automated appointment reminders',
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}

export async function setupPaymentPlansPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: 'Identify patients with outstanding balances',
      run: async () => {
        console.log('Scanning outstanding invoices')
        await new Promise(resolve => setTimeout(resolve, 1200))
      },
      undo: async () => {
        console.log('Cancelled balance scan')
      }
    },
    {
      id: 'step-2',
      label: 'Generate payment plan options',
      run: async () => {
        console.log('Creating payment plan templates')
        await new Promise(resolve => setTimeout(resolve, 1000))
      },
      undo: async () => {
        console.log('Removed payment plan templates')
      }
    },
    {
      id: 'step-3',
      label: 'Send payment plan offers to patients',
      run: async () => {
        console.log('Dispatching payment plan offers')
        await new Promise(resolve => setTimeout(resolve, 800))
      },
      undo: async () => {
        console.log('Cancelled payment plan offers')
      }
    }
  ]

  return {
    id: `payment-plans-${Date.now()}`,
    title: 'Setup patient payment plans',
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}

export async function scheduleFollowUpsPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: 'Review recent consultations requiring follow-up',
      run: async () => {
        console.log('Analyzing recent consultations')
        await new Promise(resolve => setTimeout(resolve, 1000))
      },
      undo: async () => {
        console.log('Cancelled consultation review')
      }
    },
    {
      id: 'step-2',
      label: 'Determine optimal follow-up timing',
      run: async () => {
        console.log('Calculating follow-up schedules')
        await new Promise(resolve => setTimeout(resolve, 800))
      },
      undo: async () => {
        console.log('Cleared follow-up schedules')
      }
    },
    {
      id: 'step-3',
      label: 'Send follow-up booking invitations',
      run: async () => {
        console.log('Sending follow-up invitations')
        await new Promise(resolve => setTimeout(resolve, 600))
      },
      undo: async () => {
        console.log('Cancelled follow-up invitations')
      }
    }
  ]

  return {
    id: `followups-${Date.now()}`,
    title: 'Schedule patient follow-up appointments',
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}

export async function optimizeHighRiskSlotsPlan(match: RegExpMatchArray, context: PlanContext): Promise<Plan> {
  const steps: PlanStep[] = [
    {
      id: 'step-1',
      label: 'Identify high-risk appointment slots',
      run: async () => {
        console.log('Analyzing appointment risk patterns')
        await new Promise(resolve => setTimeout(resolve, 1500))
      },
      undo: async () => {
        console.log('Cancelled risk analysis')
      }
    },
    {
      id: 'step-2',
      label: 'Calculate no-show probability scores',
      run: async () => {
        console.log('Computing no-show predictions')
        await new Promise(resolve => setTimeout(resolve, 1200))
      },
      undo: async () => {
        console.log('Cleared prediction scores')
      }
    },
    {
      id: 'step-3',
      label: 'Apply dynamic overbooking strategy',
      run: async () => {
        console.log('Implementing overbooking optimization')
        await new Promise(resolve => setTimeout(resolve, 800))
      },
      undo: async () => {
        console.log('Reverted overbooking changes')
      }
    }
  ]

  return {
    id: `optimize-risk-${Date.now()}`,
    title: 'Optimize high-risk appointment slots',
    actor: context.actor,
    source: context.source,
    steps,
    status: 'pending'
  }
}