import { AvailabilitySlot, AppointmentConflict, EnhancedAppointment } from '@/types/appointments'
import { Practitioner, Site, Room } from '@/store/slices/data'

export class AvailabilityEngine {
  /**
   * Find available slots across practitioners and sites with AI-powered recommendations
   */
  static findAvailableSlots(params: {
    startDate: string
    endDate: string
    duration: number // minutes
    patientId?: string
    practitionerIds?: string[]
    siteIds?: string[]
    appointmentType?: string
    patientPreferences?: {
      timeOfDay?: 'morning' | 'afternoon' | 'evening'
      dayOfWeek?: number[]
      practitionerId?: string
    }
    practitioners: Practitioner[]
    sites: Site[]
    rooms: Room[]
    existingAppointments: EnhancedAppointment[]
  }): AvailabilitySlot[] {
    
    const slots: AvailabilitySlot[] = []
    const { startDate, endDate, duration, patientPreferences, practitioners, sites, rooms, existingAppointments } = params
    
    // Filter practitioners and sites based on criteria
    const targetPractitioners = params.practitionerIds 
      ? practitioners.filter(p => params.practitionerIds!.includes(p.id))
      : practitioners
      
    const targetSites = params.siteIds
      ? sites.filter(s => params.siteIds!.includes(s.id))
      : sites
    
    // Generate time slots for each day in the range
    const current = new Date(startDate)
    const end = new Date(endDate)
    
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0]
      
      // Standard clinic hours: 9 AM to 5 PM
      const daySlots = this.generateDaySlots(dateStr, duration, {
        startHour: 9,
        endHour: 17,
        slotInterval: 15 // 15-minute intervals
      })
      
      // Check availability for each practitioner at each site
      for (const practitioner of targetPractitioners) {
        for (const site of targetSites) {
          const siteRooms = rooms.filter(r => r.siteId === site.id)
          
          for (const timeSlot of daySlots) {
            // Check for conflicts
            const conflicts = this.checkConflicts({
              start: timeSlot.start,
              end: timeSlot.end,
              practitionerId: practitioner.id,
              siteId: site.id,
              existingAppointments
            })
            
            // Find available room
            const availableRoom = this.findAvailableRoom(siteRooms, timeSlot, existingAppointments)
            
            const slot: AvailabilitySlot = {
              start: timeSlot.start,
              end: timeSlot.end,
              practitionerId: practitioner.id,
              practitionerName: practitioner.name,
              roomId: availableRoom?.id,
              roomName: availableRoom?.name,
              siteId: site.id,
              siteName: site.name,
              available: conflicts.length === 0 && !!availableRoom,
              reason: conflicts.length > 0 ? conflicts[0].message : !availableRoom ? 'No room available' : undefined
            }
            
            // Add AI recommendations
            if (slot.available && patientPreferences) {
              slot.recommendations = this.calculateRecommendationScore(slot, patientPreferences)
            }
            
            slots.push(slot)
          }
        }
      }
      
      current.setDate(current.getDate() + 1)
    }
    
    // Sort by recommendation score (highest first) for available slots
    return slots.sort((a, b) => {
      if (a.available && !b.available) return -1
      if (!a.available && b.available) return 1
      if (a.available && b.available) {
        return (b.recommendations?.score || 0) - (a.recommendations?.score || 0)
      }
      return 0
    })
  }
  
  /**
   * Check for scheduling conflicts
   */
  static checkConflicts(params: {
    start: string
    end: string
    practitionerId: string
    siteId: string
    patientId?: string
    roomId?: string
    existingAppointments: EnhancedAppointment[]
  }): AppointmentConflict[] {
    
    const conflicts: AppointmentConflict[] = []
    const { start, end, practitionerId, siteId, patientId, roomId, existingAppointments } = params
    
    const startTime = new Date(start)
    const endTime = new Date(end)
    
    for (const appointment of existingAppointments) {
      const apptStart = new Date(appointment.start)
      const apptEnd = new Date(appointment.end)
      
      // Check for time overlap
      const overlaps = startTime < apptEnd && endTime > apptStart
      
      if (overlaps) {
        // Practitioner conflict
        if (appointment.practitionerId === practitionerId) {
          conflicts.push({
            type: 'practitioner',
            conflictingId: appointment.id,
            conflictingName: appointment.practitionerName,
            severity: 'error',
            message: `${appointment.practitionerName} is already booked at this time`
          })
        }
        
        // Room conflict
        if (roomId && appointment.roomId === roomId) {
          conflicts.push({
            type: 'room',
            conflictingId: appointment.roomId,
            conflictingName: appointment.roomName || 'Unknown room',
            severity: 'error',
            message: `Room ${appointment.roomName} is already booked at this time`
          })
        }
        
        // Patient double-booking
        if (patientId && appointment.patientId === patientId) {
          conflicts.push({
            type: 'patient',
            conflictingId: appointment.patientId,
            conflictingName: appointment.patientName || 'Patient',
            severity: 'warning',
            message: `Patient already has an appointment at this time`
          })
        }
      }
    }
    
    return conflicts
  }
  
  /**
   * Generate time slots for a specific day
   */
  private static generateDaySlots(date: string, duration: number, config: {
    startHour: number
    endHour: number
    slotInterval: number
  }) {
    const slots = []
    const { startHour, endHour, slotInterval } = config
    
    // Skip weekends for now (can be made configurable)
    const dayOfWeek = new Date(date).getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return slots
    
    let currentMinute = startHour * 60
    const endMinute = endHour * 60
    
    while (currentMinute + duration <= endMinute) {
      const startHours = Math.floor(currentMinute / 60)
      const startMins = currentMinute % 60
      const endMins = currentMinute + duration
      const endHours = Math.floor(endMins / 60)
      const endMinutes = endMins % 60
      
      const start = `${date}T${startHours.toString().padStart(2, '0')}:${startMins.toString().padStart(2, '0')}:00.000Z`
      const end = `${date}T${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00.000Z`
      
      slots.push({ start, end })
      currentMinute += slotInterval
    }
    
    return slots
  }
  
  /**
   * Find an available room for the time slot
   */
  private static findAvailableRoom(rooms: Room[], timeSlot: { start: string; end: string }, existingAppointments: EnhancedAppointment[]) {
    for (const room of rooms) {
      const conflicts = this.checkConflicts({
        start: timeSlot.start,
        end: timeSlot.end,
        practitionerId: '', // Not checking practitioner here
        siteId: room.siteId,
        roomId: room.id,
        existingAppointments
      })
      
      const roomConflicts = conflicts.filter(c => c.type === 'room')
      if (roomConflicts.length === 0) {
        return room
      }
    }
    return null
  }
  
  /**
   * Calculate AI recommendation score for a time slot
   */
  private static calculateRecommendationScore(
    slot: AvailabilitySlot, 
    preferences: {
      timeOfDay?: 'morning' | 'afternoon' | 'evening'
      dayOfWeek?: number[]
      practitionerId?: string
    }
  ) {
    let score = 0.5 // Base score
    const reasons: string[] = []
    
    const slotTime = new Date(slot.start)
    const hour = slotTime.getHours()
    const dayOfWeek = slotTime.getDay()
    
    // Time of day preference
    if (preferences.timeOfDay) {
      if (preferences.timeOfDay === 'morning' && hour >= 9 && hour < 12) {
        score += 0.3
        reasons.push('Matches morning preference')
      } else if (preferences.timeOfDay === 'afternoon' && hour >= 12 && hour < 17) {
        score += 0.3
        reasons.push('Matches afternoon preference')
      } else if (preferences.timeOfDay === 'evening' && hour >= 17) {
        score += 0.3
        reasons.push('Matches evening preference')
      }
    }
    
    // Day of week preference
    if (preferences.dayOfWeek && preferences.dayOfWeek.includes(dayOfWeek)) {
      score += 0.2
      reasons.push('Preferred day of week')
    }
    
    // Practitioner preference
    if (preferences.practitionerId === slot.practitionerId) {
      score += 0.4
      reasons.push('Preferred practitioner')
    }
    
    // Optimal scheduling (mid-morning and mid-afternoon typically work best)
    if ((hour >= 10 && hour <= 11) || (hour >= 14 && hour <= 15)) {
      score += 0.1
      reasons.push('Optimal appointment time')
    }
    
    return {
      score: Math.min(score, 1.0),
      reasons,
      patientFit: score
    }
  }
}
