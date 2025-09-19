'use client'

import { useState, useEffect } from 'react'
import { Mic, MicOff, Play, Pause, FileText, Clock, User, Calendar, CheckCircle, AlertTriangle, Eye, Download, Trash2 } from 'lucide-react'
import { ambientScribe } from '@/services/ambient-scribe'
import type { ScribeSession, ClinicalNote } from '@/types/core'

interface AmbientScribeProps {
  patientId?: string
  patientName?: string
  appointmentId?: string
  onNoteGenerated?: (note: ClinicalNote) => void
}

export default function AmbientScribe({ patientId, patientName, appointmentId, onNoteGenerated }: AmbientScribeProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [activeSession, setActiveSession] = useState<ScribeSession | null>(null)
  const [sessions, setSessions] = useState<ScribeSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ScribeSession | null>(null)
  const [showTranscript, setShowTranscript] = useState(false)
  const [showNote, setShowNote] = useState(false)

  useEffect(() => {
    // Load existing sessions
    setSessions(ambientScribe.getSessions())
    setActiveSession(ambientScribe.getActiveSession())
    setIsRecording(ambientScribe.isRecording())

    // Poll for updates while recording
    const interval = setInterval(() => {
      const currentActive = ambientScribe.getActiveSession()
      if (currentActive?.status !== activeSession?.status) {
        setActiveSession(currentActive)
        setSessions(ambientScribe.getSessions())
      }
      setIsRecording(ambientScribe.isRecording())
    }, 1000)

    return () => clearInterval(interval)
  }, [activeSession?.status])

  const handleStartRecording = async () => {
    try {
      const session = await ambientScribe.startRecording(
        patientId,
        patientName,
        appointmentId,
        'current-clinician',
        'Current Clinician'
      )
      setActiveSession(session)
      setIsRecording(true)
      setSessions(ambientScribe.getSessions())
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Could not start recording. Please check microphone permissions.')
    }
  }

  const handleStopRecording = async () => {
    try {
      const session = await ambientScribe.stopRecording()
      setActiveSession(session)
      setIsRecording(false)
      setSessions(ambientScribe.getSessions())
    } catch (error) {
      console.error('Failed to stop recording:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusIcon = (status: ScribeSession['status']) => {
    switch (status) {
      case 'recording':
        return <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      case 'processing':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const handleApproveNote = async (sessionId: string) => {
    await ambientScribe.reviewAndApprove(sessionId, 'Approved by clinician')
    setSessions(ambientScribe.getSessions())
    if (selectedSession?.id === sessionId) {
      setSelectedSession(ambientScribe.getSession(sessionId) || null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ambient Clinical Scribe</h3>
            <p className="text-sm text-gray-600">AI-powered clinical documentation</p>
          </div>
          <div className="flex items-center space-x-3">
            {patientName && (
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-1" />
                {patientName}
              </div>
            )}
            {activeSession && (
              <div className="flex items-center space-x-2">
                {getStatusIcon(activeSession.status)}
                <span className="text-sm font-medium text-gray-700">
                  {activeSession.status === 'recording' ? 'Recording...' : 
                   activeSession.status === 'processing' ? 'Processing...' :
                   activeSession.status === 'completed' ? 'Ready for Review' : 'Failed'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Mic className="w-5 h-5" />
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <MicOff className="w-5 h-5" />
              <span>Stop Recording</span>
            </button>
          )}
        </div>

        {activeSession?.status === 'recording' && (
          <div className="mt-4 text-center">
            <div className="text-2xl font-mono text-red-600">
              {formatDuration(Math.floor((Date.now() - activeSession.startTime.getTime()) / 1000))}
            </div>
            <p className="text-sm text-gray-500">Recording in progress</p>
          </div>
        )}
      </div>

      {/* Session History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h4>
        
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No scribe sessions yet</p>
            <p className="text-sm">Start recording to create your first clinical note</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(session.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {session.patientName || 'Unknown Patient'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {session.startTime.toLocaleDateString()} at {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {session.duration ? formatDuration(session.duration) : 'In progress'}
                        </span>
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {session.clinicianName}
                        </span>
                        {session.confidence && (
                          <span className={`font-medium ${
                            session.confidence > 0.9 ? 'text-green-600' :
                            session.confidence > 0.8 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {Math.round(session.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {session.transcript && (
                      <button
                        onClick={() => {
                          setSelectedSession(session)
                          setShowTranscript(true)
                          setShowNote(false)
                        }}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                        title="View Transcript"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {session.structuredNote && (
                      <button
                        onClick={() => {
                          setSelectedSession(session)
                          setShowNote(true)
                          setShowTranscript(false)
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        title="View Clinical Note"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                    {session.status === 'completed' && session.structuredNote?.requiresReview && (
                      <button
                        onClick={() => handleApproveNote(session.id)}
                        className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transcript Modal */}
      {showTranscript && selectedSession?.transcript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Session Transcript</h3>
                <p className="text-sm text-gray-600">
                  {selectedSession.patientName} • {selectedSession.startTime.toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowTranscript(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                {selectedSession.transcript}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Clinical Note Modal */}
      {showNote && selectedSession?.structuredNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Clinical Note</h3>
                <p className="text-sm text-gray-600">
                  {selectedSession.structuredNote.patientName} • {selectedSession.structuredNote.date.toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {selectedSession.structuredNote.requiresReview && (
                  <button
                    onClick={() => handleApproveNote(selectedSession.id)}
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                  >
                    Approve Note
                  </button>
                )}
                <button
                  onClick={() => setShowNote(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Chief Complaint</h4>
                  <p className="text-sm text-gray-700">{selectedSession.structuredNote.chiefComplaint}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Assessment</h4>
                  <p className="text-sm text-gray-700">{selectedSession.structuredNote.assessment}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">History of Present Illness</h4>
                <p className="text-sm text-gray-700">{selectedSession.structuredNote.historyOfPresentIllness}</p>
              </div>
              
              {selectedSession.structuredNote.physicalExam && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Physical Examination</h4>
                  <p className="text-sm text-gray-700">{selectedSession.structuredNote.physicalExam}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Plan</h4>
                <p className="text-sm text-gray-700">{selectedSession.structuredNote.plan}</p>
              </div>

              {selectedSession.structuredNote.prescriptions && selectedSession.structuredNote.prescriptions.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Prescriptions</h4>
                  <div className="space-y-2">
                    {selectedSession.structuredNote.prescriptions.map((rx, index) => (
                      <div key={index} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        <strong>{rx.medication}</strong> - {rx.dosage}, {rx.frequency} for {rx.duration}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSession.structuredNote.confidence && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">AI Confidence Score</span>
                    <span className={`font-medium ${
                      selectedSession.structuredNote.confidence > 0.9 ? 'text-green-600' :
                      selectedSession.structuredNote.confidence > 0.8 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {Math.round(selectedSession.structuredNote.confidence * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
