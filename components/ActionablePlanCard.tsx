'use client'

import { useState } from 'react'
import { AlertTriangle, TrendingUp, Clock, Play, Calendar, Settings, Eye, DollarSign, Users, CheckCircle } from 'lucide-react'

interface ActionablePlanCardProps {
  id: string
  type: 'urgent' | 'optimization' | 'maintenance'
  title: string
  description: string
  metrics: {
    affected?: number
    projected?: string
    timeEstimate?: string
    confidence?: number
  }
  risks?: string[]
  onCreatePlan: () => void
  onSchedule?: () => void
  onPreview: () => void
}

export default function ActionablePlanCard({ 
  id, 
  type, 
  title, 
  description, 
  metrics = {}, 
  risks = [], 
  onCreatePlan, 
  onSchedule, 
  onPreview 
}: ActionablePlanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getTypeConfig = () => {
    switch (type) {
      case 'urgent':
        return {
          bgColor: 'bg-gradient-to-r from-red-50 to-orange-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          icon: <AlertTriangle className="w-5 h-5" />,
          badge: 'Requires Attention'
        }
      case 'optimization':
        return {
          bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          icon: <TrendingUp className="w-5 h-5" />,
          badge: 'Optimization'
        }
      case 'maintenance':
        return {
          bgColor: 'bg-gradient-to-r from-gray-50 to-slate-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          icon: <Clock className="w-5 h-5" />,
          badge: 'Maintenance'
        }
    }
  }

  const config = getTypeConfig()

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 transition-all duration-200 hover:shadow-md`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div className={`${config.iconColor} mt-0.5`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-gray-900">{title}</h3>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                type === 'urgent' ? 'bg-red-100 text-red-700' :
                type === 'optimization' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {config.badge}
              </span>
            </div>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        {metrics?.affected && (
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{metrics.affected}</div>
            <div className="text-xs text-gray-500">Affected</div>
          </div>
        )}
        {metrics?.projected && (
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">{metrics.projected}</div>
            <div className="text-xs text-gray-500">Projected</div>
          </div>
        )}
        {metrics?.timeEstimate && (
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">{metrics.timeEstimate}</div>
            <div className="text-xs text-gray-500">Est. Time</div>
          </div>
        )}
      </div>

      {/* Risks (if expanded) */}
      {isExpanded && risks.length > 0 && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Considerations</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            {risks.map((risk, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isExpanded ? 'Show less' : 'Show details'}
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onPreview}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
          
          {onSchedule && (
            <button
              onClick={onSchedule}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule</span>
            </button>
          )}
          
          <button
            onClick={onCreatePlan}
            className={`flex items-center space-x-1 px-4 py-1.5 text-sm font-medium text-white rounded-md transition-colors ${
              type === 'urgent' ? 'bg-red-600 hover:bg-red-700' :
              type === 'optimization' ? 'bg-blue-600 hover:bg-blue-700' :
              'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {/* Confidence Indicator */}
      {metrics?.confidence && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>AI Confidence</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    metrics.confidence > 0.8 ? 'bg-green-500' :
                    metrics.confidence > 0.6 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${metrics.confidence * 100}%` }}
                />
              </div>
              <span className="font-medium">{Math.round(metrics.confidence * 100)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
