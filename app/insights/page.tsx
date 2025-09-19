'use client'

import { useState } from 'react'
import { createPlan } from '@/services/planner'
import { useAutopilot } from '@/store'
import PlanPreviewDrawer from '@/components/PlanPreviewDrawer'
import AskPanel from '@/components/AskPanel'

export default function Insights() {
  const { role, autopilotMode } = useAutopilot()
  const [currentPlan, setCurrentPlan] = useState(null)
  const [planPreviewOpen, setPlanPreviewOpen] = useState(false)

  const handleKpiAction = async (phrase: string) => {
    try {
      const plan = await createPlan(phrase, { 
        actor: 'user', 
        source: 'kpi',
        role,
        autopilotMode 
      })
      
      if (plan) {
        setCurrentPlan(plan)
        setPlanPreviewOpen(true)
      }
    } catch (error) {
      console.error('Failed to create plan from KPI:', error)
    }
  }

  const kpis = [
    {
      title: 'Claims aging (>60d)',
      value: '9 claims',
      asOf: 'as of today',
      status: 'alert' as const,
      delta: '+3 since last week',
      actions: [
        { label: 'Prepare chase batch', action: () => handleKpiAction('prepare chase batch') }
      ]
    },
    {
      title: 'Appointment utilization',
      value: '85%',
      asOf: 'last 7 days',
      status: 'ok' as const,
      delta: '+2% vs last week',
      actions: [
        { label: 'Optimize schedule', action: () => handleKpiAction('optimize schedule') }
      ]
    },
    {
      title: 'Revenue per patient',
      value: '£320',
      asOf: 'this month',
      status: 'warn' as const,
      delta: '-5% vs target',
      actions: [
        { label: 'Review pricing', action: () => handleKpiAction('review pricing') }
      ]
    },
    {
      title: 'Patient satisfaction',
      value: '4.8/5',
      asOf: 'last 30 reviews',
      status: 'ok' as const,
      delta: '+0.2 improvement',
      actions: [
        { label: 'Send more surveys', action: () => handleKpiAction('send more surveys') }
      ]
    },
    {
      title: 'No-show rate',
      value: '8%',
      asOf: 'last 30 days',
      status: 'warn' as const,
      delta: '+1% vs last month',
      actions: [
        { label: 'Setup reminders', action: () => handleKpiAction('setup reminders') }
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'alert': return 'border-red-200 bg-red-50'
      case 'warn': return 'border-yellow-200 bg-yellow-50'
      case 'ok': return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-white'
    }
  }

  const getValueColor = (status: string) => {
    switch (status) {
      case 'alert': return 'text-red-900'
      case 'warn': return 'text-yellow-900'
      case 'ok': return 'text-green-900'
      default: return 'text-gray-900'
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            Export Report
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
            Customize Dashboard
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className={`p-6 border-2 rounded-lg ${getStatusColor(kpi.status)}`}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{kpi.title}</h3>
              <div className="text-xs text-gray-500">{kpi.asOf}</div>
            </div>
            
            <div className="mb-3">
              <div className={`text-2xl font-bold ${getValueColor(kpi.status)}`}>
                {kpi.value}
              </div>
              {kpi.delta && (
                <div className="text-xs text-gray-600 mt-1">{kpi.delta}</div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {kpi.actions.map((action, actionIndex) => (
                <button
                  key={actionIndex}
                  onClick={action.action}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Act on this: {action.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Ask Panel */}
      <div className="mt-8">
        <AskPanel 
          title="Speak to Your Data"
          placeholder="Ask about revenue, patient trends, appointments, or any practice metrics..."
          showExamples={true}
        />
      </div>

      {/* Insights Summary */}
      <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Weekly Summary</h2>
        <div className="prose text-sm text-gray-600">
          <p>
            Your practice is performing well overall with strong appointment utilization (85%) and patient satisfaction (4.8/5). 
            However, attention is needed for <strong className="text-red-600">9 claims aging over 60 days</strong> and 
            a slightly elevated no-show rate (8%). Consider implementing automated chase processes and reminder systems.
          </p>
        </div>
      </div>

      {/* KPI Plan Preview */}
      <PlanPreviewDrawer
        plan={currentPlan}
        isOpen={planPreviewOpen}
        onClose={() => {
          setPlanPreviewOpen(false)
          setCurrentPlan(null)
        }}
      />
    </div>
  )
}
