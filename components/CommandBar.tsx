'use client'

import { useState, useEffect, useRef } from 'react'
import { useStore } from '@/store'
import { createPlan } from '@/services/planner'
import { askQuestion } from '@/services/ask-engine'
import { practiceAI } from '@/services/ai'
import { Brain, Sparkles, MessageSquare } from 'lucide-react'
import AskResponse from '@/components/AskResponse'
import ClarificationModal from '@/components/ClarificationModal'

interface CommandBarProps {
  isOpen: boolean
  onClose: () => void
  onPlanCreated: (plan: any) => void
}

export default function CommandBar({ isOpen, onClose, onPlanCreated }: CommandBarProps) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [aiSuggestion, setAISuggestion] = useState<any>(null)
  const [mode, setMode] = useState<'do' | 'ask'>('do')
  const [askResponse, setAskResponse] = useState<any>(null)
  const [clarificationPlan, setClarificationPlan] = useState<any>(null)
  const [showClarificationModal, setShowClarificationModal] = useState(false)
  const [showExamples, setShowExamples] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { autopilotMode, role, patients, appointments, invoices } = useStore()

  // Example phrases for different roles
  const examplePhrases: Record<string, string[]> = {
    reception: [
      "Chase invoices >30d and confirm SMS delivery",
      "Schedule Sarah for Thu 2:30 and notify via text",
      "Set up payment plan for Amelia £72.50 x3 months",
      "Verify insurance for all tomorrow's appointments",
      "Send batch reminders to DNA patients from last week"
    ],
    clinician: [
      "Clinical wrap-up for Mrs Johnson - referral to cardiology",
      "Draft urgent referral to Dr Martinez for chest pain",
      "Send prescription to Boots and task reception for follow-up",
      "Update treatment plan and schedule 2-week review"
    ],
    manager: [
      "Generate revenue report with insurance breakdown",
      "Review staff utilization and optimize next week's schedule",
      "Chase all overdue accounts >£100 with payment plans",
      "Audit appointment no-shows and implement prevention"
    ]
  }

  const getPlaceholderText = () => {
    const examples = [
      "Chase invoices >30d and confirm SMS delivery",
      "Schedule Sarah for Thu 2:30 and notify",
      "Set up payment plan for £72.50 x3 months",
      "Verify insurance for tomorrow's appointments",
      "Clinical wrap-up for Mrs Johnson",
      "Generate revenue report with breakdown"
    ]
    return `Type an instruction… e.g., "${examples[Math.floor(Math.random() * examples.length)]}"`
  }

  useEffect(() => {
    if (isOpen) {
      // Reset state when opened
      setInput('')
      setSuggestions([])
      setAISuggestion(null)
      setIsAIThinking(false)
      setAskResponse(null)
      setMode('do')
      setClarificationPlan(null)
      setShowClarificationModal(false)
      setShowExamples(false)
      
      // Auto-focus the input field
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Handle clarification answers
  const handleClarificationSubmit = async (answers: Record<string, any>) => {
    if (!clarificationPlan) return

    try {
      // Create a new command with clarification answers
      let enhancedCommand = clarificationPlan.originalCommand || input
      
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
      })
      
      if (plan && !plan.needsClarification) {
        onPlanCreated(plan)
        setShowClarificationModal(false)
        setClarificationPlan(null)
        onClose()
      }
    } catch (error) {
      console.error('Failed to process clarification:', error)
    }
  }

  // AI-powered command understanding
  const analyzeWithAI = async (value: string) => {
    if (value.length < 3) {
      setAISuggestion(null)
      return
    }
    
    setIsAIThinking(true)
    try {
      const aiContext = {
        patients,
        appointments,
        invoices,
        role,
        currentTime: new Date().toISOString()
      }
      
      const analysis = await practiceAI.understandCommand(value, aiContext)
      setAISuggestion(analysis)
    } catch (error) {
      console.error('AI analysis failed:', error)
      setAISuggestion(null)
    } finally {
      setIsAIThinking(false)
    }
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    
    // Simple phrase matching for demo (keeping as fallback)
    if (value.length > 3) {
      const currentExamples = examplePhrases[role] || []
      const matches = currentExamples.filter((phrase: string) => 
        phrase.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(matches.slice(0, 3))
    } else {
      setSuggestions([])
    }
  }

  // Debounced AI analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.length >= 3) {
        analyzeWithAI(input)
      } else {
        setAISuggestion(null)
      }
    }, 1000) // Wait for user to stop typing

    return () => clearTimeout(timer)
  }, [input])

  const handleSubmit = async (phrase: string = input) => {
    if (!phrase.trim()) return
    
    try {
      if (mode === 'ask') {
        // Handle Ask mode
        setIsAIThinking(true)
        const response = await askQuestion(phrase, { patients, appointments, invoices, role })
        setAskResponse(response)
        setIsAIThinking(false)
      } else {
        // Handle Do mode (existing logic)
        const commandToExecute = aiSuggestion && aiSuggestion.confidence > 0.6 
          ? aiSuggestion.suggestedAction 
          : phrase

        const plan = await createPlan(commandToExecute, { 
          actor: 'user', 
          source: 'cmdk',
          role,
          autopilotMode,
          patients,
          appointments,
          invoices
        })
        
        if (plan) {
          // Check if plan needs clarification
          if (plan.needsClarification) {
            setClarificationPlan(plan)
            setShowClarificationModal(true)
          } else {
            onPlanCreated(plan)
            onClose()
          }
        } else {
          // Show hint with example phrases
          setSuggestions(examplePhrases[role] || [])
        }
      }
    } catch (error) {
      console.error('Failed to handle submission:', error)
      setIsAIThinking(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-[20vh]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                mode === 'ask' ? 'bg-cyan-100' :
                aiSuggestion && aiSuggestion.confidence > 0.6 
                  ? 'bg-purple-100' 
                  : 'bg-blue-100'
              }`}>
                {isAIThinking ? (
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                ) : mode === 'ask' ? (
                  <MessageSquare className="w-4 h-4 text-cyan-600" />
                ) : aiSuggestion && aiSuggestion.confidence > 0.6 ? (
                  <Brain className="w-4 h-4 text-purple-600" />
                ) : (
                  <span className="text-blue-600 text-sm font-medium">⌘K</span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {mode === 'ask' ? 'Ask Your Data' : 
                   aiSuggestion && aiSuggestion.confidence > 0.6 ? 'AI Enhanced Command' : 'AI Command'}
                </h2>
                
                {/* Mode Switcher */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setMode('do')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      mode === 'do' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    DO
                  </button>
                  <button
                    onClick={() => setMode('ask')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      mode === 'ask' ? 'bg-white text-cyan-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    ASK
                  </button>
                </div>
              </div>
              
              {aiSuggestion && aiSuggestion.confidence > 0.6 && mode === 'do' && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs">
                  <Sparkles className="w-3 h-3" />
                  <span>{Math.round(aiSuggestion.confidence * 100)}% confident</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Role: <span className="font-medium capitalize">{role}</span></span>
              <span>Mode: <span className="font-medium capitalize">{autopilotMode}</span></span>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* AI Understanding Preview */}
        {aiSuggestion && aiSuggestion.confidence > 0.6 && (
          <div className="px-6 py-3 bg-purple-50 border-b border-purple-200">
            <div className="flex items-start space-x-3">
              <Brain className="w-4 h-4 text-purple-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-purple-900">
                  I understand: {aiSuggestion.intent}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  💡 {aiSuggestion.reasoning}
                </p>
                <p className="text-xs text-purple-600 mt-2 font-mono bg-white px-2 py-1 rounded">
                  Will execute: "{aiSuggestion.suggestedAction}"
                </p>
              </div>
            </div>
          </div>
        )}

        {aiSuggestion && aiSuggestion.confidence <= 0.6 && (
          <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center space-x-2 text-sm text-yellow-800">
              <span>🤔</span>
              <span>Please be more specific. Try commands like "clinical wrap-up for Mrs Smith" or "chase batch for overdue invoices"</span>
            </div>
          </div>
        )}

        {/* Ask Response */}
        {askResponse && mode === 'ask' && (
          <div className="px-6 py-4 border-b border-gray-200 bg-cyan-50">
            <AskResponse response={askResponse} />
          </div>
        )}

        {/* Input with Examples Dropdown */}
        <div className="px-6 py-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === 'ask' 
                ? "Ask about your practice… e.g., 'What's our monthly revenue trend?'"
                : getPlaceholderText()
              }
              className={`w-full px-4 py-3 pr-24 border rounded-lg text-lg focus:ring-2 focus:border-transparent ${
                mode === 'ask' 
                  ? 'border-cyan-300 focus:ring-cyan-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            
            {/* Examples Button */}
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Examples
            </button>
            
            {/* Examples Dropdown */}
            {showExamples && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                <div className="p-3 border-b border-gray-100">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {mode === 'ask' ? 'Ask Examples' : `${role} Examples`}
                  </div>
                </div>
                <div className="p-2">
                  {(mode === 'ask' ? [
                    "What's our monthly revenue trend?",
                    "Show me patient demographics breakdown",
                    "Which practitioners are top performers?",
                    "How many no-shows did we have this week?"
                  ] : examplePhrases[role] || []).map((example, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(example)
                        setShowExamples(false)
                        inputRef.current?.focus()
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="px-6 pb-4">
            <div className="text-sm text-gray-500 mb-2">
              {input.length > 3 ? 'Matching commands:' : 'Example commands:'}
            </div>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSubmit(suggestion)}
                  className="block w-full text-left px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>Press <kbd className="px-1 bg-white border rounded">Enter</kbd> to execute</div>
            <div>Press <kbd className="px-1 bg-white border rounded">Esc</kbd> to cancel</div>
          </div>
        </div>
      </div>

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
