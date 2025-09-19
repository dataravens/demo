'use client'

import { useState, useEffect } from 'react'
import { useData, useRole } from '@/store'
import { AvailabilityEngine } from '@/services/availability'
import { AppointmentTemplateService } from '@/services/appointment-templates'
import { AvailabilitySlot, AppointmentTemplate, EnhancedAppointment } from '@/types/appointments'
import { Calendar, Clock, User, MapPin, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react'

interface AppointmentBookingProps {
  isOpen: boolean
  onClose: () => void
  patientId?: string
  preselectedDate?: string
  onAppointmentBooked?: (appointment: EnhancedAppointment) => void
}

export default function AppointmentBooking({ 
  isOpen, 
  onClose, 
  patientId, 
  preselectedDate,
  onAppointmentBooked 
}: AppointmentBookingProps) {
  const { patients, practitioners, sites, rooms, appointments } = useData()
  const { hasPermission } = useRole()
  
  // Booking state
  const [selectedPatient, setSelectedPatient] = useState(patientId || '')
  const [selectedTemplate, setSelectedTemplate] = useState<AppointmentTemplate | null>(null)
  const [searchDate, setSearchDate] = useState(preselectedDate || new Date().toISOString().split('T')[0])
  const [duration, setDuration] = useState(30)
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  
  // Template suggestions
  const [templateSuggestions, setTemplateSuggestions] = useState<{
    template: AppointmentTemplate
    confidence: number
    reasons: string[]
  }[]>([])
  
  const patient = patients.find(p => p.id === selectedPatient)
  const templates = AppointmentTemplateService.getDefaultTemplates()
  
  // Load AI template suggestions when patient is selected
  useEffect(() => {
    if (selectedPatient) {
      const suggestions = AppointmentTemplateService.suggestTemplates({
        patientId: selectedPatient,
        patientHistory: appointments.filter(a => a.patientId === selectedPatient),
        urgency: 'routine'
      })
      setTemplateSuggestions(suggestions)
    }
  }, [selectedPatient, appointments])
  
  // Search for available slots
  const searchAvailability = async () => {
    if (!selectedPatient) return
    
    setLoading(true)
    
    try {
      // Convert current appointments to enhanced format for conflict checking
      const enhancedAppointments: EnhancedAppointment[] = appointments.map(apt => ({
        ...apt,
        duration: 30, // Default duration
        practitionerId: apt.practitionerId || apt.clinician || 'unknown',
        practitionerName: apt.practitionerName || apt.clinician || 'Unknown',
        siteId: apt.siteId || 'site1',
        siteName: apt.siteName || 'Main Clinic',
        appointmentType: apt.appointmentType || 'Consultation',
        status: apt.status || 'scheduled',
        isRecurring: false,
        serviceIds: [],
        bookedAt: new Date().toISOString(),
        bookedBy: 'current-user',
        bookingSource: 'manual' as const,
        validated: true
      }))
      
      const endDate = new Date(searchDate)
      endDate.setDate(endDate.getDate() + 14) // Search 2 weeks ahead
      
      const slots = AvailabilityEngine.findAvailableSlots({
        startDate: searchDate,
        endDate: endDate.toISOString().split('T')[0],
        duration: selectedTemplate?.duration || duration,
        patientId: selectedPatient,
        patientPreferences: patient?.preferences ? {
          timeOfDay: patient.preferences.appointmentTime,
          practitionerId: patient.preferences.practitionerId
        } : undefined,
        practitioners,
        sites,
        rooms,
        existingAppointments: enhancedAppointments
      })
      
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error searching availability:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Book the selected appointment
  const bookAppointment = () => {
    if (!selectedSlot || !selectedPatient) return
    
    const newAppointment: EnhancedAppointment = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientId: selectedPatient,
      patientName: patient?.name,
      start: selectedSlot.start,
      end: selectedSlot.end,
      duration: selectedTemplate?.duration || duration,
      practitionerId: selectedSlot.practitionerId,
      practitionerName: selectedSlot.practitionerName,
      roomId: selectedSlot.roomId,
      roomName: selectedSlot.roomName,
      siteId: selectedSlot.siteId,
      siteName: selectedSlot.siteName,
      templateId: selectedTemplate?.id,
      appointmentType: selectedTemplate?.name || 'General Consultation',
      status: 'scheduled',
      isRecurring: false,
      serviceIds: [],
      bookedAt: new Date().toISOString(),
      bookedBy: 'current-user',
      bookingSource: 'manual',
      validated: true,
      notes: selectedTemplate?.preparation?.instructions
    }
    
    onAppointmentBooked?.(newAppointment)
    onClose()
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Book Appointment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient
            </label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} - {patient.phone}
                </option>
              ))}
            </select>
          </div>
          
          {/* AI Template Suggestions */}
          {selectedPatient && templateSuggestions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-blue-900 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Recommendations
                </h3>
                <button
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                  className="text-blue-600 text-sm hover:text-blue-800"
                >
                  {showAISuggestions ? 'Hide' : 'Show'} Details
                </button>
              </div>
              
              <div className="space-y-2">
                {templateSuggestions.slice(0, 3).map((suggestion, index) => (
                  <div key={suggestion.template.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedTemplate(suggestion.template)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedTemplate?.id === suggestion.template.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        {suggestion.template.name}
                      </button>
                      <div className="text-xs text-blue-600">
                        {Math.round(suggestion.confidence * 100)}% match
                      </div>
                    </div>
                    {showAISuggestions && (
                      <div className="text-xs text-blue-600 max-w-xs">
                        {suggestion.reasons[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Manual Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-gray-500 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {template.duration} min
                    {template.pricing && (
                      <span className="ml-2">£{template.pricing.basePrice}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Date and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {!selectedTemplate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  min="15"
                  max="120"
                  step="15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
          
          {/* Search Button */}
          <button
            onClick={searchAvailability}
            disabled={!selectedPatient || loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Find Available Times'}
          </button>
          
          {/* Available Slots */}
          {availableSlots.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Available Times</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {availableSlots.filter(slot => slot.available).slice(0, 20).map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      selectedSlot === slot
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">
                          {new Date(slot.start).toLocaleDateString()} at{' '}
                          {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <User className="w-3 h-3 mr-1" />
                          {slot.practitionerName}
                          {slot.roomName && (
                            <>
                              <MapPin className="w-3 h-3 ml-2 mr-1" />
                              {slot.roomName}
                            </>
                          )}
                        </div>
                      </div>
                      {slot.recommendations && (
                        <div className="text-xs text-green-600 font-medium">
                          {Math.round(slot.recommendations.score * 100)}% match
                        </div>
                      )}
                    </div>
                    
                    {slot.recommendations && slot.recommendations.reasons.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {slot.recommendations.reasons[0]}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* No slots found */}
          {availableSlots.length > 0 && availableSlots.filter(slot => slot.available).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No available slots found for the selected criteria.</p>
              <p className="text-sm mt-2">Try adjusting the date range or appointment type.</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {selectedSlot && (
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                Ready to book with {selectedSlot.practitionerName}
              </span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={bookAppointment}
              disabled={!selectedSlot}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
