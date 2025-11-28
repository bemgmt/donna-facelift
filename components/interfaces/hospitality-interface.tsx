"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Phone, Clock, Settings, Play, CheckCircle } from "lucide-react"

interface Workflow {
  id: string
  name: string
  trigger_keywords: string[]
  response: string
}

interface Call {
  id: string
  caller?: string
  timestamp: string
  workflow_id?: string
  status: string
  data?: unknown
}

interface HospitalityData {
  workflows: Workflow[]
  recent_calls: Call[]
  stats: {
    total_workflows: number
    calls_today: number
  }
}

const HospitalityInterface: React.FC = () => {
  const [hospitalityData, setHospitalityData] = useState<HospitalityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'workflows' | 'calls' | 'settings'>('overview')

  // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount; fetchHospitalityData encapsulates its own state updates
  useEffect(() => {
    fetchHospitalityData()
  }, [])

  const fetchHospitalityData = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || '/donna'
      const response = await fetch(`${apiBase}/api/bridge.php?path=hospitality`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const result = await response.json()
      if (result?.success) {
        setHospitalityData(result.data)
      }
    } catch (error: unknown) {
      console.error('Failed to fetch hospitality data:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerWorkflow = async (workflowId: string, data: Record<string, unknown> = {}) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || '/donna'
      const response = await fetch(`${apiBase}/api/bridge.php?path=hospitality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'trigger_workflow',
          workflow_id: workflowId,
          data: data
        })
      })
      const result = await response.json()
      if (result?.success) {
        fetchHospitalityData() // Refresh data
        console.log('Workflow triggered successfully')
      }
    } catch (error: unknown) {
      console.error('Failed to trigger workflow:', error)
    }
  }

  const logCall = async (callData: Partial<Call>) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || '/donna'
      const response = await fetch(`${apiBase}/api/bridge.php?path=hospitality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'log_call',
          call: callData
        })
      })
      const result = await response.json()
      if (result?.success) {
        fetchHospitalityData() // Refresh data
      }
    } catch (error: unknown) {
      console.error('Failed to log call:', error)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-orange-900/20 to-orange-800/10 p-6 rounded-lg overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-light text-white">Hospitality Dashboard</h2>
            <p className="text-white/60 text-sm">Manage guest services and workflows</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/60 text-sm">System Active</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {['overview', 'workflows', 'calls', 'settings'].map((tab) => (
            <button
              key={tab}
onClick={() => setActiveTab(tab as 'overview' | 'workflows' | 'calls' | 'settings')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-8 h-8 text-orange-400" />
                  <div>
                    <p className="text-white/60 text-sm">Active Workflows</p>
                    <p className="text-2xl font-light text-white">{hospitalityData?.stats.total_workflows || 0}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-white/60 text-sm">Calls Today</p>
                    <p className="text-2xl font-light text-white">{hospitalityData?.stats.calls_today || 0}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-white/60 text-sm">Avg Response</p>
                    <p className="text-2xl font-light text-white">45s</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-white/60 text-sm">Success Rate</p>
                    <p className="text-2xl font-light text-white">98%</p>
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <div className="md:col-span-2 lg:col-span-4 bg-white/10 rounded-lg p-4">
                <h3 className="text-white font-medium mb-4">Recent Calls</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(hospitalityData?.recent_calls?.slice(0, 5) ?? []).map((call) => (
                    <div key={call.id} className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0">
                      <div>
                        <p className="text-white text-sm">{call.caller || 'Unknown Caller'}</p>
                        <p className="text-white/60 text-xs">{formatTime(call.timestamp)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          call.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          call.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {call.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workflows' && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium">Available Workflows</h3>
                <button className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-4 py-2 rounded-lg text-sm transition-colors">
                  Add Workflow
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3">
                {hospitalityData?.workflows.map((workflow) => (
                  <motion.div
                    key={workflow.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/10 rounded-lg p-4 hover:bg-white/15 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{workflow.name}</h4>
                        <p className="text-white/60 text-sm mt-1">{workflow.response}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {workflow.trigger_keywords.map((keyword, index) => (
                            <span key={index} className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => triggerWorkflow(workflow.id)}
                        className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 p-2 rounded-lg transition-colors"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium">Call History</h3>
                <button
                  onClick={() => {
                    const caller = prompt('Caller Name:')
                    if (caller) {
                      logCall({ caller, status: 'completed' })
                    }
                  }}
                  className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Log Call
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2">
                {(hospitalityData?.recent_calls ?? []).map((call) => (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/10 rounded-lg p-4 hover:bg-white/15 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{call.caller || 'Unknown Caller'}</h4>
                        <p className="text-white/60 text-sm">{formatDate(call.timestamp)} at {formatTime(call.timestamp)}</p>
                        {call.workflow_id && (
                          <p className="text-white/60 text-xs mt-1">Workflow: {call.workflow_id}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        call.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        call.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {call.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="h-full">
              <h3 className="text-white font-medium mb-4">System Settings</h3>
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Voice Recognition</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Enable voice commands</span>
                    <button className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm">
                      Enabled
                    </button>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Auto Response</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Automatic workflow triggers</span>
                    <button className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm">
                      Active
                    </button>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Call Logging</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Log all incoming calls</span>
                    <button className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm">
                      Enabled
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HospitalityInterface
