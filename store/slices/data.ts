import { StateCreator } from 'zustand'

// Types for data entities
export interface Patient {
  id: string
  name: string
  dob: string
  phone: string
  insurer: string
  insuranceExpiry?: string
  lastSeen?: string
  preferences?: {
    communication: 'email' | 'sms' | 'phone'
    appointmentTime: 'morning' | 'afternoon' | 'evening'
    reminders: boolean
  }
  riskFactors?: string[]
  nextDue?: string
}

export interface Appointment {
  id: string
  patientId: string
  start: string
  end: string
  // Legacy fields for early demo pages
  clinician?: string
  room?: string
  // Enhanced calendar fields
  practitionerId?: string
  practitionerName?: string
  roomId?: string
  roomName?: string
  siteId?: string
  siteName?: string
  appointmentType?: string
  status?: 'scheduled' | 'confirmed' | 'arrived' | 'dna' | 'completed' | 'cancelled'
  notes?: string
}

export interface Invoice {
  id: string
  patientId: string
  status: string
  amount: number
  dueDate: string
  payer: string
}

export interface Clinician {
  id: string
  name: string
  role: 'GP' | 'Nurse' | 'Admin' | 'Specialist'
  email?: string
}

export interface Service {
  code: string
  name: string
  price: number
}

export interface Note {
  id: string
  patientId: string
  author: string
  createdAt: string
  type: 'consultation' | 'lab' | 'referral' | 'admin'
  text: string
}

export interface Practitioner {
  id: string
  name: string
  title: string
  specialty: string
  color: string
}

export interface Site {
  id: string
  name: string
  address: string
}

export interface Room {
  siteId: string
  id: string
  name: string
}

export interface DataSlice {
  patients: Patient[]
  appointments: Appointment[]
  invoices: Invoice[]
  clinicians: Clinician[]
  services: Service[]
  notes: Note[]
  practitioners: Practitioner[]
  sites: Site[]
  rooms: Room[]
  documents: { id: string; patientId: string; title: string; type: string }[]
  tasks: { id: string; patientId?: string; title: string; status: 'open' | 'done' }[]
  messages: { id: string; to: string; body: string; status: 'draft' | 'sent' }[]
  mutationLocked?: boolean
  
  // Actions
  addPatient: (patient: Patient) => void
  updatePatient: (id: string, updates: Partial<Patient>) => void
  addAppointment: (appointment: Appointment) => void
  updateAppointment: (id: string, updates: Partial<Appointment>) => void
  removeAppointment: (id: string) => void
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (id: string, updates: Partial<Invoice>) => void
  markInvoicePaid: (id: string) => void
  addNote: (note: Note) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  removeNote: (id: string) => void
  addClinician: (clinician: Clinician) => void
  addService: (service: Service) => void
  addDocument: (doc: { id: string; patientId: string; title: string; type: string }) => void
  removeDocument: (id: string) => void
  addTask: (task: { id: string; patientId?: string; title: string }) => void
  completeTask: (id: string) => void
  removeTask: (id: string) => void
  addMessage: (msg: { id: string; to: string; body: string; status?: 'draft' | 'sent' }) => void
  removeMessage: (id: string) => void
  loadDemoData: () => void
  loadFromJson: () => Promise<void>
  setMutationLocked: (locked: boolean) => void
}

// Demo seed data (enhanced with richer context for AI suggestions)
const DEMO_PATIENTS: Patient[] = [
  { 
    id: "p1", 
    name: "Amelia Ali", 
    dob: "1987-03-14", 
    phone: "+44...", 
    insurer: "Bupa",
    insuranceExpiry: "2025-12-31",
    lastSeen: "2024-08-15",
    preferences: {
      communication: 'email',
      appointmentTime: 'morning',
      reminders: true
    },
    riskFactors: ['diabetes', 'family_history_heart'],
    nextDue: "6-month-checkup"
  },
  { 
    id: "p2", 
    name: "Sarah Jones", 
    dob: "1994-09-10", 
    phone: "+44...", 
    insurer: "Self-pay",
    insuranceExpiry: null as unknown as string,
    lastSeen: "2024-09-10",
    preferences: {
      communication: 'sms',
      appointmentTime: 'afternoon',
      reminders: true
    },
    riskFactors: [],
    nextDue: "annual-screening"
  },
  { 
    id: "p3", 
    name: "Mrs Smith", 
    dob: "1963-01-22", 
    phone: "+44...", 
    insurer: "AXA",
    insuranceExpiry: "2025-03-15",
    lastSeen: "2024-03-10", // 6+ months ago
    preferences: {
      communication: 'phone',
      appointmentTime: 'morning',
      reminders: false
    },
    riskFactors: ['hypertension', 'osteoporosis'],
    nextDue: "6-month-checkup"
  }
]

const DEMO_APPOINTMENTS: Appointment[] = [
  { id: "a1", patientId: "p1", start: "2025-09-11T10:00:00Z", end: "2025-09-11T10:30:00Z", clinician: "Dr Patel", room: "1" },
  { id: "a2", patientId: "p2", start: "2025-09-12T09:30:00Z", end: "2025-09-12T10:00:00Z", clinician: "Dr Patel", room: "2" }
]

const DEMO_INVOICES: Invoice[] = [
  { id: "inv-101", patientId: "p1", status: "Overdue", amount: 220.0, dueDate: "2025-09-20", payer: "Bupa" },
  { id: "inv-102", patientId: "p2", status: "Draft", amount: 145.0, dueDate: "2025-09-25", payer: "Self-pay" }
]

const DEMO_CLINICIANS: Clinician[] = [
  { id: 'c1', name: 'Dr Patel', role: 'GP', email: 'patel@example.com' },
  { id: 'c2', name: 'Nurse Lee', role: 'Nurse', email: 'lee@example.com' },
  { id: 'c3', name: 'Dr Jones', role: 'Specialist', email: 'jones@example.com' }
]

const DEMO_SERVICES: Service[] = [
  { code: 'CONS', name: 'Consultation', price: 120 },
  { code: 'FUP', name: 'Follow-up', price: 80 },
  { code: 'LAB-HBA1C', name: 'HbA1c Test', price: 35 }
]

const DEMO_NOTES: Note[] = [
  { id: 'n1', patientId: 'p1', author: 'Dr Patel', createdAt: new Date().toISOString(), type: 'consultation', text: 'Routine consultation. Discussed lifestyle and medication adherence.' },
  { id: 'n2', patientId: 'p3', author: 'Dr Patel', createdAt: new Date(Date.now() - 86400000).toISOString(), type: 'referral', text: 'Referred to Dr Jones for specialist review.' }
]

export const createDataSlice: StateCreator<DataSlice> = (set, get) => ({
  patients: [...DEMO_PATIENTS],
  appointments: [...DEMO_APPOINTMENTS],
  invoices: [...DEMO_INVOICES],
  clinicians: [...DEMO_CLINICIANS],
  services: [...DEMO_SERVICES],
  notes: [...DEMO_NOTES],
  practitioners: [
    { id: 'prac1', name: 'Dr Sarah Patel', speciality: 'General Practice', siteId: 'site1' },
    { id: 'prac2', name: 'Dr James Wilson', speciality: 'Cardiology', siteId: 'site1' },
    { id: 'prac3', name: 'Dr Emma Thompson', speciality: 'Dermatology', siteId: 'site2' },
    { id: 'prac4', name: 'Dr Michael Chen', speciality: 'General Practice', siteId: 'site1' },
    { id: 'prac5', name: 'Dr Lisa Rodriguez', speciality: 'Mental Health', siteId: 'site2' }
  ],
  sites: [
    { id: 'site1', name: 'Main Clinic', address: '123 Health Street, London' },
    { id: 'site2', name: 'City Branch', address: '456 Medical Avenue, London' },
    { id: 'site3', name: 'Wellness Center', address: '789 Care Road, London' }
  ],
  rooms: [
    { id: 'room1', name: 'Consultation Room 1', siteId: 'site1' },
    { id: 'room2', name: 'Consultation Room 2', siteId: 'site1' },
    { id: 'room3', name: 'Treatment Room', siteId: 'site1' },
    { id: 'room4', name: 'Procedure Room', siteId: 'site1' },
    { id: 'room5', name: 'Consultation Room A', siteId: 'site2' },
    { id: 'room6', name: 'Consultation Room B', siteId: 'site2' },
    { id: 'room7', name: 'Therapy Room', siteId: 'site2' }
  ],
  documents: [],
  tasks: [],
  messages: [],
  mutationLocked: false,

  addPatient: (patient) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({ patients: [...state.patients, patient] }))
  },
  updatePatient: (id, updates) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({
      patients: state.patients.map(patient => 
        patient.id === id ? { ...patient, ...updates } : patient
      )
    }))
  },

  addAppointment: (appointment) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({ appointments: [...state.appointments, appointment] }))
  },
  updateAppointment: (id, updates) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({
      appointments: state.appointments.map(appointment => 
        appointment.id === id ? { ...appointment, ...updates } : appointment
      )
    }))
  },
  removeAppointment: (id) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({ appointments: state.appointments.filter(a => a.id !== id) }))
  },

  addInvoice: (invoice) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({ invoices: [...state.invoices, invoice] }))
  },
  updateInvoice: (id, updates) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({
      invoices: state.invoices.map(invoice => 
        invoice.id === id ? { ...invoice, ...updates } : invoice
      )
    }))
  },
  markInvoicePaid: (id) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({
      invoices: state.invoices.map(inv => inv.id === id ? { ...inv, status: 'Paid' } : inv)
    }))
  },

  addNote: (note) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({ notes: [...state.notes, note] }))
  },
  updateNote: (id, updates) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({
      notes: state.notes.map(n => n.id === id ? { ...n, ...updates } : n)
    }))
  },
  removeNote: (id) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({ notes: state.notes.filter(n => n.id !== id) }))
  },

  addClinician: (clinician) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({ clinicians: [...state.clinicians, clinician] }))
  },
  addService: (service) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({ services: [...state.services, service] }))
  },

  addDocument: (doc) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({ documents: [...state.documents, doc] }))
  },
  removeDocument: (id) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({ documents: state.documents.filter(d => d.id !== id) }))
  },
  addTask: (task) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({ tasks: [...state.tasks, { ...task, status: 'open' }] }))
  },
  completeTask: (id) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({ tasks: state.tasks.map(t => t.id === id ? { ...t, status: 'done' } : t) }))
  },
  removeTask: (id) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({ tasks: state.tasks.filter(t => t.id !== id) }))
  },
  addMessage: (msg) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({ messages: [...state.messages, { ...msg, status: msg.status || 'draft' }] }))
  },
  removeMessage: (id) => {
    if ((get() as any).mutationLocked) return
    set((state) => ({ messages: state.messages.filter(m => m.id !== id) }))
  },

  loadDemoData: () => {
    set({
      patients: [...DEMO_PATIENTS],
      appointments: [...DEMO_APPOINTMENTS],
      invoices: [...DEMO_INVOICES],
      clinicians: [...DEMO_CLINICIANS],
      services: [...DEMO_SERVICES],
      notes: [...DEMO_NOTES],
      documents: [],
      tasks: [],
      messages: [],
    })
  },
  loadFromJson: async () => {
    try {
      const [patientsRes, apptsRes, invoicesRes, practitionersRes, sitesRes, roomsRes] = await Promise.all([
        fetch('/data/patients.json'),
        fetch('/data/appointments.json'),
        fetch('/data/invoices.json'),
        fetch('/data/practitioners.json'),
        fetch('/data/sites.json'),
        fetch('/data/rooms.json'),
      ])
      const [patients, appointments, invoices, practitioners, sites, rooms] = await Promise.all([
        patientsRes.json(), apptsRes.json(), invoicesRes.json(), 
        practitionersRes.json(), sitesRes.json(), roomsRes.json()
      ])
      set({ patients, appointments, invoices, practitioners, sites, rooms })
    } catch (e) {
      console.warn('Failed to load JSON seeds, using in-memory defaults', e)
    }
  },
  setMutationLocked: (locked) => set({ mutationLocked: locked })
})
