'use client'

import { X, Clock, CheckCircle, AlertTriangle, Bot, User, ExternalLink } from 'lucide-react'
import { ReminderActivity } from '@/services/reminder-engine'

interface ActivityDetailModalProps {
  activity: ReminderActivity | null
  isOpen: boolean
  onClose: () => void
}

export default function ActivityDetailModal({ activity, isOpen, onClose }: ActivityDetailModalProps) {
  if (!isOpen || !activity) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-700 bg-green-100 border-green-200'
      case 'warning':
        return 'text-amber-700 bg-amber-100 border-amber-200'
      case 'error':
        return 'text-red-700 bg-red-100 border-red-200'
      default:
        return 'text-blue-700 bg-blue-100 border-blue-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-blue-600" />
    }
  }

  const getActionDetails = () => {
    switch (activity.type) {
      case 'appointment_reminder':
        return {
          category: 'Patient Communication',
          impact: 'Improved attendance rate',
          nextSteps: ['Monitor patient response', 'Send follow-up if needed'],
          relatedData: {
            'Appointment Time': activity.appointmentTime || 'Not specified',
            'Reminder Method': 'SMS',
            'Response Required': 'Yes',
            'Confirmation Status': 'Confirmed'
          }
        }
      case 'insurance_verification':
        return {
          category: 'Insurance & Billing',
          impact: 'Prevented claim rejection',
          nextSteps: ['Update patient record', 'Proceed with treatment'],
          relatedData: {
            'Insurance Provider': 'Bupa',
            'Coverage Type': 'Physiotherapy',
            'Coverage Limit': '£1,500/year',
            'Remaining Balance': '£1,250'
          }
        }
      case 'payment_reminder':
        return {
          category: 'Revenue Cycle',
          impact: 'Reduced outstanding debt',
          nextSteps: ['Monitor payment', 'Escalate if overdue'],
          relatedData: {
            'Invoice Amount': '£250.00',
            'Days Overdue': '15 days',
            'Payment Method': 'Online link provided',
            'Previous Reminders': '1'
          }
        }
      case 'clinical_documentation':
        return {
          category: 'Clinical Operations',
          impact: 'Improved coding accuracy',
          nextSteps: ['Review suggested codes', 'Finalize documentation'],
          relatedData: {
            'Suggested ICD-10': 'M54.5',
            'Condition': 'Lower back pain',
            'Confidence Score': '94%',
            'Documentation Status': 'Pre-filled'
          }
        }
      case 'schedule_optimization':
        return {
          category: 'Scheduling',
          impact: 'Maximized appointment utilization',
          nextSteps: ['Confirm appointment', 'Send reminder'],
          relatedData: {
            'Original Slot': '2:30 PM',
            'Waitlist Position': '#1',
            'Contact Method': 'Phone call',
            'Confirmation Time': '< 5 minutes'
          }
        }
      case 'compliance_check':
        return {
          category: 'Compliance & Quality',
          impact: 'Maintained HIPAA compliance',
          nextSteps: ['Archive documentation', 'Schedule next audit'],
          relatedData: {
            'Compliance Score': '98%',
            'Forms Processed': '3',
            'Digital Signatures': 'Complete',
            'Next Audit': 'Jan 2025'
          }
        }
      case 'call_routing':
        return {
          category: 'Call Management',
          impact: 'Improved call efficiency',
          nextSteps: ['Process transcription', 'Follow up on ticket'],
          relatedData: {
            'Call Duration': '3:24',
            'Department': 'Billing',
            'Transcription Accuracy': '96%',
            'Ticket ID': '#TK-2024-0892'
          }
        }
      case 'inventory_alert':
        return {
          category: 'Supply Management',
          impact: 'Prevented stockout',
          nextSteps: ['Track delivery', 'Update inventory'],
          relatedData: {
            'Item': 'Examination gloves (Size M)',
            'Current Stock': '24 boxes',
            'Reorder Quantity': '50 boxes',
            'Expected Delivery': '2-3 days'
          }
        }
      default:
        return {
          category: 'General',
          impact: 'Process completed',
          nextSteps: ['Review results'],
          relatedData: {}
        }
    }
  }

  const actionDetails = getActionDetails()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${getStatusColor(activity.status)}`}>
              {getStatusIcon(activity.status)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Activity Details</h2>
              <p className="text-sm text-gray-600">{actionDetails.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Action Summary</h3>
              <p className="text-gray-700">{activity.details}</p>
            </div>

            {/* Status and Agent */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(activity.status)}`}>
                  {getStatusIcon(activity.status)}
                  <span className="font-medium capitalize">{activity.status}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">AI Agent</h4>
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-cyan-600" />
                  <span className="font-medium text-gray-900">{activity.agentName}</span>
                </div>
              </div>
            </div>

            {/* Patient and Timing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Patient</h4>
                <p className="font-medium text-gray-900">{activity.patientName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Timestamp</h4>
                <p className="text-gray-700">{activity.timestamp.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Related Data */}
          {Object.keys(actionDetails.relatedData).length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Related Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(actionDetails.relatedData).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{key}:</span>
                      <span className="text-sm font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Impact */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Business Impact</h3>
            <p className="text-gray-700">{actionDetails.impact}</p>
          </div>

          {/* Next Steps */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Recommended Next Steps</h3>
            <ul className="space-y-2">
              {actionDetails.nextSteps.map((step, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Automation Info */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="w-4 h-4 text-cyan-600" />
              <span className="font-medium text-cyan-900">Automated Process</span>
            </div>
            <p className="text-sm text-cyan-800">
              This action was performed automatically by {activity.agentName} as part of your enabled autopilot packs. 
              No manual intervention was required.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Activity ID: {activity.id} • Automated: {activity.automated ? 'Yes' : 'No'}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>View in System</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
