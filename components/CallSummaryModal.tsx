'use client'

import { useState, useEffect } from 'react'
import { useCalls, useTimeline, useData } from '@/store'
import { CallRecord } from '@/store/slices/calls'
import { X, Phone, User, Clock, MessageSquare, Calendar, CheckSquare, CreditCard, UserPlus, Shield } from 'lucide-react'
import { 
  rescheduleFromCallPlan, 
  createTaskFromCallPlan, 
  verifyInsuranceFromCallPlan,
  sendPaymentLinkFromCallPlan,
  createPatientFromCallPlan,
  newBookingFromCallPlan
} from '@/services/call-plans'

interface CallSummaryModalProps {
  call: CallRecord
  onClose: () => void
}

export default function CallSummaryModal({ call, onClose }: CallSummaryModalProps) {
  const { executePlan } = useTimeline()
  const { patients } = useData() as any
  const [showPlanPreview, setShowPlanPreview] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<any>(null)

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const patient = call.patientId ? patients.find((p: any) => p.id === call.patientId) : null

  const getIntentIcon = (intent?: string) => {
    switch (intent) {
      case 'reschedule': return <Calendar className="w-5 h-5 text-blue-600" />
      case 'new_booking': return <UserPlus className="w-5 h-5 text-green-600" />
      case 'prescription': return <MessageSquare className="w-5 h-5 text-purple-600" />
      case 'billing': return <CreditCard className="w-5 h-5 text-orange-600" />
      case 'inquiry': return <MessageSquare className="w-5 h-5 text-gray-600" />
      default: return <Phone className="w-5 h-5 text-gray-600" />
    }
  }

  const getIntentColor = (intent?: string) => {
    switch (intent) {
      case 'reschedule': return 'bg-blue-100 text-blue-800'
      case 'new_booking': return 'bg-green-100 text-green-800'
      case 'prescription': return 'bg-purple-100 text-purple-800'
      case 'billing': return 'bg-orange-100 text-orange-800'
      case 'inquiry': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCallDuration = () => {
    if (!call.startTime || !call.endTime) return 'Unknown duration'
    const start = new Date(call.startTime)
    const end = new Date(call.endTime)
    const duration = Math.round((end.getTime() - start.getTime()) / 60000)
    return `${duration} minutes`
  }

  const handleFollowUp = async (type: string) => {
    const context = {
      actor: 'user' as const,
      source: 'call' as const,
      role: 'reception' as const,
      autopilotMode: 'manual' as const,
      call
    }

    let plan
    switch (type) {
      case 'reschedule':
        plan = await rescheduleFromCallPlan(call, context)
        break
      case 'create_task':
        plan = await createTaskFromCallPlan(call, context)
        break
      case 'verify_insurance':
        plan = await verifyInsuranceFromCallPlan(call, context)
        break
      case 'payment_link':
        plan = await sendPaymentLinkFromCallPlan(call, context)
        break
      case 'create_patient':
        plan = await createPatientFromCallPlan(call, context)
        break
      case 'new_booking':
        plan = await newBookingFromCallPlan(call, context)
        break
      default:
        return
    }

    setCurrentPlan(plan)
    setShowPlanPreview(true)
  }

  const executePlanAndClose = async () => {
    if (currentPlan) {
      await executePlan(currentPlan)
      setShowPlanPreview(false)
      setCurrentPlan(null)
      onClose()
    }
  }

  // Get relevant follow-up actions based on call intent and patient status
  const getFollowUpActions = () => {
    const actions = []

    // Primary actions based on intent
    if (call.intent === 'reschedule') {
      actions.push({
        id: 'reschedule',
        label: 'Reschedule + Notify',
        description: 'Move appointment and send confirmation',
        icon: <Calendar className="w-5 h-5" />,
        primary: true,
        color: 'bg-blue-600 hover:bg-blue-700 text-white'
      })
    } else if (call.intent === 'new_booking') {
      actions.push({
        id: 'new_booking',
        label: 'Book Appointment',
        description: 'Schedule and send confirmation',
        icon: <Calendar className="w-5 h-5" />,
        primary: true,
        color: 'bg-green-600 hover:bg-green-700 text-white'
      })
    } else if (call.intent === 'billing') {
      actions.push({
        id: 'payment_link',
        label: 'Send Payment Link',
        description: 'Generate secure payment link',
        icon: <CreditCard className="w-5 h-5" />,
        primary: true,
        color: 'bg-orange-600 hover:bg-orange-700 text-white'
      })
    }

    // Secondary actions
    actions.push({
      id: 'create_task',
      label: 'Create Follow-up Task',
      description: 'Add task for staff to follow up',
      icon: <CheckSquare className="w-5 h-5" />,
      primary: false,
      color: 'bg-gray-600 hover:bg-gray-700 text-white'
    })

    // Patient-specific actions
    if (patient) {
      actions.push({
        id: 'verify_insurance',
        label: 'Verify Insurance',
        description: 'Check coverage and eligibility',
        icon: <Shield className="w-5 h-5" />,
        primary: false,
        color: 'bg-purple-600 hover:bg-purple-700 text-white'
      })
    } else {
      actions.push({
        id: 'create_patient',
        label: 'Create Patient Record',
        description: 'Set up new patient profile',
        icon: <UserPlus className="w-5 h-5" />,
        primary: false,
        color: 'bg-green-600 hover:bg-green-700 text-white'
      })
    }

    return actions
  }

  const followUpActions = getFollowUpActions()

  if (showPlanPreview && currentPlan) {
    return (
      <div 
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowPlanPreview(false)
          }
        }}
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Plan Preview</h2>
            <button 
              onClick={() => setShowPlanPreview(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{currentPlan.title}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  CALL
                </span>
                <span>•</span>
                <span>{currentPlan.steps.length} steps</span>
                <span>•</span>
                <span>~{Math.round(currentPlan.steps.length * 0.8)} minutes</span>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              {currentPlan.steps.map((step: any, index: number) => (
                <div key={step.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{step.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setShowPlanPreview(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={executePlanAndClose}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Execute Plan
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Phone className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Call Summary</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                console.log('Force closing modal')
                onClose()
              }} 
              className="text-red-400 hover:text-red-600 text-xs px-2 py-1 border border-red-200 rounded"
            >
              Force Close
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Call Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Caller</span>
              </div>
              <div className="font-semibold text-gray-900">
                {patient ? patient.name : 'Unknown Caller'}
              </div>
              <div className="text-sm text-gray-600">{call.phone}</div>
              {patient && (
                <div className="text-xs text-blue-600 mt-1">
                  {patient.insurer} • DOB: {patient.dob}
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                {getIntentIcon(call.intent)}
                <span className="text-sm font-medium text-gray-700">Intent</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntentColor(call.intent)}`}>
                  {call.intent?.replace('_', ' ') || 'General inquiry'}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Duration</span>
              </div>
              <div className="font-semibold text-gray-900">{formatCallDuration()}</div>
              <div className="text-sm text-gray-600">
                {new Date(call.startTime).toLocaleTimeString('en-GB', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>

          {/* Call Summary */}
          {call.summary && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Summary</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700">{call.summary}</p>
                {call.keyDetails && (
                  <p className="text-sm text-gray-600 mt-2">{call.keyDetails}</p>
                )}
              </div>
            </div>
          )}

          {/* Follow-up Actions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended Follow-ups</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {followUpActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleFollowUp(action.id)}
                  className={`p-4 rounded-lg border text-left hover:shadow-sm transition-all ${
                    action.primary 
                      ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded ${action.primary ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${action.primary ? 'text-blue-900' : 'text-gray-900'}`}>
                        {action.label}
                        {action.primary && (
                          <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{action.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Transcript Preview (if available) */}
          {call.transcript && call.transcript.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Call Transcript</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="space-y-2 text-sm">
                  {call.transcript.map((line, index) => (
                    <div key={index} className={
                      line.startsWith('Receptionist:') 
                        ? 'text-blue-700 font-medium' 
                        : line.startsWith('Caller:') 
                        ? 'text-gray-700' 
                        : 'text-gray-500 italic'
                    }>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
