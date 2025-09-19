'use client'
import { useState } from 'react'
import SembleCalendar from '@/components/SembleCalendar'
import AppointmentBooking from '@/components/AppointmentBooking'
import { useData } from '@/store'
import { EnhancedAppointment } from '@/types/appointments'

export default function Calendar() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>()
  const { addAppointment } = useData()

  const handleNewAppointment = (date?: string) => {
    setSelectedDate(date)
    setBookingOpen(true)
  }

  const handleAppointmentBooked = (appointment: EnhancedAppointment) => {
    // Convert enhanced appointment back to basic format for storage
    addAppointment({
      id: appointment.id,
      patientId: appointment.patientId,
      start: appointment.start,
      end: appointment.end,
      clinician: appointment.practitionerName,
      room: appointment.roomName,
      practitionerId: appointment.practitionerId,
      practitionerName: appointment.practitionerName,
      roomId: appointment.roomId,
      roomName: appointment.roomName,
      siteId: appointment.siteId,
      siteName: appointment.siteName,
      appointmentType: appointment.appointmentType,
      status: appointment.status,
      notes: appointment.notes
    })
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
      </div>
      
      <div className="flex-1">
        <SembleCalendar onNewAppointment={handleNewAppointment} />
      </div>

      {/* Advanced Appointment Booking Modal */}
      <AppointmentBooking
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        preselectedDate={selectedDate}
        onAppointmentBooked={handleAppointmentBooked}
      />
    </div>
  )
}
