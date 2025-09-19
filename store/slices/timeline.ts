import { StateCreator } from 'zustand'
import { Plan, EventItem } from '@/types/core'

export interface TimelineSlice {
  events: EventItem[]
  activePlan?: Plan
  failedSteps?: Record<string, { planId: string; stepId: string; run: () => Promise<void>; undo?: () => Promise<void> }>
  
  // Actions
  addEvent: (event: Omit<EventItem, 'id' | 'ts'>) => void
  undoEvent: (eventId: string) => Promise<void>
  undoAllPlan: (planId: string) => Promise<void>
  executePlan: (plan: Plan) => Promise<void>
  setActivePlan: (plan?: Plan) => void
  retryFailed: (planId: string) => Promise<void>
}

export const createTimelineSlice: StateCreator<TimelineSlice> = (set, get) => ({
  events: [],
  activePlan: undefined,
  failedSteps: {},

  addEvent: (eventData) => {
    const event: EventItem = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ts: Date.now(),
    }
    
    set((state) => ({
      events: [...state.events, event]
    }))
  },

  undoEvent: async (eventId: string) => {
    const { events, addEvent } = get()
    const event = events.find(e => e.id === eventId)
    
    if (event && event.undo) {
      try {
        await event.undo()
        
        // Add undo event to timeline
        addEvent({
          type: 'system.undo',
          summary: `Undid: ${event.summary}`,
          actor: 'user',
          source: 'cmdk',
          planId: event.planId,
        })
      } catch (error) {
        console.error('Failed to undo event:', error)
        // Add failed undo event
        addEvent({
          type: 'system.undo.failed',
          summary: `Failed to undo: ${event.summary}`,
          actor: 'system',
          source: 'cmdk',
          planId: event.planId,
        })
      }
    }
  },

  undoAllPlan: async (planId: string) => {
    const { events, undoEvent, addEvent } = get()
    const planEvents = events.filter(e => e.planId === planId).reverse() // LIFO order
    
    // Add plan undo start event
    addEvent({
      type: 'plan.undo.start',
      summary: `Starting undo of plan: ${planId}`,
      actor: 'user',
      source: 'cmdk',
      planId,
    })

    for (const event of planEvents) {
      if (event.undo && !event.type.startsWith('system.undo')) {
        await undoEvent(event.id)
      }
    }

    // Add plan undo complete event
    addEvent({
      type: 'plan.undo.complete',
      summary: `Completed undo of plan: ${planId}`,
      actor: 'user',
      source: 'cmdk',
      planId,
    })
  },

  executePlan: async (plan: Plan) => {
    const { addEvent } = get()
    
    // Set as active plan
    set({ activePlan: plan })
    
    // Add plan start event
    addEvent({
      type: 'plan.start',
      summary: `Starting plan: ${plan.title}`,
      actor: plan.actor,
      source: plan.source,
      planId: plan.id,
    })

    try {
      // Execute each step with timing
      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i]
        
        // Add step start event
        addEvent({
          type: 'step.start',
          summary: `Starting: ${step.label}`,
          actor: plan.actor,
          source: plan.source,
          planId: plan.id,
          stepId: step.id,
        })

        // Execute the step with failure capture
        try {
          await step.run()
          // Add step complete event with undo capability
          addEvent({
            type: 'step.complete',
            summary: step.label,
            actor: plan.actor,
            source: plan.source,
            planId: plan.id,
            stepId: step.id,
            undo: step.undo,
          })
        } catch (e) {
          // Mark failed and store retry handle
          set((state) => ({
            failedSteps: {
              ...state.failedSteps,
              [`${plan.id}:${step.id}`]: { planId: plan.id, stepId: step.id, run: step.run, undo: step.undo },
            },
          }))
          addEvent({
            type: 'step.failed',
            summary: `${step.label} — ${(e as Error).message}`,
            actor: 'system',
            source: plan.source,
            planId: plan.id,
            stepId: step.id,
          })
        }

        // Add realistic delay between steps (≤2s apart as per README)
        if (i < plan.steps.length - 1) {
          const delay = 300 + Math.random() * 900 // 300–1200ms
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }

      // Determine overall status
      const hadFailures = Object.keys(get().failedSteps || {}).some(k => k.startsWith(`${plan.id}:`))
      addEvent({
        type: hadFailures ? 'plan.partial' : 'plan.complete',
        summary: `${hadFailures ? 'Completed with failures' : 'Completed'}: ${plan.title}`,
        actor: hadFailures ? 'system' : plan.actor,
        source: plan.source,
        planId: plan.id,
      })

    } catch (error) {
      // Add plan failed event
      addEvent({
        type: 'plan.failed',
        summary: `Failed plan: ${plan.title} - ${error}`,
        actor: 'system',
        source: plan.source,
        planId: plan.id,
      })
    } finally {
      // Clear active plan
      set({ activePlan: undefined })
    }
  },

  setActivePlan: (plan) => {
    set({ activePlan: plan })
  },

  retryFailed: async (planId: string) => {
    const { addEvent } = get()
    const failed = Object.values(get().failedSteps || {}).filter(f => f.planId === planId)
    for (const step of failed) {
      try {
        await step.run()
        addEvent({
          type: 'step.retry.success',
          summary: `Retried: ${step.stepId}`,
          actor: 'user',
          source: 'cmdk',
          planId: planId,
          stepId: step.stepId,
          undo: step.undo,
        })
        set((state) => {
          const next = { ...(state.failedSteps || {}) }
          delete next[`${planId}:${step.stepId}`]
          return { failedSteps: next }
        })
      } catch (e) {
        addEvent({
          type: 'step.retry.failed',
          summary: `Retry failed: ${step.stepId}`,
          actor: 'system',
          source: 'cmdk',
          planId: planId,
          stepId: step.stepId,
        })
      }
    }
  }
})
