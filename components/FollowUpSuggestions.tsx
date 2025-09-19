'use client'

import { useState, useEffect } from 'react'
import { Plan } from '@/types/core'
import { useData, useAutopilot } from '@/store'
import { createPlan } from '@/services/planner'
import { practiceAI } from '@/services/ai'
import { Brain, ChevronRight, X, Calendar, Clock, AlertCircle, TrendingUp, Sparkles } from 'lucide-react'

interface FollowUpSuggestion {
  id: string
  title: string
  description: string
  reasoning: string
  actionPhrase: string
  priority: 'high' | 'medium' | 'low'
  category: 'scheduling' | 'insurance' | 'workflow' | 'patient-care'
}

interface FollowUpSuggestionsProps {
  completedPlan: Plan | null
  isOpen: boolean
  onClose: () => void
  onPlanCreated: (plan: any) => void
}

export default function FollowUpSuggestions({ 
  completedPlan, 
  isOpen, 
  onClose, 
  onPlanCreated 
}: FollowUpSuggestionsProps) {
  const { patients, appointments, invoices } = useData()
  const { role } = useAutopilot()
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [aiSuggestions, setAISuggestions] = useState<FollowUpSuggestion[]>([])

  // Generate AI-powered follow-up suggestions
  useEffect(() => {
    if (!isOpen || !completedPlan) {
      setAISuggestions([])
      return
    }

    const generateAIFollowUps = async () => {
      setIsLoadingSuggestions(true)
      try {
        const aiContext = {
          patients,
          appointments,
          invoices,
          role,
          currentTime: new Date().toISOString()
        }

        const suggestions = await practiceAI.generateFollowUps(completedPlan, aiContext)
        setAISuggestions(suggestions)
      } catch (error) {
        console.error('Failed to generate AI follow-ups:', error)
        // Fallback to hardcoded suggestions
        setAISuggestions(generateHardcodedFollowUps())
      } finally {
        setIsLoadingSuggestions(false)
      }
    }

    generateAIFollowUps()
  }, [completedPlan, isOpen])

  if (!isOpen || !completedPlan) return null

  // Fallback hardcoded suggestions (keeping as backup)
  const generateHardcodedFollowUps = (): FollowUpSuggestion[] => {
    const suggestions: FollowUpSuggestion[] = []

    // Clinical wrap-up follow-ups
    if (completedPlan.title.includes('Clinical wrap-up')) {
      const patientName = completedPlan.title.match(/for (.+?)$/)?.[1] || 'Mrs Smith'
      const patient = patients.find((p: any) => p.name === patientName)
      
      if (patient) {
        suggestions.push({
          id: 'book-followup',
          title: `Book ${patient.name}'s 6-week review now?`,
          description: `Perfect timing while the consultation is fresh`,
          reasoning: `You just completed their wrap-up. Booking the follow-up now ensures continuity of care and prevents it being forgotten.`,
          actionPhrase: `schedule ${patient.name} for next Tuesday at 2pm`,
          priority: 'high',
          category: 'scheduling'
        })

        // Insurance expiry check
        if (patient.insuranceExpiry && new Date(patient.insuranceExpiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) {
          suggestions.push({
            id: 'insurance-expiry',
            title: `${patient.name}'s insurance expires soon`,
            description: `${patient.insurer} coverage ends ${patient.insuranceExpiry}`,
            reasoning: `Proactive insurance verification prevents payment delays and ensures uninterrupted care.`,
            actionPhrase: `verify coverage for ${patient.name}`,
            priority: 'medium',
            category: 'insurance'
          })
        }

        // Similar patients needing follow-ups
        const similarPatients = patients.filter((p: any) => 
          p.id !== patient.id && 
          p.riskFactors?.some((rf: string) => patient.riskFactors?.includes(rf))
        ).slice(0, 2)

        if (similarPatients.length > 0) {
          suggestions.push({
            id: 'similar-patients',
            title: `${similarPatients.length} patients with similar conditions need follow-ups`,
            description: `${similarPatients.map((p: any) => p.name).join(', ')} have similar risk factors`,
            reasoning: `Batch scheduling for similar conditions improves efficiency and ensures consistent care protocols.`,
            actionPhrase: `schedule follow-ups for similar patients`,
            priority: 'low',
            category: 'workflow'
          })
        }
      }
    }

    // Chase batch follow-ups
    if (completedPlan.title.includes('chase batch')) {
      suggestions.push({
        id: 'payment-plan',
        title: `Set up payment plans for struggling patients?`,
        description: `2 patients have multiple overdue invoices`,
        reasoning: `Payment plans improve collection rates and maintain positive patient relationships.`,
        actionPhrase: `setup payment plans for overdue accounts`,
        priority: 'medium',
        category: 'workflow'
      })

      suggestions.push({
        id: 'preventive-reminders',
        title: `Enable automated payment reminders?`,
        description: `Prevent future overdue invoices with smart reminders`,
        reasoning: `Proactive reminders reduce overdue rates by 40% according to practice data.`,
        actionPhrase: `setup reminders`,
        priority: 'high',
        category: 'workflow'
      })
    }

    // Survey campaign follow-ups
    if (completedPlan.title.includes('survey campaign')) {
      suggestions.push({
        id: 'response-tracking',
        title: `Set up survey response tracking?`,
        description: `Monitor satisfaction scores and identify trends`,
        reasoning: `Real-time tracking helps identify issues early and improve patient experience.`,
        actionPhrase: `setup survey tracking dashboard`,
        priority: 'medium',
        category: 'workflow'
      })
    }

    // Schedule optimization follow-ups
    if (completedPlan.title.includes('scheduling')) {
      suggestions.push({
        id: 'no-show-prevention',
        title: `Address high no-show slots?`,
        description: `Monday 9am appointments have 15% no-show rate`,
        reasoning: `Targeted interventions for high-risk slots can improve utilization by 20%.`,
        actionPhrase: `optimize high risk appointment slots`,
        priority: 'high',
        category: 'scheduling'
      })
    }

    return suggestions.filter(s => !dismissedIds.has(s.id))
  }

  // Use AI suggestions if available, otherwise fallback to hardcoded
  const suggestions = aiSuggestions.length > 0 
    ? aiSuggestions.filter(s => !dismissedIds.has(s.id))
    : generateHardcodedFollowUps().filter(s => !dismissedIds.has(s.id))

  const handleSuggestionClick = async (suggestion: FollowUpSuggestion) => {
    try {
      const plan = await createPlan(suggestion.actionPhrase, {
        actor: 'user',
        source: 'kpi',
        role: 'clinician',
        autopilotMode: 'manual'
      })

      if (plan) {
        onPlanCreated(plan)
        onClose()
      }
    } catch (error) {
      console.error('Failed to create follow-up plan:', error)
    }
  }

  const handleDismiss = (suggestionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDismissedIds(prev => {
      const newSet = new Set(prev)
      newSet.add(suggestionId)
      return newSet
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 text-red-900'
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-900'
      case 'low': return 'border-blue-200 bg-blue-50 text-blue-900'
      default: return 'border-gray-200 bg-gray-50 text-gray-900'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'scheduling': return <Calendar className="w-4 h-4" />
      case 'insurance': return <AlertCircle className="w-4 h-4" />
      case 'workflow': return <TrendingUp className="w-4 h-4" />
      case 'patient-care': return <Clock className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                {isLoadingSuggestions ? (
                  <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                ) : aiSuggestions.length > 0 ? (
                  <div className="flex items-center">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <Sparkles className="w-3 h-3 text-blue-600 -ml-1" />
                  </div>
                ) : (
                  <Brain className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {isLoadingSuggestions ? 'Analyzing...' : 'Great work! What\'s next?'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isLoadingSuggestions 
                    ? 'AI is generating personalized suggestions...'
                    : aiSuggestions.length > 0 
                      ? 'AI-generated follow-ups based on your completed task'
                      : 'I\'ve spotted some smart follow-ups for you'
                  }
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Completed Plan Summary */}
        <div className="px-6 py-4 bg-green-50 border-b border-green-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              ✅
            </div>
            <div>
              <p className="font-medium text-green-900">Just completed: {completedPlan.title}</p>
              <p className="text-sm text-green-700">Execution time: ~{completedPlan.steps.length * 1.5}s • {completedPlan.steps.length} steps</p>
            </div>
          </div>
        </div>

        {/* Follow-up Suggestions */}
        <div className="px-6 py-4">
          {isLoadingSuggestions ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
              </div>
              <p className="text-gray-600 animate-pulse">AI is analyzing your completed task...</p>
              <p className="text-sm text-gray-500 mt-2">Generating personalized follow-ups</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Brain className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">All caught up! I don't see any immediate follow-ups needed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <h3 className="font-medium text-gray-900">
                  {aiSuggestions.length > 0 ? 'AI-recommended follow-ups:' : 'Recommended follow-ups:'}
                </h3>
                {aiSuggestions.length > 0 && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Generated</span>
                  </div>
                )}
              </div>
              
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`relative p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getPriorityColor(suggestion.priority)}`}
                >
                  <button
                    onClick={(e) => handleDismiss(suggestion.id, e)}
                    className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getCategoryIcon(suggestion.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                          suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {suggestion.priority}
                        </span>
                      </div>
                      <p className="text-sm mt-1 opacity-90">
                        {suggestion.description}
                      </p>
                      <div className="mt-3 p-3 bg-white bg-opacity-70 rounded-md">
                        <p className="text-xs opacity-75 italic">
                          💡 {suggestion.reasoning}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center text-sm opacity-90">
                        <span>Click to create plan</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {aiSuggestions.length > 0 
                ? 'These suggestions were generated by AI based on your specific task and practice data'
                : 'These suggestions are based on your completed task and practice patterns'
              }
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-white transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
