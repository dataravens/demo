'use client'

import { useState } from 'react'
import { X, HelpCircle, ChevronRight } from 'lucide-react'
import { Plan, ClarificationQuestion } from '@/types/core'

interface ClarificationModalProps {
  isOpen: boolean
  onClose: () => void
  plan: Plan
  onSubmit: (answers: Record<string, any>) => void
}

export default function ClarificationModal({ isOpen, onClose, plan, onSubmit }: ClarificationModalProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !plan.needsClarification || !plan.clarificationQuestions) return null

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmit = async () => {
    // Validate required questions
    const missingRequired = plan.clarificationQuestions?.filter(q => 
      q.required && !answers[q.id]
    ) || []

    if (missingRequired.length > 0) {
      alert(`Please answer all required questions: ${missingRequired.map(q => q.question).join(', ')}`)
      return
    }

    setIsSubmitting(true)
    await onSubmit(answers)
    setIsSubmitting(false)
    onClose()
  }

  const renderQuestion = (question: ClarificationQuestion) => {
    switch (question.type) {
      case 'single_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  onChange={(e) => {
                    const currentAnswers = answers[question.id] || []
                    if (e.target.checked) {
                      handleAnswerChange(question.id, [...currentAnswers, option])
                    } else {
                      handleAnswerChange(question.id, currentAnswers.filter((a: string) => a !== option))
                    }
                  }}
                  className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'text_input':
        return (
          <input
            type="text"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        )

      case 'date_picker':
        return (
          <input
            type="datetime-local"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        )

      default:
        return <div className="text-gray-500">Unsupported question type</div>
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <HelpCircle className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">I need a bit more info...</h2>
              <p className="text-sm text-gray-600">Help me understand what you want to do</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Original Command */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-cyan-400">
            <p className="text-sm font-medium text-gray-700 mb-1">Your command:</p>
            <p className="text-gray-900 font-mono text-sm">"{plan.originalCommand}"</p>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {plan.clarificationQuestions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderQuestion(question)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">
            <span className="text-red-500">*</span> Required fields
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating plan...</span>
                </>
              ) : (
                <>
                  <span>Create Plan</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
