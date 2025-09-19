'use client'

import { useState } from 'react'
import { X, Play, Calendar, Shield, AlertTriangle, CheckCircle, Clock, Users, DollarSign, Zap, Undo } from 'lucide-react'

interface PlanPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  steps: string[]
  metrics: {
    affected?: number
    projected?: string
    timeEstimate?: string
    confidence?: number
  }
  beforeAfter?: {
    before: string[]
    after: string[]
  }
  roleChecks?: {
    required: string[]
    current: string
    hasPermission: boolean
  }
  apiCalls?: {
    service: string
    endpoint: string
    purpose: string
  }[]
  risks?: string[]
  onRun: () => void
  onSchedule?: () => void
  onEdit?: () => void
}

export default function PlanPreviewModal({
  isOpen,
  onClose,
  title,
  description,
  steps,
  metrics,
  beforeAfter,
  roleChecks,
  apiCalls = [],
  risks = [],
  onRun,
  onSchedule,
  onEdit
}: PlanPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'safety'>('overview')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Plan Preview</h2>
              <p className="text-sm text-gray-600">Review before execution</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: <CheckCircle className="w-4 h-4" /> },
              { id: 'details', label: 'Execution Details', icon: <Clock className="w-4 h-4" /> },
              { id: 'safety', label: 'Safety Rails', icon: <Shield className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Title and Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-4">
                {metrics.affected && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{metrics.affected}</div>
                    <div className="text-sm text-gray-500">Records Affected</div>
                  </div>
                )}
                {metrics.projected && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{metrics.projected}</div>
                    <div className="text-sm text-gray-500">Projected Recovery</div>
                  </div>
                )}
                {metrics.timeEstimate && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{metrics.timeEstimate}</div>
                    <div className="text-sm text-gray-500">Estimated Time</div>
                  </div>
                )}
                {metrics.confidence && (
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(metrics.confidence * 100)}%</div>
                    <div className="text-sm text-gray-500">AI Confidence</div>
                  </div>
                )}
              </div>

              {/* Execution Steps */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Execution Steps ({steps.length})</h4>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 text-sm text-gray-700">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Before/After States */}
              {beforeAfter && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                      <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                      <span>Before</span>
                    </h4>
                    <div className="space-y-2">
                      {beforeAfter.before.map((item, index) => (
                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                      <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                      <span>After</span>
                    </h4>
                    <div className="space-y-2">
                      {beforeAfter.after.map((item, index) => (
                        <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* API Calls */}
              {apiCalls.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">API Calls ({apiCalls.length})</h4>
                  <div className="space-y-3">
                    {apiCalls.map((call, index) => (
                      <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{call.service}</span>
                          <code className="text-xs bg-gray-200 px-2 py-1 rounded">{call.endpoint}</code>
                        </div>
                        <p className="text-sm text-gray-600">{call.purpose}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-6">
              {/* Role Checks */}
              {roleChecks && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Role & Permissions</h4>
                  <div className={`p-4 rounded-lg border ${
                    roleChecks.hasPermission 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {roleChecks.hasPermission ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`font-medium ${
                        roleChecks.hasPermission ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {roleChecks.hasPermission ? 'Permission Granted' : 'Permission Required'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Current Role: <span className="font-medium">{roleChecks.current}</span></p>
                      <p>Required Roles: <span className="font-medium">{roleChecks.required.join(', ')}</span></p>
                    </div>
                  </div>
                </div>
              )}

              {/* Risks */}
              {risks.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Risk Assessment</h4>
                  <div className="space-y-3">
                    {risks.map((risk, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-yellow-800">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Undo Policy */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Undo & Audit</h4>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Undo className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">One-Tap Undo Available</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    All changes can be reversed with a single click. A permanent audit receipt will be created 
                    showing the time, user, and all changes made.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            All actions are logged and reversible
          </div>
          <div className="flex items-center space-x-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit Plan
              </button>
            )}
            {onSchedule && (
              <button
                onClick={onSchedule}
                className="flex items-center space-x-2 px-4 py-2 text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule</span>
              </button>
            )}
            <button
              onClick={onRun}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Run Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
