'use client'

import { useState, useEffect } from 'react'
import { X, Zap, Settings, Bot, Activity, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { useAutopilotPacks } from '@/services/autopilot-packs'
import { useRole } from '@/store'
import { reminderEngine, ReminderActivity } from '@/services/reminder-engine'
import ActivityDetailModal from './ActivityDetailModal'

interface BackgroundAIModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function BackgroundAIModal({ isOpen, onClose }: BackgroundAIModalProps) {
  const { currentRole } = useRole()
  const { packs, togglePack, getEnabledPacks, getPacksForRole } = useAutopilotPacks()
  const [activities, setActivities] = useState<ReminderActivity[]>([])
  const [selectedPack, setSelectedPack] = useState<string | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<ReminderActivity | null>(null)
  const [activityDetailOpen, setActivityDetailOpen] = useState(false)
  const [stats, setStats] = useState({
    totalTasksToday: 0,
    successfulReminders: 0,
    verifiedInsurance: 0,
    pendingTasks: 0,
    next24HourTasks: 0
  })

  useEffect(() => {
    if (isOpen) {
      setActivities(reminderEngine.getRecentActivities(50, currentRole))
      setStats(reminderEngine.getStats())
    }
  }, [isOpen, currentRole])

  if (!isOpen) return null

  const enabledPacks = getEnabledPacks()
  const relevantPacks = getPacksForRole(currentRole)

  // Filter activities by selected pack
  const filteredActivities = selectedPack 
    ? activities.filter(activity => activity.packId === selectedPack)
    : activities

  const getActivityIcon = (activity: ReminderActivity) => {
    switch (activity.type) {
      case 'reminder_sent':
        return <Clock className="w-4 h-4" />
      case 'insurance_verified':
        return <CheckCircle className="w-4 h-4" />
      case 'verification_failed':
        return <AlertTriangle className="w-4 h-4" />
      case 'invoice_generated':
      case 'payment_processed':
        return <CheckCircle className="w-4 h-4" />
      case 'clinical_note_created':
      case 'referral_sent':
        return <Activity className="w-4 h-4" />
      case 'schedule_optimized':
        return <Clock className="w-4 h-4" />
      case 'quality_check':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Bot className="w-4 h-4" />
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

  const getPackStats = (packId: string) => {
    const packActivities = activities.filter(a => a.packId === packId)
    return {
      total: packActivities.length,
      success: packActivities.filter(a => a.status === 'success').length,
      warnings: packActivities.filter(a => a.status === 'warning').length,
      errors: packActivities.filter(a => a.status === 'error').length
    }
  }

  const handleActivityClick = (activity: ReminderActivity) => {
    setSelectedActivity(activity)
    setActivityDetailOpen(true)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Background AI Activity</h2>
              <p className="text-sm text-gray-600">AI agents working quietly in the background</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Autopilot Packs */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">AI Autopilot Packs</h3>
              <p className="text-xs text-gray-600">for {currentRole}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* All Activities Option */}
              <button
                onClick={() => setSelectedPack(null)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedPack === null ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                } border`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">All Activities</span>
                  </div>
                  <span className="text-xs text-gray-500">{activities.length}</span>
                </div>
                <div className="text-xs text-gray-600">View all background AI activities</div>
              </button>

              {/* Individual Packs */}
              {relevantPacks.map((pack) => {
                const packStats = getPackStats(pack.id)
                return (
                  <button
                    key={pack.id}
                    onClick={() => setSelectedPack(pack.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedPack === pack.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                    } border`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{pack.icon}</span>
                        <span className="font-medium text-gray-900 text-sm">{pack.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{packStats.total}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            togglePack(pack.id)
                          }}
                          className={`w-6 h-3 rounded-full transition-colors ${
                            pack.enabled ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-2 h-2 bg-white rounded-full transition-transform ${
                            pack.enabled ? 'translate-x-3' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">{pack.description}</div>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-green-600">✓ {packStats.success}</span>
                      {packStats.warnings > 0 && <span className="text-amber-600">⚠ {packStats.warnings}</span>}
                      {packStats.errors > 0 && <span className="text-red-600">✗ {packStats.errors}</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Content - Activity List */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">
                  {selectedPack 
                    ? `${relevantPacks.find(p => p.id === selectedPack)?.name} Activities`
                    : 'All Background Activities'
                  }
                </h3>
                <div className="text-sm text-gray-600">
                  {filteredActivities.length} activities
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-lg font-medium text-gray-900 mb-2">No activities yet</div>
                  <div className="text-sm text-gray-600">
                    {selectedPack 
                      ? 'This AI agent hasn\'t performed any tasks recently'
                      : 'Enable some autopilot packs to see background activities'
                    }
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredActivities.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => handleActivityClick(activity)}
                      className="w-full flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.status)}`}>
                        {getActivityIcon(activity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{activity.patientName}</h4>
                          <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium">
                            {activity.agentName}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            activity.status === 'success' ? 'bg-green-100 text-green-700' :
                            activity.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {activity.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{activity.details}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatTimeAgo(activity.timestamp)}</span>
                          <span>•</span>
                          <span>{activity.timestamp.toLocaleString()}</span>
                          {activity.appointmentTime && (
                            <>
                              <span>•</span>
                              <span>Appointment: {activity.appointmentTime}</span>
                            </>
                          )}
                          <span className="ml-auto text-blue-600">Click for details →</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>{enabledPacks.length} of {relevantPacks.length} autopilot packs enabled</div>
            <div>Real-time monitoring • Role: {currentRole}</div>
          </div>
        </div>
      </div>

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={activityDetailOpen}
        onClose={() => {
          setActivityDetailOpen(false)
          setSelectedActivity(null)
        }}
      />
    </div>
  )
}
