'use client'

import { useState, useEffect } from 'react'
import { reminderEngine, ReminderActivity } from '@/services/reminder-engine'
import { useAutopilotPacks } from '@/services/autopilot-packs'
import { useRole } from '@/store'
import { Clock, CheckCircle, AlertTriangle, Zap, Activity, Settings } from 'lucide-react'
import BackgroundAIModal from './BackgroundAIModal'

export default function BackgroundAIWidget() {
  const [activities, setActivities] = useState<ReminderActivity[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [stats, setStats] = useState({
    totalTasksToday: 8,
    successfulReminders: 5,
    verifiedInsurance: 3,
    pendingTasks: 2,
    next24HourTasks: 4
  })
  
  const { currentRole } = useRole()
  const { packs, togglePack, getEnabledPacks, getPacksForRole } = useAutopilotPacks()

  useEffect(() => {
    // Initial load with role-based filtering
    const initialActivities = reminderEngine.getRecentActivities(5, currentRole)
    setActivities(initialActivities)
    
    // Update stats based on activities or use demo stats
    const engineStats = reminderEngine.getStats()
    if (engineStats.totalTasksToday > 0) {
      setStats(engineStats)
    }
    // Keep demo stats if no real stats available

    // Update every 30 seconds to show live activity
    const interval = setInterval(() => {
      const newActivities = reminderEngine.getRecentActivities(5, currentRole)
      setActivities(newActivities)
      
      const newStats = reminderEngine.getStats()
      if (newStats.totalTasksToday > 0) {
        setStats(newStats)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [currentRole])

  const getActivityIcon = (activity: ReminderActivity) => {
    switch (activity.type) {
      case 'reminder_sent':
        return <Clock className="w-4 h-4" />
      case 'insurance_verified':
        return <CheckCircle className="w-4 h-4" />
      case 'patient_responded':
        return <Activity className="w-4 h-4" />
      case 'verification_failed':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Zap className="w-4 h-4" />
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-amber-600 bg-amber-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-blue-600 bg-blue-100'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  const enabledPacks = getEnabledPacks()
  const relevantPacks = getPacksForRole(currentRole)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Autopilot</h3>
            <p className="text-sm text-cyan-700">{enabledPacks.length} packs active</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-700 font-medium">Active</span>
          </div>
        </div>
      </div>

      {/* Autopilot Packs Settings */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            AI Autopilot Packs for {currentRole}
          </h4>
          <div className="space-y-2">
            {relevantPacks.map((pack) => (
              <div key={pack.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{pack.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{pack.name}</div>
                    <div className="text-xs text-gray-500">{pack.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => togglePack(pack.id)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    pack.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      pack.enabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-700">{Math.max(stats.successfulReminders, activities.filter(a => a.status === 'success').length)}</div>
          <div className="text-xs text-green-600 font-medium">Tasks completed today</div>
        </div>
        <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{Math.max(stats.next24HourTasks, 2)}</div>
          <div className="text-xs text-blue-600 font-medium">Scheduled next 24h</div>
        </div>
      </div>

      {/* Pending Tasks Indicator */}
      {stats.next24HourTasks > 0 && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              {stats.next24HourTasks} tasks scheduled next 24h
            </span>
          </div>
          <div className="text-xs text-amber-600">
            AI will automatically process reminders and verifications
          </div>
        </div>
      )}

      {/* Live AI Examples */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-gray-600" />
          <span>AI Working Now</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2" />
        </h4>
        
        {/* Patient Outreach Examples */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-blue-700 uppercase">Patient Outreach</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">SMS reminder to Sarah Jones</span>
              <span className="text-green-600 font-medium">Sent 2m ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Follow-up call scheduled: Michael Brown</span>
              <span className="text-amber-600 font-medium">Queued</span>
            </div>
          </div>
        </div>

        {/* Collections & Billing Examples */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-green-700 uppercase">Collections & Billing</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Payment reminder: Invoice #INV-2024-0156</span>
              <span className="text-green-600 font-medium">Sent 5m ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Insurance verification: Emma Davis</span>
              <span className="text-blue-600 font-medium">In progress</span>
            </div>
          </div>
        </div>

        {/* Clinical Support Examples */}
        {currentRole === 'clinician' && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-purple-700 uppercase">Clinical Support</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Lab results flagged: John Smith HbA1c</span>
                <span className="text-amber-600 font-medium">Review needed</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Prescription renewal: Margaret Thompson</span>
                <span className="text-green-600 font-medium">Auto-approved</span>
              </div>
            </div>
          </div>
        )}

        {/* Scheduling Examples */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-orange-700 uppercase">Smart Scheduling</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Waitlist matched: Lisa Chen → 2:30pm slot</span>
              <span className="text-green-600 font-medium">Confirmed</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Conflict detected: Dr. Martinez double-booked</span>
              <span className="text-amber-600 font-medium">Resolving</span>
            </div>
          </div>
        </div>

        {/* Compliance Examples */}
        {currentRole === 'manager' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-red-700 uppercase">Compliance & Audit</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">GDPR audit: Patient data retention check</span>
                <span className="text-green-600 font-medium">Compliant</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">CQC prep: Documentation review</span>
                <span className="text-blue-600 font-medium">90% complete</span>
              </div>
            </div>
          </div>
        )}

        {/* Real Activity Summary */}
        {activities.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-semibold text-gray-700 uppercase">Recent Completions</span>
            </div>
            <div className="space-y-1">
              {activities.slice(0, 2).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700">{activity.patientName}: {activity.details.substring(0, 30)}...</span>
                  <span className="text-green-600 font-medium">{formatTimeAgo(activity.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button 
          onClick={() => setShowModal(true)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium w-full text-center transition-colors"
        >
          View all background AI activity →
        </button>
      </div>

      {/* Background AI Modal */}
      <BackgroundAIModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}
