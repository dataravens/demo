'use client'

import { useState } from 'react'
import { useCalls, useData } from '@/store'
import { Phone, PhoneCall, Square, Mic, MicOff } from 'lucide-react'

export default function AICallHeader() {
  const { activeCall, startCall, endCall, updateCall } = useCalls()
  const { patients } = useData() as any
  const [showCallSim, setShowCallSim] = useState(false)

  // Demo: simulate incoming call
  const simulateIncomingCall = () => {
    const demoPhones = [
      { phone: '+44 20 7946 0123', patientId: 'p1' }, // Amelia Ali
      { phone: '+44 20 7946 0456', patientId: 'p2' }, // Sarah Jones  
      { phone: '+44 20 7946 0789', patientId: 'p3' }, // Mrs Smith
      { phone: '+44 20 7946 9999', patientId: undefined }, // Unknown caller
    ]
    const randomCall = demoPhones[Math.floor(Math.random() * demoPhones.length)]
    startCall(randomCall.phone, randomCall.patientId)
    setShowCallSim(false)
  }

  const handleStartNotes = () => {
    if (activeCall) {
      updateCall({ mode: 'capture' })
    }
  }

  const handleEndCall = () => {
    if (activeCall) {
      // Demo: generate fake call summary
      const intents = ['reschedule', 'new_booking', 'prescription', 'billing', 'inquiry'] as const
      const summaries = {
        reschedule: 'Patient wants to move Tuesday appointment to next week due to work conflict',
        new_booking: 'New patient requesting initial consultation for diabetes management',
        prescription: 'Patient reporting side effects from current medication, needs review',
        billing: 'Query about outstanding invoice and payment options',
        inquiry: 'General inquiry about services and availability'
      }
      
      // Generate contextual transcripts based on intent
      const transcripts = {
        reschedule: [
          'Receptionist: Good morning, how can I help you today?',
          'Caller: Hi, it\'s Sarah Jones. I need to reschedule my appointment for Tuesday.',
          'Receptionist: Of course, let me pull up your appointment. I can see you\'re booked with Dr Patel at 2:30pm.',
          'Caller: Yes, that\'s right. I have a work conflict that came up. Could we move it to next week?',
          'Receptionist: Let me check Dr Patel\'s availability... I have Thursday the 19th at 2:30pm or Friday the 20th at 10am.',
          'Caller: Thursday at 2:30 would be perfect.',
          'Receptionist: Great! I\'ll move your appointment to Thursday September 19th at 2:30pm. I\'ll send you a confirmation SMS.',
          'Caller: Thank you so much, that\'s really helpful.',
          'Receptionist: You\'re very welcome. Is there anything else I can help with today?',
          'Caller: No, that\'s everything. Have a great day!',
          'Receptionist: You too, see you next Thursday!'
        ],
        new_booking: [
          'Receptionist: Good morning, how can I help you today?',
          'Caller: Hi, I\'d like to book an appointment please. I\'m a new patient.',
          'Receptionist: Of course! May I take your name and date of birth?',
          'Caller: It\'s Michael Thompson, date of birth 15th March 1985.',
          'Receptionist: Thank you Michael. What type of appointment are you looking for?',
          'Caller: I need an initial consultation. My GP referred me for diabetes management.',
          'Receptionist: I can book you with Dr Patel who specializes in diabetes care. I have availability next Tuesday at 3pm or Wednesday at 10am.',
          'Caller: Tuesday at 3pm works well for me.',
          'Receptionist: Perfect! I\'ll book that for you. Can I take a contact number and confirm your address?',
          'Caller: Yes, it\'s 07789 123456, and I live at 42 Oak Street, London SW1A 2BB.',
          'Receptionist: Excellent. I\'ll send you a confirmation with our address and parking information.',
          'Caller: That\'s great, thank you very much.',
          'Receptionist: You\'re welcome! We look forward to seeing you next Tuesday.'
        ],
        prescription: [
          'Receptionist: Good morning, how can I help you today?',
          'Caller: Hello, it\'s Mrs Smith. I\'m having some issues with my new medication.',
          'Receptionist: I\'m sorry to hear that. What kind of issues are you experiencing?',
          'Caller: I\'ve been getting quite dizzy since I started the new blood pressure tablets.',
          'Receptionist: That doesn\'t sound pleasant. When did you start taking them?',
          'Caller: About a week ago. Dr Patel prescribed them at my last appointment.',
          'Receptionist: I think it would be best if Dr Patel reviews this with you. Would you like me to arrange a call back or book an appointment?',
          'Caller: A call back would be good if possible.',
          'Receptionist: I\'ll ask Dr Patel to call you this afternoon. Is your number still ending in 789?',
          'Caller: Yes, that\'s right.',
          'Receptionist: Perfect. In the meantime, do continue taking the medication unless Dr Patel advises otherwise.',
          'Caller: Okay, thank you for your help.',
          'Receptionist: You\'re welcome. Dr Patel should call you between 2 and 4pm today.'
        ],
        billing: [
          'Receptionist: Good morning, how can I help you today?',
          'Caller: Hi, I received an invoice and wanted to ask about payment options.',
          'Receptionist: Of course! May I take your name please?',
          'Caller: It\'s Amelia Ali.',
          'Receptionist: Thank you Amelia. I can see your recent invoice for £145. What would you like to know?',
          'Caller: I was wondering if I could pay in installments? Money\'s a bit tight this month.',
          'Receptionist: Absolutely, we can arrange a payment plan. Would paying half now and half next month work for you?',
          'Caller: That would be perfect, thank you.',
          'Receptionist: No problem at all. I can send you a secure payment link for the first £72.50 now.',
          'Caller: That\'s great. Will you send it by text?',
          'Receptionist: Yes, I\'ll send it to your mobile ending in 123 in just a moment.',
          'Caller: Brilliant, thank you so much for being flexible.',
          'Receptionist: You\'re very welcome. We\'re always happy to help our patients.'
        ],
        inquiry: [
          'Receptionist: Good morning, how can I help you today?',
          'Caller: Hi, I\'m calling to ask about your services. Do you treat diabetes patients?',
          'Receptionist: Yes, we do! Dr Patel specializes in diabetes management and we see many diabetic patients.',
          'Caller: That\'s great. What does an initial consultation involve?',
          'Receptionist: The first appointment is usually about 30 minutes. Dr Patel will review your medical history, current medications, and discuss a management plan.',
          'Caller: And what are your consultation fees?',
          'Receptionist: Our initial consultation is £120, and follow-up appointments are £80.',
          'Caller: Do you accept Bupa insurance?',
          'Receptionist: Yes, we work with most major insurers including Bupa. We can check your coverage when you book.',
          'Caller: Perfect. What\'s your availability like?',
          'Receptionist: We usually have appointments available within a week. Would you like me to check some specific times for you?',
          'Caller: Not right now, but I\'ll call back to book soon. Thank you for the information.',
          'Receptionist: You\'re very welcome! Feel free to call anytime.'
        ]
      }
      
      const intent = intents[Math.floor(Math.random() * intents.length)]
      const patientName = activeCall.patientId 
        ? patients.find((p: any) => p.id === activeCall.patientId)?.name 
        : undefined

      endCall({
        intent,
        summary: summaries[intent],
        keyDetails: `Call duration: ${Math.floor(Math.random() * 8) + 2} minutes`,
        patientName,
        transcript: transcripts[intent]
      })
    }
  }

  // Don't show anything if no active call and not simulating
  if (!activeCall && !showCallSim) {
    return (
      <button
        onClick={() => setShowCallSim(true)}
        className="fixed top-4 right-4 px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 shadow-lg z-50 flex items-center"
      >
        <Phone className="w-4 h-4 mr-2" />
        Simulate Call
      </button>
    )
  }

  // Call simulation panel
  if (showCallSim) {
    return (
      <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-80">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Simulate Incoming Call</h3>
          <button 
            onClick={() => setShowCallSim(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Demo: Simulate an incoming call to test the AI call assistant
        </p>
        <div className="flex space-x-2">
          <button
            onClick={simulateIncomingCall}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 flex items-center justify-center"
          >
            <PhoneCall className="w-4 h-4 mr-2" />
            Incoming Call
          </button>
        </div>
      </div>
    )
  }

  // Active call header
  const patient = activeCall?.patientId 
    ? patients.find((p: any) => p.id === activeCall.patientId) 
    : null

  return (
    <div className="bg-blue-600 text-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <PhoneCall className="w-5 h-5" />
            <span className="font-medium">
              Active Call - {patient?.name || 'Unknown Caller'}
            </span>
          </div>
          
          <div className="text-sm opacity-90">
            {activeCall?.phone}
          </div>
          
          {activeCall?.mode === 'capture' && (
            <div className="flex items-center space-x-2 text-sm">
              <Mic className="w-4 h-4" />
              <span>AI notes active</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {activeCall?.mode !== 'capture' ? (
            <button
              onClick={handleStartNotes}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md text-sm font-medium transition-colors flex items-center"
            >
              <Mic className="w-4 h-4 mr-2" />
              Start AI Notes
            </button>
          ) : (
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex space-x-1">
                <div className="w-1 h-4 bg-white/60 rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-4 bg-white/60 rounded animate-pulse" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1 h-4 bg-white/60 rounded animate-pulse" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="opacity-90">Taking notes...</span>
            </div>
          )}

          <div className="text-sm opacity-75">
            With patient consent, we'll summarise and prepare follow-ups (demo)
          </div>

          <button
            onClick={handleEndCall}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors flex items-center"
          >
            <Square className="w-4 h-4 mr-2" />
            End Call
          </button>
        </div>
      </div>
    </div>
  )
}
