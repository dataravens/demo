import { StateCreator } from 'zustand'

export interface DemoSlice {
  demoMode: boolean
  
  // Actions
  resetDemo: () => void
  toggleDemoMode: () => void
}

export const createDemoSlice: StateCreator<DemoSlice> = (set, get) => ({
  demoMode: true, // Start in demo mode

  resetDemo: () => {
    // Reset all state to initial demo values
    set((state) => ({
      ...state,
      events: [],
      activePlan: undefined,
      // Data will be reset by the data slice
    }))
    
    // Trigger data reset
    const store = get() as any
    if (store.loadDemoData) {
      store.loadDemoData()
    }
  },

  toggleDemoMode: () => {
    set((state) => ({
      demoMode: !state.demoMode
    }))
  },
})
