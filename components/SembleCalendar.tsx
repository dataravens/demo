'use client'
import { useState, useMemo } from 'react'
import { useData } from '@/store'
import { ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react'

interface CalendarProps {
  onNewAppointment?: () => void
}

export default function SembleCalendar({ onNewAppointment }: CalendarProps) {
  const { appointments, patients, practitioners, sites, rooms, updateAppointment, addAppointment } = useData() as any
  
  // Calendar state
  const [currentWeek, setCurrentWeek] = useState(() => {
    const date = new Date('2024-09-09') // Start of our data week
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(date.setDate(diff))
  })
  
  // Filters / view
  const [selectedPractitioner, setSelectedPractitioner] = useState<string>('all')
  const [selectedSite, setSelectedSite] = useState<string>('all')
  const [viewBy, setViewBy] = useState<'practitioner' | 'room'>('practitioner')
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  // Generate week dates
  const weekDates = useMemo(() => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeek)
      date.setDate(currentWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [currentWeek])

  // Filter appointments for current range
  const weekAppointments = useMemo(() => {
    const weekStart = weekDates[0]
    const weekEnd = weekDates[6]
    
    return appointments.filter((apt: any) => {
      const aptDate = new Date(apt.start)
      return aptDate >= weekStart && aptDate <= weekEnd
    })
  }, [appointments, weekDates])

  // Get columns based on view mode and filters
  const columns = useMemo(() => {
    let filteredPractitioners = practitioners
    let filteredRooms = rooms

    if (selectedPractitioner !== 'all') {
      filteredPractitioners = practitioners.filter((p: any) => p.id === selectedPractitioner)
    }
    
    if (selectedSite !== 'all') {
      filteredRooms = rooms.filter((r: any) => r.siteId === selectedSite)
    }

    if (viewBy === 'practitioner') {
      return filteredPractitioners.map((practitioner: any) => ({
        id: `practitioner-${practitioner.id}`,
        title: practitioner.name,
        subtitle: practitioner.specialty,
        color: practitioner.color,
        type: 'practitioner',
        practitionerId: practitioner.id
      }))
    } else {
      return filteredRooms.map((room: any) => {
        const site = sites.find((s: any) => s.id === room.siteId)
        return {
          id: `room-${room.id}`,
          title: `${site?.name || 'Unknown Site'} - ${room.name}`,
          subtitle: room.name,
          color: '#6B7280',
          type: 'room',
          roomId: room.id,
          siteId: room.siteId
        }
      })
    }
  }, [practitioners, rooms, sites, selectedPractitioner, selectedSite, viewBy])

  // Time slots (8:00 AM to 6:00 PM)
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          hour,
          minute
        })
      }
    }
    return slots
  }, [])

  // Get appointments for a specific column and date
  const getAppointmentsForSlot = (column: any, date: Date) => {
    return weekAppointments.filter((apt: any) => {
      const aptDate = new Date(apt.start)
      if (aptDate.toDateString() !== date.toDateString()) return false

      if (viewBy === 'practitioner') {
        return apt.practitionerId === column.practitionerId
      } else {
        return apt.roomId === column.roomId
      }
    })
  }

  // Get time position for appointment
  const getTimePosition = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const totalMinutes = (hours - 8) * 60 + minutes
    return (totalMinutes / 15) * 20 // 20px per 15-minute slot
  }

  // Get appointment duration in pixels
  const getAppointmentHeight = (start: string, end: string) => {
    const startTime = new Date(start)
    const endTime = new Date(end)
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    return Math.max(20, (durationMinutes / 15) * 20) // Minimum 20px height
  }

  // Basic drag handling (mouse only, optimistic update)
  const onDragStart = (e: any, appointment: any) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(appointment))
  }

  const onDragOver = (e: any) => {
    e.preventDefault()
  }

  const onDrop = (e: any, date: Date, column: any, topOffset: number) => {
    e.preventDefault()
    const data = e.dataTransfer.getData('text/plain')
    if (!data) return
    const appt = JSON.parse(data)

    const minutesFromStart = Math.max(0, Math.round(topOffset / 20) * 15)
    const newStart = new Date(date)
    newStart.setHours(8, 0, 0, 0)
    newStart.setMinutes(newStart.getMinutes() + minutesFromStart)
    const newEnd = new Date(newStart)
    const oldDuration = (new Date(appt.end).getTime() - new Date(appt.start).getTime()) / (1000 * 60)
    newEnd.setMinutes(newEnd.getMinutes() + oldDuration)

    const updates: any = {
      start: newStart.toISOString(),
      end: newEnd.toISOString(),
    }
    if (viewBy === 'practitioner') {
      updates.practitionerId = column.practitionerId
      updates.practitionerName = column.title
    } else {
      updates.roomId = column.roomId
      updates.roomName = column.title
      updates.siteId = column.siteId
      updates.siteName = sites.find((s: any) => s.id === column.siteId)?.name
    }
    updateAppointment(appt.id, updates)
  }

  const openEditor = (appointment?: any) => {
    setEditing(appointment || null)
    setEditorOpen(true)
  }

  const closeEditor = () => {
    setEditorOpen(false)
    setEditing(null)
  }

  const saveEditor = (data: any) => {
    if (editing) {
      updateAppointment(editing.id, data)
    } else {
      const id = `a-${Date.now()}`
      addAppointment({ id, ...data })
    }
    closeEditor()
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p: any) => p.id === patientId)
    return patient?.name || 'Unknown Patient'
  }

  if (columns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No practitioners or rooms match the current filters.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <button
            onClick={onNewAppointment}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">View by</label>
            <select
              value={viewBy}
              onChange={(e) => setViewBy(e.target.value as 'practitioner' | 'room')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="practitioner">Practitioner</option>
              <option value="room">Room</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Mode</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'week' | 'day')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="week">Week</option>
              <option value="day">Day</option>
            </select>
          </div>

          {viewBy === 'practitioner' && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Practitioner</label>
              <select
                value={selectedPractitioner}
                onChange={(e) => setSelectedPractitioner(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm min-w-[150px]"
              >
                <option value="all">All Practitioners</option>
                {practitioners.map((practitioner: any) => (
                  <option key={practitioner.id} value={practitioner.id}>
                    {practitioner.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Site</label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm min-w-[150px]"
            >
              <option value="all">All Sites</option>
              {sites.map((site: any) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Date Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium px-4">
              {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
            </span>
            <button
              onClick={() => navigateWeek('next')}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setCurrentWeek(new Date('2024-09-09'))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-fit">
          {/* Column Headers */}
          <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
            <div className="flex">
              {/* Time column header */}
              <div className="w-16 border-r border-gray-200"></div>
              
              {/* Day/Column headers */}
              {(viewMode === 'day' ? [weekDates[0]] : weekDates).map((date) => (
                <div key={date.toISOString()} className="flex-1 min-w-0">
                  <div className="px-2 py-3 text-center border-b border-gray-200 bg-gray-50">
                    <div className="font-medium text-sm text-gray-900">
                      {formatDate(date)}
                    </div>
                  </div>
                  
                  {/* Column sub-headers */}
                  <div className="flex border-b border-gray-200">
                    {columns.map((column) => (
                      <div key={`${date.toDateString()}-${column.id}`} 
                           className="flex-1 px-2 py-2 border-r border-gray-200 bg-gray-50 min-w-[180px]">
                        <div className="text-xs font-medium text-gray-900 truncate">
                          {column.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {column.subtitle}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Grid */}
          <div className="relative">
            <div className="flex">
              {/* Time labels */}
              <div className="w-16 border-r border-gray-200">
                {timeSlots.filter(slot => slot.minute === 0).map((slot) => (
                  <div key={slot.time} className="h-20 flex items-start pt-1 pr-2 text-xs text-gray-500 text-right">
                    {slot.time}
                  </div>
                ))}
              </div>

              {/* Calendar columns */}
              {(viewMode === 'day' ? [weekDates[0]] : weekDates).map((date, dateIndex) => (
                <div key={date.toISOString()} className="flex-1 relative">
                  <div className="flex">
                    {columns.map((column, columnIndex) => (
                      <div key={`${date.toDateString()}-${column.id}`} 
                           className="flex-1 relative border-r border-gray-200 min-w-[180px]"
                           style={{ height: `${timeSlots.filter(s => s.minute === 0).length * 80}px` }}
                           onDragOver={onDragOver}
                           onDrop={(e) => {
                             const rect = (e.target as HTMLElement).getBoundingClientRect()
                             const topOffset = e.clientY - rect.top
                             onDrop(e, date, column, topOffset)
                           }}>
                        
                        {/* Time slot grid lines */}
                        {timeSlots.filter(slot => slot.minute === 0).map((slot, slotIndex) => (
                          <div key={slot.time} 
                               className="absolute w-full border-t border-gray-100"
                               style={{ top: `${slotIndex * 80}px`, height: '80px' }}>
                            {/* 15-minute subdivisions */}
                            <div className="absolute w-full border-t border-gray-50" style={{ top: '20px' }}></div>
                            <div className="absolute w-full border-t border-gray-50" style={{ top: '40px' }}></div>
                            <div className="absolute w-full border-t border-gray-50" style={{ top: '60px' }}></div>
                          </div>
                        ))}

                        {/* Appointments */}
                        {getAppointmentsForSlot(column, date).map((appointment: any) => {
                          const startTime = new Date(appointment.start)
                          const endTime = new Date(appointment.end)
                          const top = getTimePosition(`${startTime.getHours()}:${startTime.getMinutes()}`)
                          const height = getAppointmentHeight(appointment.start, appointment.end)
                          
                          return (
                            <div
                              key={appointment.id}
                              className="absolute left-1 right-1 rounded text-white text-xs p-1 cursor-move hover:opacity-90 z-20"
                              style={{
                                top: `${top}px`,
                                height: `${height}px`,
                                backgroundColor: viewBy === 'practitioner' 
                                  ? column.color 
                                  : practitioners.find((p: any) => p.id === appointment.practitionerId)?.color || '#6B7280'
                              }}
                              draggable
                              onDragStart={(e) => onDragStart(e, appointment)}
                              onDoubleClick={() => openEditor(appointment)}
                            >
                              <div className="font-medium truncate">
                                {getPatientName(appointment.patientId)}
                              </div>
                              <div className="text-xs opacity-90 truncate">
                                {startTime.toLocaleTimeString('en-GB', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: false 
                                })} - {endTime.toLocaleTimeString('en-GB', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: false 
                                })}
                              </div>
                              {appointment.appointmentType && (
                                <div className="text-xs opacity-75 truncate">
                                  {appointment.appointmentType}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simple Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeEditor}>
          <div className="bg-white rounded-md shadow-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="font-medium">{editing ? 'Edit appointment' : 'New appointment'}</div>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="text-sm text-gray-600">Patient</label>
                <select id="patient" className="border rounded px-2 py-1 text-sm">
                  {patients.map((p: any) => (
                    <option key={p.id} value={p.id} selected={editing?.patientId === p.id}>{p.name}</option>
                  ))}
                </select>

                <label className="text-sm text-gray-600">Practitioner</label>
                <select id="practitioner" className="border rounded px-2 py-1 text-sm">
                  {practitioners.map((pr: any) => (
                    <option key={pr.id} value={pr.id} selected={editing?.practitionerId === pr.id}>{pr.name}</option>
                  ))}
                </select>

                <label className="text-sm text-gray-600">Date</label>
                <input id="date" type="date" defaultValue={(editing ? new Date(editing.start) : weekDates[0]).toISOString().slice(0,10)} className="border rounded px-2 py-1 text-sm" />

                <label className="text-sm text-gray-600">Start</label>
                <input id="start" type="time" defaultValue={(editing ? new Date(editing.start) : new Date()).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false})} className="border rounded px-2 py-1 text-sm" />

                <label className="text-sm text-gray-600">Duration (mins)</label>
                <input id="duration" type="number" defaultValue={editing ? Math.max(15, (new Date(editing.end).getTime()-new Date(editing.start).getTime())/60000) : 30} className="border rounded px-2 py-1 text-sm" />

                <label className="text-sm text-gray-600">Status</label>
                <select id="status" className="border rounded px-2 py-1 text-sm" defaultValue={editing?.status || 'scheduled'}>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="arrived">Arrived</option>
                  <option value="dna">DNA</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <textarea id="notes" placeholder="Notes" defaultValue={editing?.notes || ''} className="w-full border rounded px-2 py-1 text-sm" />
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
              <button className="px-3 py-1 text-sm border rounded" onClick={closeEditor}>Cancel</button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded" onClick={() => {
                const patientId = (document.getElementById('patient') as HTMLSelectElement).value
                const practitionerId = (document.getElementById('practitioner') as HTMLSelectElement).value
                const date = (document.getElementById('date') as HTMLInputElement).value
                const start = (document.getElementById('start') as HTMLInputElement).value
                const duration = parseInt((document.getElementById('duration') as HTMLInputElement).value || '30', 10)
                const status = (document.getElementById('status') as HTMLSelectElement).value as any
                const practitioner = practitioners.find((p: any) => p.id === practitionerId)
                const startISO = new Date(`${date}T${start}:00Z`)
                const endISO = new Date(startISO)
                endISO.setMinutes(endISO.getMinutes() + duration)
                saveEditor({
                  patientId,
                  start: startISO.toISOString(),
                  end: endISO.toISOString(),
                  practitionerId: practitioner?.id,
                  practitionerName: practitioner?.name,
                  status,
                  notes: (document.getElementById('notes') as HTMLTextAreaElement).value
                })
              }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
