'use client'

import { useState, useEffect } from 'react'
import { X, Clock, CheckCircle, AlertTriangle, Zap, Activity, User, Bot } from 'lucide-react'
import { useTimeline, useRole } from '@/store'
import { reminderEngine, ReminderActivity } from '@/services/reminder-engine'

interface TimelineModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TimelineModal({ isOpen, onClose }: TimelineModalProps) {
  const { events } = useTimeline()
  const { currentRole } = useRole()
  const [filter, setFilter] = useState<'all' | 'plans' | 'background' | 'manual'>('all')
  const [backgroundActivities, setBackgroundActivities] = useState<ReminderActivity[]>([])

  useEffect(() => {
    if (isOpen) {
      // Load all background activities
      setBackgroundActivities(reminderEngine.getRecentActivities(20, currentRole))
    }
  }, [isOpen, currentRole])

  if (!isOpen) return null

  // Combine and sort all activities
  const allActivities = [
    // Convert timeline events
    ...events.map(event => ({
      id: event.id,
      timestamp: new Date(event.ts),
      type: 'plan_action',
      title: event.summary || event.type,
      details: event.summary || `${event.type} - ${event.actor}`,
      source: event.automated ? 'background' : 'manual',
      actor: event.actor,
      status: 'success' as const,
      patientName: event.patientName
    })),
    // Convert background activities
    ...backgroundActivities.map(activity => ({
      id: activity.id,
      timestamp: activity.timestamp,
      type: 'background_ai',
      title: `${activity.agentName}: ${activity.patientName}`,
      details: activity.details,
      source: 'background' as const,
      actor: 'system' as const,
      status: activity.status,
      patientName: activity.patientName,
      agentName: activity.agentName
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  // Filter activities
  const filteredActivities = allActivities.filter(activity => {
    if (filter === 'all') return true
    if (filter === 'plans') return activity.type === 'plan_action'
    if (filter === 'background') return activity.type === 'background_ai'
    if (filter === 'manual') return activity.source === 'manual'
    return true
  })

  const getActivityIcon = (activity: any) => {
    if (activity.type === 'background_ai') {
      return <Bot className="w-5 h-5" />
    }
    if (activity.source === 'manual') {
      return <User className="w-5 h-5" />
    }
    return <Zap className="w-5 h-5" />
  }

  const getActivityColor = (status: string, source: string) => {
    if (source === 'background') {
      switch (status) {
        case 'success': return 'text-blue-600 bg-blue-100'
        case 'warning': return 'text-amber-600 bg-amber-100'
        case 'error': return 'text-red-600 bg-red-100'
        default: return 'text-blue-600 bg-blue-100'
      }
    } else {
      switch (status) {
        case 'success': return 'text-green-600 bg-green-100'
        case 'warning': return 'text-amber-600 bg-amber-100'
        case 'error': return 'text-red-600 bg-red-100'
        default: return 'text-gray-600 bg-gray-100'
      }
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Action Trail</h2>
              <p className="text-sm text-gray-600">Complete history of all system activities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All Activities', count: allActivities.length },
                { key: 'background', label: 'Background AI', count: allActivities.filter(a => a.type === 'background_ai').length },
                { key: 'plans', label: 'Plans & Commands', count: allActivities.filter(a => a.type === 'plan_action').length },
                { key: 'manual', label: 'Manual Actions', count: allActivities.filter(a => a.source === 'manual').length }
              ].map(filterOption => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filterOption.label} ({filterOption.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-lg font-medium text-gray-900 mb-2">No activities found</div>
              <div className="text-sm text-gray-600">Try adjusting your filter settings</div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.status, activity.source)}`}>
                    {getActivityIcon(activity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{activity.title}</h3>
                      <div className="flex items-center space-x-2">
                        {activity.type === 'background_ai' && (
                          <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium">
                            {activity.agentName}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          activity.source === 'background' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {activity.source === 'background' ? 'AUTO' : activity.actor.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{activity.details}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatTimeAgo(activity.timestamp)}</span>
                      <span>•</span>
                      <span>{activity.timestamp.toLocaleString()}</span>
                      {activity.patientName && (
                        <>
                          <span>•</span>
                          <span>Patient: {activity.patientName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>Showing {filteredActivities.length} of {allActivities.length} activities</div>
            <div>Role: {currentRole} • Real-time updates</div>
          </div>
        </div>
      </div>
    </div>
  )
}
