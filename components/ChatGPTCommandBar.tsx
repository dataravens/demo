'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore, useRole } from '@/store'
import { createPlan } from '@/services/planner'
import { askQuestion } from '@/services/ask-engine'
import { conversationalAI } from '@/services/conversational-ai'
import { Sparkles, Send, MessageSquare, Paperclip, Mic } from 'lucide-react'
import { Plan, ConversationMessage } from '@/types/core'
// Using regular HTML buttons instead of UI library
// import { toast } from 'sonner' // Not available, using console.log for now
import { v4 as uuidv4 } from 'uuid'
import { usePathname } from 'next/navigation'

interface ChatGPTCommandBarProps {
  onPlanCreated: (plan: Plan) => void
  onOpenConversation: () => void
}

export default function ChatGPTCommandBar({ onPlanCreated, onOpenConversation }: ChatGPTCommandBarProps) {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [mode, setMode] = useState<'do' | 'ask'>('do')
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { autopilotMode, patients, appointments, invoices } = useStore()
  const { currentRole } = useRole()
  const pathname = usePathname()

  // Auto-focus on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isProcessing) return

    const command = input.trim()
    setInput('')
    setIsProcessing(true)

    try {
      if (mode === 'ask') {
        // For Ask mode, open the conversation panel with the query
        onOpenConversation()
        // Process the ask query
        const response = await askQuestion(command, { 
          patients, 
          appointments, 
          invoices, 
          role: currentRole 
        })
        
        // Add to conversation history
        const sessionId = sessionStorage.getItem('conversationSessionId') || uuidv4()
        sessionStorage.setItem('conversationSessionId', sessionId)
        
        const userMessage: ConversationMessage = {
          id: uuidv4(),
          role: 'user',
          content: command,
          timestamp: new Date(),
        }
        
        const aiMessage: ConversationMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: `Here's what I found for "${command}":`,
          timestamp: new Date(),
          type: 'information',
          data: response,
          relatedCommand: command,
        }
        
        conversationalAI.addMessage(sessionId, userMessage)
        conversationalAI.addMessage(sessionId, aiMessage)
        
        console.log('Query processed - check the conversation panel')
      } else {
        // For Do mode, try to create a plan directly
        const plan = await createPlan(command, {
          actor: 'user',
          source: 'cmdk',
          role: currentRole,
          autopilotMode,
          patients,
          appointments,
          invoices
        } as any)

        if (plan) {
          if (plan.needsClarification) {
            // Open conversation for clarification
            onOpenConversation()
            console.log('I need more details - check the conversation panel')
          } else {
            // Plan is ready, open preview
            onPlanCreated(plan)
            console.log('Plan created successfully')
          }
        } else {
          // Fallback to conversation
          onOpenConversation()
          console.log('Let me help you with that - check the conversation panel')
        }
      }
    } catch (error: any) {
      console.error('Command processing failed:', error)
      console.error(`Error: ${error.message || 'Failed to process command'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const placeholderText = mode === 'do' 
    ? 'Type an instruction... e.g., "Chase invoices >30d and confirm SMS"'
    : 'Ask a question... e.g., "What\'s our monthly revenue trend?"'

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-lg z-40 relative">
      {/* Subtle cyan glow line at the top of the bar */}
      <div className="absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="relative">
          {/* Mode Toggle */}
          <div className="flex items-center justify-center mb-3">
            <div className="flex items-center bg-gray-100 rounded-full p-1">
              <button
                type="button"
                onClick={() => setMode('do')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  mode === 'do'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>DO</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('ask')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  mode === 'ask'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>ASK</span>
              </button>
            </div>
          </div>

          {/* Input Container with cyan AI glow */}
          <div className="group relative">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-400/40 via-cyan-300/30 to-cyan-400/40 blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center rounded-xl border border-cyan-200/60 bg-white/80 backdrop-blur px-0 shadow-[0_0_0_1px_rgba(103,232,249,0.25)] hover:shadow-[0_0_0_2px_rgba(34,211,238,0.35)] focus-within:ring-2 focus-within:ring-cyan-400">
            {/* Attachment Button */}
            <button
              type="button"
              className="absolute left-3 p-2 text-cyan-700/60 hover:text-cyan-700 transition-colors"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Main Input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholderText}
              disabled={isProcessing}
              className="w-full pl-12 pr-20 py-3 bg-transparent rounded-xl text-sm placeholder:text-cyan-700/60 focus:outline-none disabled:opacity-50"
            />

            {/* Voice Input Button */}
            <button
              type="button"
              className="absolute right-12 p-2 text-cyan-700/60 hover:text-cyan-700 transition-colors"
              title="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className={`absolute right-2 p-2 rounded-lg transition-all ${
                input.trim() && !isProcessing
                  ? mode === 'do' 
                    ? 'bg-cyan-600 text-white hover:bg-cyan-700' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Press Enter to send</span>
              <span>•</span>
              <button
                type="button"
                onClick={onOpenConversation}
                className="hover:text-gray-700 transition-colors"
              >
                View conversation history
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">
                {currentRole} mode
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
