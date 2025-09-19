'use client'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface AutopilotPack {
  id: string
  name: string
  description: string
  icon: string
  color: string
  enabled: boolean
  tasks: string[]
  relevantRoles: ('Reception' | 'Clinician' | 'Manager')[]
  agent: {
    name: string
    specialty: string
  }
}

export interface AutopilotPacksState {
  packs: AutopilotPack[]
  togglePack: (packId: string) => void
  getEnabledPacks: () => AutopilotPack[]
  getPacksForRole: (role: string) => AutopilotPack[]
  isTaskEnabled: (taskType: string) => boolean
}

const defaultPacks: AutopilotPack[] = [
  {
    id: 'patient-outreach',
    name: 'Patient Outreach & Engagement',
    description: 'Appointment reminders, follow-ups, satisfaction surveys, and health education',
    icon: '📞',
    color: 'blue',
    enabled: true,
    tasks: ['appointment_reminder', 'confirmation_request', 'follow_up_care', 'satisfaction_survey', 'health_education'],
    relevantRoles: ['Reception', 'Clinician', 'Manager'],
    agent: {
      name: 'OutreachBot',
      specialty: 'Patient Communication & Engagement'
    }
  },
  {
    id: 'insurance-eligibility',
    name: 'Insurance & Eligibility Verification',
    description: 'Real-time insurance verification, prior authorizations, and benefit checks',
    icon: '🛡️',
    color: 'green',
    enabled: true,
    tasks: ['insurance_verification', 'eligibility_check', 'prior_authorization', 'benefit_verification'],
    relevantRoles: ['Reception', 'Manager'],
    agent: {
      name: 'InsuranceBot',
      specialty: 'Benefits Verification & Authorization'
    }
  },
  {
    id: 'collections-billing',
    name: 'Collections & Revenue Cycle',
    description: 'Payment reminders, collections follow-up, and revenue optimization',
    icon: '💰',
    color: 'emerald',
    enabled: true,
    tasks: ['payment_reminder', 'collections_follow_up', 'payment_plans', 'revenue_optimization'],
    relevantRoles: ['Reception', 'Manager'],
    agent: {
      name: 'CollectionsBot',
      specialty: 'Revenue Cycle & Collections Management'
    }
  },
  {
    id: 'clinical-documentation',
    name: 'Clinical Documentation & Coding',
    description: 'Automated clinical notes, ICD-10 coding suggestions, and documentation review',
    icon: '📋',
    color: 'purple',
    enabled: true,
    tasks: ['clinical_notes', 'icd_coding', 'documentation_review', 'template_generation'],
    relevantRoles: ['Clinician', 'Manager'],
    agent: {
      name: 'ClinicalBot',
      specialty: 'Clinical Documentation & Medical Coding'
    }
  },
  {
    id: 'smart-scheduling',
    name: 'Smart Scheduling & Optimization',
    description: 'Intelligent appointment scheduling, cancellation management, and waitlist optimization',
    icon: '🗓️',
    color: 'amber',
    enabled: true,
    tasks: ['smart_scheduling', 'cancellation_management', 'waitlist_optimization', 'resource_allocation'],
    relevantRoles: ['Reception', 'Manager'],
    agent: {
      name: 'SchedulingBot',
      specialty: 'Appointment Optimization & Resource Management'
    }
  },
  {
    id: 'compliance-monitoring',
    name: 'Compliance & Quality Assurance',
    description: 'HIPAA compliance monitoring, quality metrics tracking, and audit preparation',
    icon: '🔍',
    color: 'red',
    enabled: false,
    tasks: ['hipaa_monitoring', 'quality_metrics', 'audit_preparation', 'incident_reporting'],
    relevantRoles: ['Clinician', 'Manager'],
    agent: {
      name: 'ComplianceBot',
      specialty: 'Regulatory Compliance & Quality Assurance'
    }
  },
  {
    id: 'call-management',
    name: 'Call Management & Routing',
    description: 'Intelligent call routing, voicemail transcription, and callback scheduling',
    icon: '☎️',
    color: 'cyan',
    enabled: false,
    tasks: ['call_routing', 'voicemail_transcription', 'callback_scheduling', 'call_analytics'],
    relevantRoles: ['Reception', 'Manager'],
    agent: {
      name: 'CallBot',
      specialty: 'Telecommunications & Call Center Operations'
    }
  },
  {
    id: 'inventory-supplies',
    name: 'Inventory & Supply Management',
    description: 'Automated inventory tracking, supply reordering, and vendor management',
    icon: '📦',
    color: 'orange',
    enabled: false,
    tasks: ['inventory_tracking', 'auto_reordering', 'vendor_management', 'cost_optimization'],
    relevantRoles: ['Manager'],
    agent: {
      name: 'InventoryBot',
      specialty: 'Supply Chain & Inventory Management'
    }
  }
]

export const useAutopilotPacks = create<AutopilotPacksState>()(
  devtools(
    persist(
      (set, get) => ({
        packs: defaultPacks,
        
        togglePack: (packId: string) => {
          set((state) => ({
            packs: state.packs.map(pack => 
              pack.id === packId ? { ...pack, enabled: !pack.enabled } : pack
            )
          }))
        },
        
        getEnabledPacks: () => {
          return get().packs.filter(pack => pack.enabled)
        },
        
        getPacksForRole: (role: string) => {
          return get().packs.filter(pack => 
            pack.relevantRoles.includes(role as any)
          )
        },
        
        isTaskEnabled: (taskType: string) => {
          const enabledPacks = get().getEnabledPacks()
          return enabledPacks.some(pack => pack.tasks.includes(taskType))
        }
      }),
      {
        name: 'autopilot-packs-storage',
      }
    ),
    {
      name: 'autopilot-packs-store',
    }
  )
)
