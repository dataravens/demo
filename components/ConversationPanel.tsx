'use client'

import { useState, useEffect, useRef } from 'react'
import { useStore, useRole } from '@/store'
import { createPlan } from '@/services/planner'
import { askQuestion } from '@/services/ask-engine'
import { conversationalAI } from '@/services/conversational-ai'
import { X, Send, Sparkles, MessageSquare, Bot, User, Lightbulb, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react'
import { ConversationMessage, AIResponseType, ConversationAction, Plan } from '@/types/core'
// Using regular HTML elements instead of UI library components
import AskResponse from '@/components/AskResponse'
import ClarificationModal from '@/components/ClarificationModal'
// import { toast } from 'sonner' // Not available, using console.log for now
import { v4 as uuidv4 } from 'uuid'
import { usePathname } from 'next/navigation'

interface ConversationPanelProps {
  isOpen: boolean
  onClose: () => void
  onPlanCreated: (plan: Plan) => void
}

export default function ConversationPanel({ isOpen, onClose, onPlanCreated }: ConversationPanelProps) {
  const [input, setInput] = useState('')
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [mode, setMode] = useState<'do' | 'ask'>('do')
  const [clarificationPlan, setClarificationPlan] = useState<Plan | null>(null)
  const [showClarificationModal, setShowClarificationModal] = useState(false)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [sessionId, setSessionId] = useState<string>('')

  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { patients, appointments, invoices } = useStore()
  const { currentRole, hasPermission } = useRole()
  const pathname = usePathname()

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      const currentSessionId = sessionStorage.getItem('conversationSessionId') || uuidv4()
      sessionStorage.setItem('conversationSessionId', currentSessionId)
      setSessionId(currentSessionId)

      // Initialize or retrieve conversation context
      const context = conversationalAI.getOrCreateConversation(currentSessionId, currentRole, pathname)
      setMessages(context.messages)
      conversationalAI.updateUserContext(currentSessionId, { role: currentRole, currentPage: pathname })

      // If no messages, send a welcome message
      if (context.messages.length === 0) {
        sendAIWelcomeMessage(currentSessionId)
      }
    }
  }, [isOpen, currentRole, pathname])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendAIWelcomeMessage = async (sId: string) => {
    setIsAIThinking(true)
    const welcomeMessage: ConversationMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: `Hello! I'm your AI assistant. How can I help you today as a ${currentRole}?`,
      timestamp: new Date(),
      type: 'information',
      suggestions: getWelcomeSuggestions()
    }
    conversationalAI.addMessage(sId, welcomeMessage)
    setMessages(conversationalAI.getConversationMessages(sId))
    setIsAIThinking(false)
  }

  const getWelcomeSuggestions = () => {
    if (currentRole === 'reception') {
      return [
        "Schedule Sarah Jones for Thu 2:30 and notify via text",
        "Set up payment plan for Amelia £72.50 x3 months",
        "Verify insurance for all tomorrow's appointments"
      ]
    } else if (currentRole === 'clinician') {
      return [
        "Clinical wrap-up for Mrs Johnson - referral to cardiology",
        "Draft urgent referral to Dr Martinez for chest pain",
        "Update treatment plan and schedule 2-week review"
      ]
    } else if (currentRole === 'manager') {
      return [
        "Generate revenue report with insurance breakdown",
        "Review staff utilization and optimize next week's schedule",
        "Chase all overdue accounts >£100 with payment plans"
      ]
    }
    return ["What can I help you with today?"]
  }

  const handleSendMessage = async (command: string) => {
    if (!command.trim()) return

    const userMessage: ConversationMessage = {
      id: uuidv4(),
      role: 'user',
      content: command,
      timestamp: new Date(),
    }
    conversationalAI.addMessage(sessionId, userMessage)
    setMessages(conversationalAI.getConversationMessages(sessionId))
    setInput('')
    setIsAIThinking(true)

    try {
      let aiResponse: ConversationMessage | null = null
      let plan: Plan | null = null

      if (mode === 'ask') {
        const askResult = await askQuestion(command, { patients, appointments, invoices, role: currentRole })
        aiResponse = {
          id: uuidv4(),
          role: 'assistant',
          content: `Here's what I found for "${command}":`,
          timestamp: new Date(),
          type: 'information',
          data: askResult,
        }
      } else { // 'do' mode
        plan = await createPlan(command, {
          actor: 'user',
          source: 'cmdk',
          role: currentRole,
          autopilotMode: 'manual',
          patients,
          appointments,
          invoices
        } as any)

        if (plan?.needsClarification) {
          setClarificationPlan(plan)
          setShowClarificationModal(true)
          aiResponse = {
            id: uuidv4(),
            role: 'assistant',
            content: `I need a bit more information to complete this task: "${command}". Can you clarify?`,
            timestamp: new Date(),
            type: 'clarification',
            relatedCommand: command,
            planId: plan.id,
          }
        } else if (plan) {
          aiResponse = {
            id: uuidv4(),
            role: 'assistant',
            content: `I've drafted a plan for "${command}". Please review before executing.`,
            timestamp: new Date(),
            type: 'confirmation',
            relatedCommand: command,
            planId: plan.id,
            actions: [
              { id: 'review', label: 'Review Plan', type: 'primary', action: 'show_data', payload: { planId: plan.id } },
              { id: 'execute', label: 'Execute Now', type: 'secondary', action: 'execute_plan', payload: { planId: plan.id } },
              { id: 'modify', label: 'Modify Command', type: 'secondary', action: 'modify_command' },
              { id: 'cancel', label: 'Cancel', type: 'danger', action: 'dismiss' }
            ]
          }
          // Store the plan for later retrieval
          aiResponse.data = plan
        } else {
          aiResponse = await conversationalAI.generateAIResponse(sessionId, command, plan)
        }
      }

      if (aiResponse) {
        conversationalAI.addMessage(sessionId, aiResponse)
        setMessages(conversationalAI.getConversationMessages(sessionId))
      }

    } catch (error: any) {
      console.error('Error processing command:', error)
      const errorMessage: ConversationMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `I encountered an error: ${error.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
        type: 'error',
        relatedCommand: command,
      }
      conversationalAI.addMessage(sessionId, errorMessage)
      setMessages(conversationalAI.getConversationMessages(sessionId))
      console.error(`Error: ${error.message || 'Failed to process command'}`)
    } finally {
      setIsAIThinking(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    handleSendMessage(suggestion)
  }

  const handleActionClick = (action: ConversationAction, message: ConversationMessage) => {
    if (action.action === 'execute_plan' && message.data) {
      onPlanCreated(message.data as Plan)
      onClose()
    } else if (action.action === 'show_data' && message.data) {
      onPlanCreated(message.data as Plan)
      onClose()
    } else if (action.action === 'modify_command' && message.relatedCommand) {
      setInput(message.relatedCommand)
    } else if (action.action === 'dismiss') {
      console.log("Action dismissed.")
    }
  }

  const getMessageIcon = (type?: AIResponseType) => {
    switch (type) {
      case 'clarification': return <AlertCircle className="w-4 h-4 text-amber-500" />
      case 'suggestion': return <Lightbulb className="w-4 h-4 text-purple-500" />
      case 'confirmation': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'information': return <Info className="w-4 h-4 text-blue-500" />
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return <Bot className="w-4 h-4 text-gray-500" />
    }
  }

  const getMessageBorderColor = (type?: AIResponseType) => {
    switch (type) {
      case 'clarification': return 'border-l-amber-400'
      case 'suggestion': return 'border-l-purple-400'
      case 'confirmation': return 'border-l-green-400'
      case 'information': return 'border-l-blue-400'
      case 'error': return 'border-l-red-400'
      case 'success': return 'border-l-green-400'
      default: return 'border-l-gray-300'
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
          </div>
          <div className="flex items-center space-x-2">
            {/* Mode Toggle */}
            <div className="flex items-center bg-white rounded-full p-0.5 border border-gray-200">
              <button
                onClick={() => setMode('do')}
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                  mode === 'do'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>DO</span>
              </button>
              <button
                onClick={() => setMode('ask')}
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                  mode === 'ask'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                <span>ASK</span>
              </button>
            </div>
            <button 
              onClick={onClose} 
              className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 h-[calc(100vh-140px)] overflow-y-auto">
          <div className="p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-lg p-3'
                      : `bg-gray-50 text-gray-800 rounded-lg p-3 border-l-4 ${getMessageBorderColor(msg.type)}`
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2">
                      {getMessageIcon(msg.type)}
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {msg.type || 'Assistant'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  
                  <p className="text-sm leading-relaxed">{msg.content}</p>

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.suggestions.map((s, i) => (
                        <span
                          key={i}
                          className="cursor-pointer hover:bg-blue-100 transition-colors text-blue-700 text-xs px-2 py-1 bg-gray-100 rounded-full border"
                          onClick={() => handleSuggestionClick(s)}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.actions.map((action) => (
                        <button
                          key={action.id}
                          className={`text-xs px-3 py-1 rounded transition-colors ${
                            action.type === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                            action.type === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
                            'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300'
                          }`}
                          onClick={() => handleActionClick(action, msg)}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.data && msg.type === 'information' && (
                    <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
                      <AskResponse response={msg.data} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isAIThinking && (
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-gray-50 text-gray-800 rounded-lg p-3 border-l-4 border-l-gray-300">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bot className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-500 uppercase">Thinking</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
            </div>
          </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
              placeholder={`Type a ${mode === 'do' ? 'command' : 'question'}...`}
              className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isAIThinking}
            />
            <button 
              onClick={() => handleSendMessage(input)} 
              disabled={isAIThinking || !input.trim()}
              className={`h-10 w-10 flex items-center justify-center rounded-md transition-colors ${
                isAIThinking || !input.trim() 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Press Enter to send • {currentRole} mode
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
          onSubmit={(answers) => {
            setShowClarificationModal(false)
            setClarificationPlan(null)
            console.log("Clarification received. Please re-enter your command with more details.")
          }}
        />
      </div>
    </>
  )
}
