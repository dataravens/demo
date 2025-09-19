"use client"

import { useMemo, useState } from 'react'
import { useData } from '@/store'
import { Edit, Send, Download, Plus, Trash2, X } from 'lucide-react'

interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

interface InvoicePayment {
  id: string
  date: string
  amount: number
  method: string
  reference?: string
}

interface EnhancedInvoice {
  id: string
  patientId: string
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled'
  amount: number
  dueDate: string
  payer: string
  createdDate: string
  lineItems: InvoiceLineItem[]
  payments: InvoicePayment[]
  notes?: string
}

export default function Billing() {
  const { invoices, patients, markInvoicePaid, addInvoice, updateInvoice, services } = useData() as any
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [query, setQuery] = useState<string>('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<EnhancedInvoice | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Overdue': return 'bg-red-100 text-red-800'
      case 'Draft': return 'bg-yellow-100 text-yellow-800'
      case 'Paid': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const invoiceWithPatient = useMemo(() => {
    const list = invoices.map((inv: any) => ({
      ...inv,
      patient: patients.find((p: any) => p.id === inv.patientId)?.name || inv.patientId
    }))
    const q = query.toLowerCase().trim()
    const filtered = list.filter((row: any) => (
      (statusFilter === 'All' || row.status === statusFilter) &&
      (!q || row.patient.toLowerCase().includes(q) || (row.payer || '').toLowerCase().includes(q))
    ))
    return filtered.sort((a: any, b: any) => a.dueDate.localeCompare(b.dueDate))
  }, [invoices, patients, statusFilter, query])

  const totals = useMemo(() => {
    const sum = (rows: any[]) => rows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0)
    const overdue = invoices.filter((i: any) => i.status === 'Overdue')
    const draft = invoices.filter((i: any) => i.status === 'Draft')
    const outstanding = invoices.filter((i: any) => i.status !== 'Paid')
    const now = new Date()
    const paidThisMonth = invoices.filter((i: any) => i.status === 'Paid' && new Date(i.dueDate).getMonth() === now.getMonth() && new Date(i.dueDate).getFullYear() === now.getFullYear())
    return {
      outstanding: sum(outstanding),
      overdue: sum(overdue),
      draft: sum(draft),
      paidThisMonth: sum(paidThisMonth)
    }
  }, [invoices])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <div className="flex items-center space-x-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient or payer..."
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option>All</option>
            <option>Overdue</option>
            <option>Draft</option>
            <option>Sent</option>
            <option>Paid</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            Export
          </button>
          <button 
            onClick={() => openInvoiceEditor()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            New Invoice
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-sm text-gray-500 mb-1">Total Outstanding</h3>
          <p className="text-2xl font-bold text-gray-900">£{totals.outstanding.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-sm text-gray-500 mb-1">Overdue</h3>
          <p className="text-2xl font-bold text-red-600">£{totals.overdue.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-sm text-gray-500 mb-1">Draft</h3>
          <p className="text-2xl font-bold text-yellow-600">£{totals.draft.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-sm text-gray-500 mb-1">Paid This Month</h3>
          <p className="text-2xl font-bold text-green-600">£{totals.paidThisMonth.toFixed(2)}</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-500">
            <div>Invoice ID</div>
            <div>Patient</div>
            <div>Status</div>
            <div>Amount</div>
            <div>Due Date</div>
            <div>Payer</div>
            <div>Actions</div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-500">
            <div>Invoice ID</div>
            <div>Patient</div>
            <div>Status</div>
            <div>Amount</div>
            <div>Due Date</div>
            <div>Payer</div>
            <div>Actions</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {invoiceWithPatient.map((invoice: any) => (
            <div key={invoice.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="grid grid-cols-7 gap-4 text-sm items-center">
                <div className="font-medium text-blue-600">{invoice.id}</div>
                <div className="text-gray-900">{invoice.patient}</div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                  {invoice.status !== 'Paid' && (
                    <button
                      onClick={() => markInvoicePaid(invoice.id)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Mark paid
                    </button>
                  )}
                </div>
                <div className="font-medium">£{Number(invoice.amount).toFixed(2)}</div>
                <div className="text-gray-600">{invoice.dueDate}</div>
                <div className="text-gray-600">{invoice.payer}</div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openInvoiceEditor(invoice)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {invoice.status === 'Draft' && (
                    <button
                      onClick={() => sendInvoice(invoice.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => exportInvoice(invoice.id)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Invoice Editor Modal */}
      {editorOpen && (
        <InvoiceEditorModal 
          invoice={editingInvoice}
          patients={patients}
          services={services}
          onSave={handleSaveInvoice}
          onClose={closeInvoiceEditor}
        />
      )}
    </div>
  )
  
  function openInvoiceEditor(invoice?: any) {
    if (invoice) {
      // Convert existing invoice to enhanced format
      const enhanced: EnhancedInvoice = {
        ...invoice,
        createdDate: invoice.createdDate || new Date().toISOString().split('T')[0],
        lineItems: invoice.lineItems || [{
          id: '1',
          description: 'Consultation',
          quantity: 1,
          rate: invoice.amount || 120,
          amount: invoice.amount || 120
        }],
        payments: invoice.payments || [],
        notes: invoice.notes || ''
      }
      setEditingInvoice(enhanced)
    } else {
      // Create new invoice template
      const newInvoice: EnhancedInvoice = {
        id: `INV-${Date.now()}`,
        patientId: patients[0]?.id || '',
        status: 'Draft',
        amount: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        payer: 'Self-pay',
        createdDate: new Date().toISOString().split('T')[0],
        lineItems: [],
        payments: [],
        notes: ''
      }
      setEditingInvoice(newInvoice)
    }
    setEditorOpen(true)
  }
  
  function closeInvoiceEditor() {
    setEditorOpen(false)
    setEditingInvoice(null)
  }
  
  function handleSaveInvoice(invoice: EnhancedInvoice) {
    if (invoices.find((i: any) => i.id === invoice.id)) {
      updateInvoice(invoice.id, invoice)
    } else {
      addInvoice(invoice)
    }
    closeInvoiceEditor()
  }
  
  function sendInvoice(invoiceId: string) {
    updateInvoice(invoiceId, { status: 'Sent' })
    // In real app, would trigger email/SMS sending
    alert('Invoice sent successfully')
  }
  
  function exportInvoice(invoiceId: string) {
    // In real app, would generate PDF and trigger download
    alert('Invoice exported as PDF')
  }
}

// Invoice Editor Modal Component
function InvoiceEditorModal({ invoice, patients, services, onSave, onClose }: {
  invoice: EnhancedInvoice | null
  patients: any[]
  services: any[]
  onSave: (invoice: EnhancedInvoice) => void
  onClose: () => void
}) {
  const [editData, setEditData] = useState<EnhancedInvoice>(invoice || {
    id: `INV-${Date.now()}`,
    patientId: patients[0]?.id || '',
    status: 'Draft',
    amount: 0,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payer: 'Self-pay',
    createdDate: new Date().toISOString().split('T')[0],
    lineItems: [],
    payments: [],
    notes: ''
  })
  
  const [activeTab, setActiveTab] = useState('details')
  
  const selectedPatient = patients.find(p => p.id === editData.patientId)
  
  // Recalculate totals when line items change
  const subtotal = editData.lineItems.reduce((sum, item) => sum + item.amount, 0)
  const totalPaid = editData.payments.reduce((sum, payment) => sum + payment.amount, 0)
  const balance = subtotal - totalPaid
  
  // Update amount when line items change
  if (editData.amount !== subtotal) {
    setEditData(prev => ({ ...prev, amount: subtotal }))
  }
  
  function addLineItem() {
    const newItem: InvoiceLineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    }
    setEditData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }))
  }
  
  function updateLineItem(id: string, updates: Partial<InvoiceLineItem>) {
    setEditData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updates }
          // Recalculate amount when quantity or rate changes
          if ('quantity' in updates || 'rate' in updates) {
            updated.amount = updated.quantity * updated.rate
          }
          return updated
        }
        return item
      })
    }))
  }
  
  function removeLineItem(id: string) {
    setEditData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id)
    }))
  }
  
  function addPayment() {
    const newPayment: InvoicePayment = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      amount: balance > 0 ? balance : 0,
      method: 'Bank Transfer'
    }
    setEditData(prev => ({
      ...prev,
      payments: [...prev.payments, newPayment]
    }))
  }
  
  function updatePayment(id: string, updates: Partial<InvoicePayment>) {
    setEditData(prev => ({
      ...prev,
      payments: prev.payments.map(payment => 
        payment.id === id ? { ...payment, ...updates } : payment
      )
    }))
  }
  
  function removePayment(id: string) {
    setEditData(prev => ({
      ...prev,
      payments: prev.payments.filter(payment => payment.id !== id)
    }))
  }
  
  // Auto-update status based on payments
  const newStatus = balance <= 0 && editData.payments.length > 0 ? 'Paid' : editData.status
  if (newStatus !== editData.status) {
    setEditData(prev => ({ ...prev, status: newStatus as any }))
  }
  
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {invoice ? 'Edit Invoice' : 'New Invoice'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {editData.id} {selectedPatient && `• ${selectedPatient.name}`}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            {[{ id: 'details', label: 'Details' }, { id: 'payments', label: 'Payments' }].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Basic Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Patient</label>
                  <select
                    value={editData.patientId}
                    onChange={(e) => setEditData(prev => ({ ...prev, patientId: e.target.value }))}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>{patient.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={editData.dueDate}
                    onChange={(e) => setEditData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Payer</label>
                  <select
                    value={editData.payer}
                    onChange={(e) => setEditData(prev => ({ ...prev, payer: e.target.value }))}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="Self-pay">Self-pay</option>
                    <option value="Bupa">Bupa</option>
                    <option value="AXA">AXA</option>
                    <option value="Aviva">Aviva</option>
                  </select>
                </div>
              </div>
              
              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
                  <button
                    onClick={addLineItem}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 grid grid-cols-6 gap-3 text-sm font-medium text-gray-700">
                    <div className="col-span-2">Description</div>
                    <div>Qty</div>
                    <div>Rate</div>
                    <div>Amount</div>
                    <div></div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {editData.lineItems.map(item => (
                      <div key={item.id} className="px-4 py-3 grid grid-cols-6 gap-3 items-center">
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                            placeholder="Service description"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, { quantity: Number(e.target.value) })}
                            min="1"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateLineItem(item.id, { rate: Number(e.target.value) })}
                            min="0"
                            step="0.01"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div className="font-medium">£{item.amount.toFixed(2)}</div>
                        <div>
                          <button
                            onClick={() => removeLineItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {editData.lineItems.length === 0 && (
                      <div className="px-4 py-8 text-center text-gray-500">
                        No line items added
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Totals */}
                <div className="mt-4 flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span className="font-medium">£{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Paid:</span>
                      <span className="font-medium text-green-600">£{totalPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span>Balance:</span>
                      <span className={balance > 0 ? 'text-red-600' : 'text-green-600'}>
                        £{balance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Internal notes..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Payments</h3>
                <button
                  onClick={addPayment}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Payment
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 grid grid-cols-5 gap-3 text-sm font-medium text-gray-700">
                  <div>Date</div>
                  <div>Amount</div>
                  <div>Method</div>
                  <div>Reference</div>
                  <div></div>
                </div>
                <div className="divide-y divide-gray-200">
                  {editData.payments.map(payment => (
                    <div key={payment.id} className="px-4 py-3 grid grid-cols-5 gap-3 items-center">
                      <div>
                        <input
                          type="date"
                          value={payment.date}
                          onChange={(e) => updatePayment(payment.id, { date: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={payment.amount}
                          onChange={(e) => updatePayment(payment.id, { amount: Number(e.target.value) })}
                          min="0"
                          step="0.01"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <select
                          value={payment.method}
                          onChange={(e) => updatePayment(payment.id, { method: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Card Payment">Card Payment</option>
                          <option value="Cash">Cash</option>
                          <option value="Cheque">Cheque</option>
                          <option value="Insurance">Insurance</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={payment.reference || ''}
                          onChange={(e) => updatePayment(payment.id, { reference: e.target.value })}
                          placeholder="Reference"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <button
                          onClick={() => removePayment(payment.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {editData.payments.length === 0 && (
                    <div className="px-4 py-8 text-center text-gray-500">
                      No payments recorded
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Status: <span className="font-medium">{editData.status}</span> • 
            Balance: <span className="font-medium">£{balance.toFixed(2)}</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(editData)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
