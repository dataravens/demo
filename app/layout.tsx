'use client'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import './globals.css'
import ConversationalCommandBar from '@/components/ConversationalCommandBar'
import ChatGPTCommandBar from '@/components/ChatGPTCommandBar'
import ConversationPanel from '@/components/ConversationPanel'
import PlanPreviewDrawer from '@/components/PlanPreviewDrawer'
import EventTimeline from '@/components/EventTimeline'
import FollowUpSuggestions from '@/components/FollowUpSuggestions'
import AICallHeader from '@/components/AICallHeader'
import CallSummaryModal from '@/components/CallSummaryModal'
import RoleSelector from '@/components/RoleSelector'
import AICommandOmni from '@/components/AICommandOmni'
import { reminderEngine } from '@/services/reminder-engine'
import { ambientScribe } from '@/services/ambient-scribe'
import { careAutopilot } from '@/services/care-autopilot'
import { Plan } from '@/types/core'
import { useDemo, useAutopilot, useData, useTimeline, useCalls, useRole } from '@/store'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [commandBarOpen, setCommandBarOpen] = useState(false)
  const [conversationPanelOpen, setConversationPanelOpen] = useState(false)
  const [planPreviewOpen, setPlanPreviewOpen] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [followUpsOpen, setFollowUpsOpen] = useState(false)
  const [currentPlan, setCurrentPlan] = useState(null)
  const [completedPlan, setCompletedPlan] = useState<Plan | null>(null)
  const [callSummaryOpen, setCallSummaryOpen] = useState(false)
  const [completedCall, setCompletedCall] = useState<any>(null)
  const [lastShownCallId, setLastShownCallId] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  
  const pathname = usePathname()
  const { demoMode, resetDemo } = useDemo()
  const { autopilotMode, setAutopilotMode, role, setRole } = useAutopilot()
  const { loadFromJson, setMutationLocked, loadDemoData } = useData()
  const { addEvent } = useTimeline()
  const { activeCall, recentCalls } = useCalls()
  const { currentRole, permissions, setRole: setSystemRole, hasPermission } = useRole()

  // Client-side mounting check to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandBarOpen(true)
      }
      if (e.key === 'Escape') {
        setCommandBarOpen(false)
        setPlanPreviewOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Load JSON seeds on first mount
  useEffect(() => {
    if (loadFromJson) {
      loadFromJson()
    } else if (loadDemoData) {
      loadDemoData()
    }
  }, [loadFromJson, loadDemoData])

  // Connect services to global timeline
  useEffect(() => {
    reminderEngine.setTimelineCallback(addEvent)
    ambientScribe.setTimelineCallback(addEvent)
    careAutopilot.setTimelineCallback(addEvent)
    
    // Start autopilot simulation
    careAutopilot.simulateAutopilotActions()
  }, [addEvent])
  
  // Restore last dismissed call to avoid auto-open on refresh
  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = sessionStorage.getItem('lastDismissedCallId')
    if (dismissed) setLastShownCallId(dismissed)
  }, [])
  
  // Watch for newly completed calls and show summary once
  useEffect(() => {
    if (!recentCalls || recentCalls.length === 0) return
    const lastCall = recentCalls[0]
    if (!lastCall || callSummaryOpen) return
    // Only auto-open if the call just ended recently (demo seeds won't trigger)
    const endedAt = lastCall.endTime ? new Date(lastCall.endTime).getTime() : 0
    const endedRecently = endedAt > 0 && (Date.now() - endedAt) < 60_000 // 60s window
    if (
      lastCall.status === 'completed' &&
      endedRecently &&
      lastCall.id !== lastShownCallId
    ) {
      setCompletedCall(lastCall)
      setCallSummaryOpen(true)
      setLastShownCallId(lastCall.id)
    }
  }, [recentCalls, callSummaryOpen, lastShownCallId])

  // Demo mode mutation lock: prevent unscripted mutations
  useEffect(() => {
    if (setMutationLocked) {
      setMutationLocked(demoMode)
    }
  }, [demoMode, setMutationLocked])

  const handlePlanCreated = (plan: any) => {
    setCurrentPlan(plan)
    setPlanPreviewOpen(true)
  }

  const handlePlanExecuted = () => {
    // Auto-open timeline to show execution progress
    setTimeout(() => setTimelineOpen(true), 500)
  }

  const handleShowFollowUps = (plan: Plan) => {
    setCompletedPlan(plan)
    setFollowUpsOpen(true)
  }

  const getPageTitle = () => {
    if (pathname === '/') return 'Control Room'
    if (pathname === '/calendar') return 'Calendar'
    if (pathname === '/patients') return 'Patients'
    if (pathname.startsWith('/patients/')) return 'Patient Record'
    if (pathname === '/billing') return 'Billing'
    if (pathname === '/insights') return 'Insights'
    if (pathname === '/messages') return 'Messages'
    if (pathname === '/tasks') return 'Tasks'
    if (pathname === '/calls') return 'Calls'
    if (pathname === '/scribe') return 'Ambient Scribe'
    if (pathname === '/intake') return 'AI Intake'
    if (pathname === '/care') return 'Care Autopilot'
    return 'Data Ravens'
  }

  // Navigation items with role-based visibility
  const allNavigationItems = [
    { href: '/', label: 'Control Room', show: true }, // Always visible
    { href: '/calendar', label: 'Calendar', show: isClient ? hasPermission('canViewCalendar') : true },
    { href: '/patients', label: 'Patients', show: isClient ? hasPermission('canViewPatients') : true },
    { href: '/billing', label: 'Billing', show: isClient ? hasPermission('canViewBilling') : true },
    { href: '/messages', label: 'Messages', show: isClient ? hasPermission('canViewMessages') : true },
    { href: '/tasks', label: 'Tasks', show: isClient ? hasPermission('canViewTasks') : true },
    { href: '/calls', label: 'Calls', show: isClient ? hasPermission('canViewCalls') : true },
    { href: '/scribe', label: 'Ambient Scribe', show: isClient ? hasPermission('canUseScribe') : true },
    { href: '/intake', label: 'AI Intake', show: isClient ? hasPermission('canAccessAI') : true },
    { href: '/care', label: 'Care Autopilot', show: isClient ? hasPermission('canAccessAI') : true },
    { href: '/insights', label: 'Insights', show: isClient ? hasPermission('canViewInsights') : true },
  ]
  
  const navigationItems = allNavigationItems.filter(item => item.show)

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {/* AI Call Header - client-only to avoid SSR mismatch */}
          {isClient && <AICallHeader />}
          
          {/* Demo Mode Ribbon - client-only to avoid SSR mismatch from persisted state */}
          {isClient && demoMode && (
            <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 text-sm text-amber-800">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <span>🎭 Demo Mode - Deterministic data for presentation</span>
                <button 
                  onClick={resetDemo}
                  className="text-amber-600 hover:text-amber-800 font-medium"
                >
                  Reset demo
                </button>
              </div>
            </div>
          )}
          
          {/* Main App Layout */}
          <div className="flex min-h-screen">
            {/* Modern Sidebar Navigation */}
            {/* Sidebar Navigation - render placeholder on SSR to avoid hydration diff */}
            <nav className="w-64 bg-white border-r border-gray-200 flex flex-col" suppressHydrationWarning>
              {/* Practice Logo/Brand */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">DR</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Data Ravens</div>
                    <div className="text-xs text-gray-500">AI Practice Management</div>
                  </div>
                </div>
              </div>
              
              {/* Navigation Links */}
              <div className="flex-1 p-4">
                <div className="space-y-1">
                  {navigationItems.map((item) => {
                    const isActive = pathname === item.href || (item.href === '/patients' && pathname.startsWith('/patients'))
                    
                    return (
                      <a 
                        key={item.href}
                        href={item.href} 
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-r-2 border-blue-600' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          isActive ? 'bg-blue-600' : 'bg-gray-300'
                        }`} />
                        <span>{item.label}</span>
                        {item.label === 'Messages' && (
                          <div className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            3
                          </div>
                        )}
                        {item.label === 'Tasks' && (
                          <div className="ml-auto w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                            7
                          </div>
                        )}
                        {isClient && item.label === 'Ambient Scribe' && ambientScribe.isRecording() && (
                          <div className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                        {isClient && item.label === 'Care Autopilot' && (
                          <div className="ml-auto w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                            {careAutopilot.getCareSignals().filter(s => s.status === 'new').length}
                          </div>
                        )}
                      </a>
                    )
                  })}
                </div>
                
                {/* AI Features Separator */}
                <div className="mt-8 pt-4 border-t border-gray-100">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 px-3">
                    AI Features
                  </div>
                  <div className="space-y-1">
                    <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 w-full text-left">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                      <span>Smart Insights</span>
                    </button>
                    <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 w-full text-left">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Auto Reminders</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Bottom Status */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Practice Status</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Online</span>
                  </div>
                </div>
              </div>
            </nav>
            
            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-gray-50">
              {/* Modern Top Header */}
              {/* Top Header - contains client-state driven controls, keep but avoid SSR-only values */}
              <header className="bg-white border-b border-gray-200 shadow-sm" suppressHydrationWarning>
                <div className="px-6 py-3">
                  <div className="flex items-center justify-between">
                    {/* Left: Page Title & Breadcrumb */}
                    <div className="flex items-center space-x-4">
                      <h1 className="text-2xl font-semibold text-gray-900">
                        {getPageTitle()}
                      </h1>
                      {pathname !== '/' && (
                        <div className="flex items-center text-sm text-gray-500">
                          <span>•</span>
                          <span className="ml-2">Today</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Center: Page Title (AI Omnibox moved to bottom) */}
                    <div className="hidden lg:block flex-1 max-w-2xl mx-8 text-center">
                      <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
                    </div>
                    
                    {/* Right: Controls */}
                    <div className="flex items-center space-x-3">
                      {/* Role Switcher */}
                      {isClient && <RoleSelector />}
                      
                      {/* Autopilot Status */}
                      <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg border">
                        <div className={`w-2 h-2 rounded-full ${
                          autopilotMode === 'scheduled' ? 'bg-green-500' : 
                          autopilotMode === 'ask' ? 'bg-amber-500' : 'bg-gray-400'
                        }`} />
                        {isClient && (
                          <select 
                            value={autopilotMode}
                            onChange={(e) => setAutopilotMode(e.target.value as any)}
                            className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 focus:outline-none"
                          >
                            <option value="manual">Manual</option>
                            <option value="ask">Ask to run</option>
                            <option value="scheduled">Scheduled</option>
                          </select>
                        )}
                      </div>
                      
                      {/* AI Action Trail */}
                      {isClient && (
                        <button 
                          onClick={() => setTimelineOpen(true)}
                          className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                          <span>AI Trail</span>
                        </button>
                      )}
                      
                      {/* Command Bar Trigger */}
                      {isClient && (
                        <button 
                          onClick={() => setConversationPanelOpen(true)}
                          className="flex items-center space-x-2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-sm hover:from-blue-700 hover:to-cyan-700 font-medium shadow-sm transition-all"
                        >
                          <span>💬</span>
                          <span className="hidden sm:inline">AI Chat</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </header>

              {/* Page Content - allow document scrolling; avoid inner scroll */}
                  <div className="flex-1 pb-28">
                    {children}
                  </div>
            </main>
          </div>

          {/* ChatGPT-style Interface Components */}
          {isClient && (
            <>
              {/* Bottom ChatGPT-style Command Bar */}
              <ChatGPTCommandBar
                onPlanCreated={handlePlanCreated}
                onOpenConversation={() => setConversationPanelOpen(true)}
              />

              {/* Conversation Panel */}
              <ConversationPanel
                isOpen={conversationPanelOpen}
                onClose={() => setConversationPanelOpen(false)}
                onPlanCreated={handlePlanCreated}
              />

              {/* Legacy Command Bar (kept for compatibility) */}
              <ConversationalCommandBar
                isOpen={commandBarOpen}
                onClose={() => setCommandBarOpen(false)}
                onPlanCreated={handlePlanCreated}
              />
            </>
          )}

          {isClient && (
            <PlanPreviewDrawer
              plan={currentPlan}
              isOpen={planPreviewOpen}
              onClose={() => {
                setPlanPreviewOpen(false)
                setCurrentPlan(null)
              }}
              onExecuted={handlePlanExecuted}
              onShowFollowUps={handleShowFollowUps}
            />
          )}

          {isClient && (
            <EventTimeline
              isOpen={timelineOpen}
              onClose={() => setTimelineOpen(false)}
            />
          )}

          {isClient && (
            <FollowUpSuggestions
              completedPlan={completedPlan}
              isOpen={followUpsOpen}
              onClose={() => {
                setFollowUpsOpen(false)
                setCompletedPlan(null)
              }}
              onPlanCreated={handlePlanCreated}
            />
          )}
          
          {/* Call Summary Modal */}
          {isClient && callSummaryOpen && completedCall && (
            <CallSummaryModal
              call={completedCall}
              onClose={() => {
                setCallSummaryOpen(false)
                setCompletedCall(null)
                try {
                  if (completedCall?.id) {
                    sessionStorage.setItem('lastDismissedCallId', completedCall.id)
                  }
                } catch {}
              }}
            />
          )}
        </div>
      </body>
    </html>
  )
}