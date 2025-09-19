'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useData } from '@/store'
import { ArrowLeft, Phone, Mail, MapPin, Calendar, FileText, CreditCard, MessageCircle, CheckSquare } from 'lucide-react'

export default function PatientDetail({ params }: { params: { id: string } }) {
  const { patients, appointments, invoices, notes, documents, tasks, messages } = useData() as any
  const [activeTab, setActiveTab] = useState('summary')
  
  // Find patient and related data
  const patient = patients.find((p: any) => p.id === params.id) || {
    id: params.id,
    name: 'Amelia Ali',
    dob: '1987-03-14',
    phone: '+44 20 7946 0123',
    insurer: 'Bupa',
    email: 'amelia.ali@email.com',
    address: '123 Harley Street, London, W1G 7JU',
    preferences: {
      communication: 'email',
      appointmentTime: 'morning',
      reminders: true
    },
    riskFactors: ['diabetes', 'family_history_heart']
  }
  
  const patientAppointments = appointments.filter((a: any) => a.patientId === params.id)
  const patientInvoices = invoices.filter((i: any) => i.patientId === params.id)
  const patientNotes = notes.filter((n: any) => n.patientId === params.id)
  const patientDocs = documents.filter((d: any) => d.patientId === params.id)
  const patientTasks = tasks.filter((t: any) => t.patientId === params.id)
  const patientMessages = messages.filter((m: any) => m.to === patient.phone || m.to === patient.email)
  
  const tabs = [
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'invoices', label: 'Invoices', icon: CreditCard },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'communications', label: 'Communications', icon: MessageCircle },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare }
  ]
  
  return (
    <div className="p-6">
      {/* Back Navigation */}
      <div className="mb-4">
        <Link href="/patients" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Patients
        </Link>
      </div>

      {/* Patient Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{patient.name}</h1>
            <div className="flex items-center text-sm text-gray-600 space-x-4">
              <span>DOB: {new Date(patient.dob).toLocaleDateString('en-GB')}</span>
              <span>•</span>
              <span>{patient.insurer}</span>
              <span>•</span>
              <span>ID: {patient.id}</span>
            </div>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-1" />
                {patient.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-1" />
                {patient.email}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
              New Appointment
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
              Send Message
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              Edit Patient
            </button>
          </div>
        </div>
      </div>

      {/* Patient Record Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center pb-2 text-sm font-medium border-b-2 transition-colors ${
                  isActive 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {renderTabContent(activeTab, patient, patientAppointments, patientInvoices, patientNotes, patientDocs, patientTasks, patientMessages)}
      </div>
    </div>
  )
}

function renderTabContent(tab: string, patient: any, appointments: any[], invoices: any[], notes: any[], documents: any[], tasks: any[], messages: any[]) {
  switch (tab) {
    case 'summary':
      return <SummaryTab patient={patient} />
    case 'appointments':
      return <AppointmentsTab appointments={appointments} />
    case 'invoices':
      return <InvoicesTab invoices={invoices} />
    case 'notes':
      return <NotesTab notes={notes} />
    case 'documents':
      return <DocumentsTab documents={documents} />
    case 'communications':
      return <CommunicationsTab messages={messages} />
    case 'tasks':
      return <TasksTab tasks={tasks} />
    default:
      return <SummaryTab patient={patient} />
  }
}

function SummaryTab({ patient }: { patient: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Demographics</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Date of Birth</label>
              <p className="font-medium">{new Date(patient.dob).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Age</label>
              <p className="font-medium">{Math.floor((new Date().getTime() - new Date(patient.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Patient ID</label>
              <p className="font-medium font-mono">{patient.id}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Contact Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Phone</label>
              <p className="font-medium">{patient.phone}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{patient.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Address</label>
              <p className="font-medium">{patient.address}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Insurance</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Primary Insurer</label>
              <p className="font-medium">{patient.insurer}</p>
            </div>
            {patient.insuranceExpiry && (
              <div>
                <label className="text-sm text-gray-500">Policy Expiry</label>
                <p className="font-medium">{new Date(patient.insuranceExpiry).toLocaleDateString('en-GB')}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Preferences</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Communication</label>
              <p className="font-medium capitalize">{patient.preferences?.communication}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Preferred Time</label>
              <p className="font-medium capitalize">{patient.preferences?.appointmentTime}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Reminders</label>
              <p className="font-medium">{patient.preferences?.reminders ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
        </div>
        
        {patient.riskFactors && patient.riskFactors.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-orange-900">Risk Factors</h2>
            <div className="space-y-2">
              {patient.riskFactors.map((factor: string, index: number) => (
                <span key={index} className="inline-block bg-orange-100 text-orange-800 px-2 py-1 text-xs rounded-full mr-2 mb-2">
                  {factor.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AppointmentsTab({ appointments }: { appointments: any[] }) {
  const now = new Date()
  const upcoming = appointments.filter(a => new Date(a.start) >= now).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  const past = appointments.filter(a => new Date(a.start) < now).sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
          Book New Appointment
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Upcoming ({upcoming.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {upcoming.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No upcoming appointments
              </div>
            ) : (
              upcoming.map(apt => (
                <div key={apt.id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{new Date(apt.start).toLocaleDateString('en-GB')}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(apt.start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        {' - '}
                        {new Date(apt.end).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </p>
                      <p className="text-sm text-gray-600">{apt.practitionerName || apt.clinician}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      apt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {apt.status || 'Scheduled'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Past Appointments ({past.length})</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {past.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No past appointments
              </div>
            ) : (
              past.map(apt => (
                <div key={apt.id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{new Date(apt.start).toLocaleDateString('en-GB')}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(apt.start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        {' - '}
                        {new Date(apt.end).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </p>
                      <p className="text-sm text-gray-600">{apt.practitionerName || apt.clinician}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                      apt.status === 'dna' ? 'bg-red-100 text-red-800' :
                      apt.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {apt.status || 'Completed'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InvoicesTab({ invoices }: { invoices: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
          Create Invoice
        </button>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-500">
            <div>Invoice #</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Due Date</div>
            <div>Payer</div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {invoices.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No invoices found
            </div>
          ) : (
            invoices.map(invoice => (
              <div key={invoice.id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer">
                <div className="grid grid-cols-5 gap-4 text-sm">
                  <div className="font-medium font-mono">{invoice.id}</div>
                  <div className="font-medium">£{invoice.amount.toFixed(2)}</div>
                  <div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                      invoice.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="text-gray-600">{new Date(invoice.dueDate).toLocaleDateString('en-GB')}</div>
                  <div className="text-gray-600">{invoice.payer}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function NotesTab({ notes }: { notes: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Clinical Notes</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
          Add Note
        </button>
      </div>
      
      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            No clinical notes recorded
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    note.type === 'consultation' ? 'bg-blue-100 text-blue-800' :
                    note.type === 'lab' ? 'bg-green-100 text-green-800' :
                    note.type === 'referral' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {note.type}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{note.author}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(note.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{note.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function DocumentsTab({ documents }: { documents: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
          Upload Document
        </button>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-500">
            <div>Document Name</div>
            <div>Type</div>
            <div>Actions</div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {documents.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No documents uploaded
            </div>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="px-6 py-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="font-medium">{doc.title}</div>
                  <div className="text-gray-600">{doc.type}</div>
                  <div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm mr-3">View</button>
                    <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function CommunicationsTab({ messages }: { messages: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Communications</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
          Send Message
        </button>
      </div>
      
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            No communications history
          </div>
        ) : (
          messages.map(message => (
            <div key={message.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    message.status === 'sent' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {message.status}
                  </span>
                  <span className="text-sm text-gray-600">To: {message.to}</span>
                </div>
              </div>
              <p className="text-gray-700">{message.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function TasksTab({ tasks }: { tasks: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
          Create Task
        </button>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-500">
            <div>Task</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {tasks.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No tasks assigned
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="px-6 py-4">
                <div className="grid grid-cols-3 gap-4 text-sm items-center">
                  <div className="font-medium">{task.title}</div>
                  <div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'done' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div>
                    {task.status !== 'done' && (
                      <button className="text-green-600 hover:text-green-800 text-sm mr-3">Complete</button>
                    )}
                    <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
