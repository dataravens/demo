'use client'
import Link from 'next/link'
import { useData } from '@/store'
import { useMemo, useState } from 'react'

export default function Patients() {
  const { patients } = useData()
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<'name' | 'dob' | 'insurer'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    const base = q
      ? patients.filter(p =>
          p.name.toLowerCase().includes(q) ||
          (p.insurer || '').toLowerCase().includes(q)
        )
      : patients
    const sorted = [...base].sort((a, b) => {
      let av: string = ''
      let bv: string = ''
      if (sortKey === 'name') { av = a.name; bv = b.name }
      if (sortKey === 'dob') { av = a.dob; bv = b.dob }
      if (sortKey === 'insurer') { av = a.insurer; bv = b.insurer }
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return sorted
  }, [patients, query, sortKey, sortDir])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <div className="flex items-center space-x-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or insurer..."
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <select
            value={`${sortKey}:${sortDir}`}
            onChange={(e) => {
              const [k, d] = e.target.value.split(':') as any
              setSortKey(k)
              setSortDir(d)
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="name:asc">Name (A-Z)</option>
            <option value="name:desc">Name (Z-A)</option>
            <option value="dob:asc">DOB (oldest)</option>
            <option value="dob:desc">DOB (youngest)</option>
            <option value="insurer:asc">Insurer (A-Z)</option>
            <option value="insurer:desc">Insurer (Z-A)</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
            Add Patient
          </button>
        </div>
      </div>
      
      {/* Patients Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-500">
            <div>Name</div>
            <div>Date of Birth</div>
            <div>Phone</div>
            <div>Insurer</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filtered.map(patient => (
            <Link 
              key={patient.id} 
              href={`/patients/${patient.id}`}
              className="block px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="font-medium text-gray-900">{patient.name}</div>
                <div className="text-gray-600">{patient.dob}</div>
                <div className="text-gray-600">{patient.phone}</div>
                <div className="text-gray-600">{patient.insurer}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
