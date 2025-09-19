import { StateCreator } from 'zustand'
import { Actor } from '@/types/core'

export type AutopilotMode = 'manual' | 'ask' | 'scheduled'
export type Role = 'reception' | 'clinician' | 'manager'

export interface AutopilotSlice {
  autopilotMode: AutopilotMode
  role: Role
  
  // Actions
  setAutopilotMode: (mode: AutopilotMode) => void
  setRole: (role: Role) => void
}

export const createAutopilotSlice: StateCreator<AutopilotSlice> = (set) => ({
  autopilotMode: 'manual',
  role: 'clinician',

  setAutopilotMode: (mode) => {
    set({ autopilotMode: mode })
  },

  setRole: (role) => {
    set({ role })
  },
})
