'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, Command, MessageSquare, Info, Lightbulb, X } from 'lucide-react'
import { useStore } from '@/store'
import { createPlan } from '@/services/planner'
import { askQuestion } from '@/services/ask-engine'
import ClarificationModal from '@/components/ClarificationModal'
import { conversationalAI } from '@/services/conversational-ai'
import type { ConversationMessage } from '@/types/core'

interface AICommandOmniProps {
  onPlanCreated: (plan: any) => void
}

export default function AICommandOmni({ onPlanCreated }: AICommandOmniProps) {
  const { autopilotMode, role, patients, appointments, invoices } = useStore()
  const [value, setValue] = useState('')
  const [hint, setHint] = useState('Ask, plan, do…')
  const [mode, setMode] = useState<'do' | 'ask'>('do')
  const [clarificationPlan, setClarificationPlan] = useState<any>(null)
  const [showClarificationModal, setShowClarificationModal] = useState(false)
  const [assistantMsg, setAssistantMsg] = useState<ConversationMessage | null>(null)
  const [showAssistant, setShowAssistant] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const sessionIdRef = useRef<string>('omni-' + Date.now())

  useEffect(() => {
    const doHints = [
      "Reschedule Sarah to Thu 2:30 and notify",
      "Set up payment plan for Amelia £72.50 x2", 
      "Verify insurance for tomorrow's appointments",
      "Clinical wrap-up for Mrs Smith",
    ]
    const askHints = [
      "What's our monthly revenue trend?",
      "Show me patient demographics",
      "Which practitioners are top performers?",
      "What trends do you see in our data?",
    ]
    
    const hints = mode === 'ask' ? askHints : doHints
    let i = 0
    const id = setInterval(() => {
      i = (i + 1) % hints.length
      setHint(hints[i])
    }, 5000)
    return () => clearInterval(id)
  }, [mode])

  const submit = async () => {
    const phrase = value.trim()
    if (!phrase) return
    try {
      if (mode === 'ask') {
        // Handle Ask mode - could show results in a toast or modal
        const response = await askQuestion(phrase, { patients, appointments, invoices, role })
        console.log('Ask response:', response)
        // For now, just log the response. In a full implementation,
        // you might show this in a toast or redirect to insights page
        setValue('')
      } else {
        // Handle Do mode
        // Lightweight ambiguity check before plan creation to enable conversational flow
        const looksAmbiguous = /appointments?/i.test(phrase) && !/(mon|tue|wed|thu|fri|sat|sun|today|tomorrow|next|\d{1,2}:\d{2}|am|pm)/i.test(phrase)
        if (looksAmbiguous) {
          try {
            conversationalAI.getOrCreateConversation(sessionIdRef.current, role as any, typeof window !== 'undefined' ? window.location.pathname : undefined)
            conversationalAI.addUserMessage(sessionIdRef.current, phrase, phrase)
            const ai = await conversationalAI.generateResponse(sessionIdRef.current, phrase)
            if (ai) {
              setAssistantMsg(ai)
              setShowAssistant(true)
              return
            }
          } catch {}
        }

        const plan = await createPlan(phrase, {
          actor: 'user',
          source: 'cmdk',
          role,
          autopilotMode,
          patients,
          appointments,
          invoices
        } as any)
        if (plan) {
          // Check if plan needs clarification
          if (plan.needsClarification) {
            setClarificationPlan(plan)
            setShowClarificationModal(true)
          } else {
            onPlanCreated(plan)
            setValue('')
          }
        }
      }
    } catch (err) {
      console.error('AICommandOmni submit failed', err)
    }
  }

  // Handle clarification answers
  const handleClarificationSubmit = async (answers: Record<string, any>) => {
    if (!clarificationPlan) return

    try {
      // Create a new command with clarification answers
      let enhancedCommand = clarificationPlan.originalCommand || value
      
      // Simple approach: append answers to the command
      const answerText = Object.entries(answers).map(([questionId, answer]) => {
        if (Array.isArray(answer)) {
          return answer.join(', ')
        }
        return answer
      }).join(' ')
      
      enhancedCommand = `${enhancedCommand} - ${answerText}`

      // Create a new plan with the enhanced command
      const plan = await createPlan(enhancedCommand, { 
        actor: 'user', 
        source: 'cmdk',
        role,
        autopilotMode,
        patients,
        appointments,
        invoices
      } as any)
      
      if (plan && !plan.needsClarification) {
        onPlanCreated(plan)
        setShowClarificationModal(false)
        setClarificationPlan(null)
        setValue('')
      }
    } catch (error) {
      console.error('Failed to process clarification:', error)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div
      className="group relative"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-400/40 via-cyan-300/30 to-cyan-400/40 blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" />
      <div className="relative flex items-center gap-2 rounded-xl border border-cyan-200/60 bg-white/80 backdrop-blur px-3 py-2 shadow-[0_0_0_1px_rgba(103,232,249,0.25)] hover:shadow-[0_0_0_2px_rgba(34,211,238,0.35)] focus-within:ring-2 focus-within:ring-cyan-400">
        <div className="flex items-center gap-1 text-cyan-700">
          {mode === 'ask' ? <MessageSquare className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          <button 
            onClick={() => setMode(mode === 'ask' ? 'do' : 'ask')}
            className="text-xs font-semibold tracking-wide hover:text-cyan-800 transition-colors"
          >
            {mode === 'ask' ? 'ASK' : 'AI'}
          </button>
        </div>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={hint}
          className="flex-1 bg-transparent outline-none placeholder:text-cyan-700/60 text-sm"
        />
        <div className="hidden md:flex items-center gap-1 text-xs text-cyan-700/70">
          <Command className="w-3.5 h-3.5" />
          <span>K</span>
        </div>
      </div>

      {/* Inline conversational assistant popover */}
      {showAssistant && assistantMsg && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3">
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                {assistantMsg.type === 'suggestion' ? (
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                ) : (
                  <Info className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-900">{assistantMsg.content}</div>
                {assistantMsg.suggestions && assistantMsg.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {assistantMsg.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setValue(s)
                          setShowAssistant(false)
                          setTimeout(() => submit(), 0)
                        }}
                        className="text-xs px-2 py-1 rounded-full bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowAssistant(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clarification Modal */}
      <ClarificationModal
        isOpen={showClarificationModal}
        onClose={() => {
          setShowClarificationModal(false)
          setClarificationPlan(null)
        }}
        plan={clarificationPlan}
        onSubmit={handleClarificationSubmit}
      />
    </div>
  )
}


