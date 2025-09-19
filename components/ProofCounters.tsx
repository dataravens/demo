'use client'

import { useState, useEffect } from 'react'
import { Clock, Zap, DollarSign, Shield, TrendingUp } from 'lucide-react'

interface CounterProps {
  icon: React.ReactNode
  label: string
  value: string | number
  change?: string
  color: string
}

function Counter({ icon, label, value, change, color }: CounterProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        {change && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}

export default function ProofCounters() {
  const [counters, setCounters] = useState([
    {
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      label: 'Minutes saved today',
      value: 0,
      target: 127,
      change: '+23%',
      color: 'bg-blue-50'
    },
    {
      icon: <Zap className="w-5 h-5 text-green-600" />,
      label: 'Actions executed',
      value: 0,
      target: 34,
      change: '+12',
      color: 'bg-green-50'
    },
    {
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      label: 'Revenue recovered',
      value: '£0',
      target: '£2,340',
      change: '+£540',
      color: 'bg-emerald-50'
    },
    {
      icon: <Shield className="w-5 h-5 text-purple-600" />,
      label: 'Errors prevented',
      value: 0,
      target: 8,
      change: '+3',
      color: 'bg-purple-50'
    }
  ])

  // Animate counters on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setCounters(prev => prev.map(counter => ({
        ...counter,
        value: counter.target
      })))
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Increment counters gradually for demo effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCounters(prev => prev.map(counter => {
        if (typeof counter.value === 'number' && counter.value < counter.target) {
          return {
            ...counter,
            value: Math.min(counter.value + Math.ceil((counter.target - counter.value) / 10), counter.target)
          }
        }
        if (typeof counter.value === 'string' && counter.value === '£0') {
          const currentNum = parseInt(counter.value.replace('£', '').replace(',', '')) || 0
          const targetNum = parseInt(counter.target.replace('£', '').replace(',', ''))
          if (currentNum < targetNum) {
            const increment = Math.ceil((targetNum - currentNum) / 10)
            const newValue = Math.min(currentNum + increment, targetNum)
            return {
              ...counter,
              value: `£${newValue.toLocaleString()}`
            }
          }
        }
        return counter
      }))
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Today's Impact</h2>
          <p className="text-sm text-gray-600">AI-driven practice optimization</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span className="font-medium">↗ All metrics trending up</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {counters.map((counter, index) => (
          <Counter
            key={index}
            icon={counter.icon}
            label={counter.label}
            value={counter.value}
            change={counter.change}
            color={counter.color}
          />
        ))}
      </div>
    </div>
  )
}
