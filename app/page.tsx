'use client'

import { useState } from 'react'
import { useData, useAutopilot, useRole } from '@/store'
import AISuggestionsPanel from '@/components/AISuggestionsPanel'
import PlanPreviewDrawer from '@/components/PlanPreviewDrawer'
import BackgroundAIWidget from '@/components/BackgroundAIWidget'
import TimelineModal from '@/components/TimelineModal'
import ProofCounters from '@/components/ProofCounters'

export default function ControlRoom() {
  const { patients, appointments, invoices } = useData()
  const { role } = useAutopilot()
  const { currentRole, permissions } = useRole()
  const [currentPlan, setCurrentPlan] = useState(null)
  const [planPreviewOpen, setPlanPreviewOpen] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(false)

  const handlePlanCreated = (plan: any) => {
    setCurrentPlan(plan)
    setPlanPreviewOpen(true)
  }

  // Get today's appointments only
  const today = new Date()
  const todayString = today.toISOString().split('T')[0]
  const todaysAppointments = appointments.filter((apt: any) => {
    if (!apt.start) return false
    const aptDate = new Date(apt.start).toISOString().split('T')[0]
    return aptDate === todayString
  })
  
  const nextAppointment = todaysAppointments[0] || appointments[0]
  const nextPatient = patients.find((p: any) => p.id === nextAppointment?.patientId)
  const overdueInvoices = invoices.filter((inv: any) => inv.status === 'Overdue')

  // Generate Dentally-style financial overview
  const getFinancialOverview = () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // Mock financial data with AI insights
    return [
      {
        period: 'TODAY',
        amount: '£1,240.00',
        appointments: `${Math.max(todaysAppointments.length, 12)} appointments`,
        insight: '18% above Tuesday average'
      },
      {
        period: 'YESTERDAY', 
        amount: '£890.00',
        appointments: '6 appointments',
        insight: 'Strong Monday performance'
      },
      {
        period: 'LAST 7 DAYS',
        amount: '£8,450.00', 
        appointments: '42 appointments',
        insight: '12% growth vs last week'
      },
      {
        period: 'LAST 30 DAYS',
        amount: '£28,950.00',
        appointments: '156 appointments', 
        insight: 'On track for monthly target'
      },
      {
        period: 'LAST 90 DAYS',
        amount: '£84,200.00',
        appointments: '445 appointments',
        insight: 'Best quarter this year'
      }
    ]
  }

  // Generate smart operational stats
  const getOperationalStats = () => {
    return [
      {
        title: 'Appointments',
        value: Math.max(todaysAppointments.length, 12).toString(),
        subtitle: 'scheduled today',
        color: 'blue',
        aiSuggestion: todaysAppointments.length === 0 ? 'All caught up! Review tomorrow\'s schedule?' : null
      },
      {
        title: 'Accounts',
        value: `£${overdueInvoices.reduce((sum: number, inv: any) => sum + inv.amount, 0).toFixed(0)}`,
        subtitle: 'outstanding',
        color: overdueInvoices.length > 0 ? 'red' : 'green',
        aiSuggestion: overdueInvoices.length > 0 ? 'Send payment reminders?' : null
      },
      {
        title: 'Patients',
        value: patients.length.toString(),
        subtitle: 'active',
        color: 'green'
      },
      {
        title: 'Treatment Plans', 
        value: '12',
        subtitle: 'in progress',
        color: 'purple',
        aiSuggestion: 'Review overdue treatment plans?'
      }
    ]
  }

  const financialData = permissions.showRevenueWidgets ? getFinancialOverview() : []
  const operationalStats = getOperationalStats()

  return (
    <div className="p-6 space-y-6">
      {/* Proof Counters */}
      <ProofCounters />
      
      {/* AI Suggestions Panel */}
      <AISuggestionsPanel onPlanCreated={handlePlanCreated} />

      {/* Financial Overview Cards */}
      {financialData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Financial Overview</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View detailed report →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {financialData.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {item.period}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {item.amount}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {item.appointments}
                </div>
                <div className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  {item.insight}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Operational Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Practice Overview</h2>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Healthy</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <span>Attention</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span>Critical</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {operationalStats.map((stat, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">{stat.title}</h3>
                <div className={`w-3 h-3 rounded-full ${
                  stat.color === 'red' ? 'bg-red-500' :
                  stat.color === 'blue' ? 'bg-blue-500' :
                  stat.color === 'green' ? 'bg-green-500' :
                  stat.color === 'purple' ? 'bg-purple-500' : 'bg-gray-400'
                }`} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {stat.subtitle}
              </div>
              {stat.aiSuggestion && (
                <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  </div>
                  <button className="text-xs text-blue-700 hover:text-blue-800 font-medium flex-1 text-left">
                    {stat.aiSuggestion}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Two Column Layout: Schedule & Background AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments Status */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
            <p className="text-sm text-gray-600 mt-1">
              {todaysAppointments.length === 0 ? 'All appointments completed' : `${Math.max(todaysAppointments.length, 12)} appointments remaining`}
            </p>
          </div>
          <div className="flex items-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-600 font-medium">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-gray-600 font-medium">Scheduled</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-gray-600 font-medium">DNA</span>
            </div>
          </div>
        </div>
        
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎉</span>
            </div>
            <div className="text-lg font-medium text-gray-900 mb-2">All done for today!</div>
            <div className="text-sm text-gray-600 mb-6">Great job staying on top of your schedule</div>
            <div className="flex items-center justify-center space-x-2 p-3 bg-blue-50 rounded-lg max-w-md mx-auto">
              <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              </div>
              <button className="text-sm text-blue-700 hover:text-blue-800 font-medium">
                Review tomorrow's schedule or catch up on admin tasks?
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {todaysAppointments.slice(0, 5).map((appointment: any, index: number) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    appointment.status === 'completed' ? 'bg-green-500' : 
                    appointment.status === 'cancelled' ? 'bg-orange-500' :
                    appointment.status === 'dna' ? 'bg-red-500' : 'bg-blue-500'
                  }`}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {patients.find((p: any) => p.id === appointment.patientId)?.name || 'Unknown Patient'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(appointment.start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} • {appointment.clinician}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'cancelled' ? 'bg-orange-100 text-orange-800' :
                    appointment.status === 'dna' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {appointment.status || 'Scheduled'}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {todaysAppointments.length > 5 && (
              <div className="text-center pt-4 border-t border-gray-100">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View all {Math.max(todaysAppointments.length, 12)} appointments →
                </button>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Background AI Widget */}
        <BackgroundAIWidget />
      </div>

      {/* AI Action Trail Preview */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">AI Action Trail</h2>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          </div>
          <button 
            onClick={() => setTimelineOpen(true)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View full trail →
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">AUTO</span>
                  <span className="font-medium text-gray-900">Sent appointment reminder to Sarah Jones</span>
                </div>
                <div className="text-sm text-gray-600">2 min ago</div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">PLAN</span>
                  <span className="font-medium text-gray-900">Generated invoice for Amelia Ali</span>
                </div>
                <div className="text-sm text-gray-600">1 hour ago</div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="text-center pt-4 border-t border-gray-100">
            <button 
              onClick={() => setTimelineOpen(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all AI actions →
            </button>
          </div>
        </div>
      </div>

      {/* Plan Preview for AI Suggestions */}
      <PlanPreviewDrawer
        plan={currentPlan}
        isOpen={planPreviewOpen}
        onClose={() => {
          setPlanPreviewOpen(false)
          setCurrentPlan(null)
        }}
        onShowFollowUps={(plan) => {
          // Note: Follow-ups from Control Room suggestions are handled by main layout
          console.log('Plan completed from Control Room:', plan.title)
        }}
      />

      {/* Timeline Modal */}
      <TimelineModal
        isOpen={timelineOpen}
        onClose={() => setTimelineOpen(false)}
      />
    </div>
  )
}
