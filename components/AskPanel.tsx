'use client'

import { useState } from 'react'
import { askQuestion, EXAMPLE_QUESTIONS, AskResponse as AskResponseType } from '@/services/ask-engine'
import AskResponse from '@/components/AskResponse'
import { MessageSquare, Sparkles, Send, RotateCcw } from 'lucide-react'

interface AskPanelProps {
  title?: string
  placeholder?: string
  showExamples?: boolean
  className?: string
}

export default function AskPanel({ 
  title = "Ask Your Data", 
  placeholder = "What would you like to know about your practice?",
  showExamples = true,
  className = ""
}: AskPanelProps) {
  const [question, setQuestion] = useState('')
  const [responses, setResponses] = useState<AskResponseType[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (questionText: string = question) => {
    if (!questionText.trim() || isLoading) return
    
    setIsLoading(true)
    try {
      const response = await askQuestion(questionText)
      setResponses(prev => [response, ...prev])
      setQuestion('')
    } catch (error) {
      console.error('Failed to ask question:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExampleClick = (exampleQuestion: string) => {
    setQuestion(exampleQuestion)
    handleSubmit(exampleQuestion)
  }

  const clearResponses = () => {
    setResponses([])
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <MessageSquare className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">Get insights from your practice data</p>
          </div>
        </div>
        {responses.length > 0 && (
          <button
            onClick={clearResponses}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Input */}
      <div className="relative">
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-400/30 via-blue-300/20 to-cyan-400/30 blur-sm opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity" />
        <div className="relative flex items-center gap-3 rounded-xl border border-cyan-200/60 bg-white/90 backdrop-blur px-4 py-3 shadow-[0_0_0_1px_rgba(103,232,249,0.25)] hover:shadow-[0_0_0_2px_rgba(34,211,238,0.35)] focus-within:ring-2 focus-within:ring-cyan-400">
          <div className="flex items-center gap-2 text-cyan-700">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wide">ASK</span>
          </div>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 bg-transparent outline-none placeholder:text-cyan-700/60 text-sm disabled:opacity-50"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!question.trim() || isLoading}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Example Questions */}
      {showExamples && responses.length === 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Try asking about:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(EXAMPLE_QUESTIONS).map(([category, questions]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {category}
                </h4>
                <div className="space-y-1">
                  {questions.slice(0, 2).map((q, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(q)}
                      className="block w-full text-left text-sm text-gray-600 hover:text-cyan-700 hover:bg-cyan-50 px-3 py-2 rounded-md transition-colors"
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Responses */}
      {responses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">
            Recent Insights ({responses.length})
          </h3>
          <div className="space-y-4">
            {responses.map((response) => (
              <AskResponse key={response.id} response={response} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {responses.length === 0 && !showExamples && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ask Your Data</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Type a question above to get insights, charts, and analysis from your practice data.
          </p>
        </div>
      )}
    </div>
  )
}
