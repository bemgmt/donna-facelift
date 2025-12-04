"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Target, TrendingUp, Plus } from "lucide-react"

interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  source: 'website' | 'social' | 'referral' | 'event' | 'cold_outreach'
  score: number
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  created_at: string
  last_contact?: string
  notes?: string
}

interface LeadGeneratorData {
  leads: Lead[]
  stats: {
    total_leads: number
    qualified_leads: number
    conversion_rate: number
    avg_score: number
  }
  sources: {
    [key: string]: number
  }
}

const LeadGeneratorInterface: React.FC = () => {
  const [leadData, setLeadData] = useState<LeadGeneratorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'generate' | 'import'>('overview')
  // Search and filter UI planned for a future iteration
  const [showAddLead, setShowAddLead] = useState(false)
  // showAddLead will be used for modal/form display in future
  void showAddLead

  // Lead generation states
  const [generationCriteria, setGenerationCriteria] = useState({
    industry: '',
    location: '',
    company_size: '',
    job_title: '',
    keywords: ''
  })

  // Shell mode - static demo data
  useEffect(() => {
    const mockData: LeadGeneratorData = {
        leads: [
          {
            id: '1',
            name: 'John Smith',
            email: 'john@techcorp.com',
            phone: '(555) 123-4567',
            company: 'TechCorp Inc',
            source: 'website',
            score: 85,
            status: 'qualified',
            created_at: '2025-09-01',
            last_contact: '2025-09-01',
            notes: 'Interested in enterprise solution'
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah@startup.io',
            company: 'Startup.io',
            source: 'social',
            score: 72,
            status: 'contacted',
            created_at: '2025-08-30',
            notes: 'Follow up next week'
          },
          {
            id: '3',
            name: 'Mike Chen',
            email: 'mike@consulting.com',
            phone: '(555) 987-6543',
            company: 'Chen Consulting',
            source: 'referral',
            score: 91,
            status: 'new',
            created_at: '2025-09-02'
          }
        ],
        stats: {
          total_leads: 127,
          qualified_leads: 34,
          conversion_rate: 12.5,
          avg_score: 73
        },
        sources: {
          website: 45,
          social: 32,
          referral: 28,
          event: 15,
          cold_outreach: 7
        }
      }
      
      setLeadData(mockData)
      setLoading(false)
    }, [])

  // Shell mode - visual only
  const generateLeads = async () => {
    alert("Design Preview Mode - Lead generation disabled")
    // No API call in shell mode
  }
  

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-green-900/20 to-green-800/10 p-6 rounded-lg overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-light text-white">Lead Generator</h2>
            <p className="text-white/60 text-sm">Generate, import, and manage leads</p>
          </div>
          <button
            onClick={() => setShowAddLead(true)}
            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {['overview', 'leads', 'generate', 'import'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
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
                  <Users className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-white/60 text-sm">Total Leads</p>
                    <p className="text-2xl font-light text-white">{leadData?.stats.total_leads || 0}</p>
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
                  <Target className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-white/60 text-sm">Qualified</p>
                    <p className="text-2xl font-light text-white">{leadData?.stats.qualified_leads || 0}</p>
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
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-white/60 text-sm">Conversion Rate</p>
                    <p className="text-2xl font-light text-white">{leadData?.stats.conversion_rate || 0}%</p>
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
                  <Target className="w-8 h-8 text-orange-400" />
                  <div>
                    <p className="text-white/60 text-sm">Avg Score</p>
                    <p className="text-2xl font-light text-white">{leadData?.stats.avg_score || 0}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="space-y-6">
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">AI Lead Generation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Industry</label>
                    <input
                      type="text"
                      value={generationCriteria.industry}
                      onChange={(e) => setGenerationCriteria(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="e.g., Technology, Healthcare, Finance"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Location</label>
                    <input
                      type="text"
                      value={generationCriteria.location}
                      onChange={(e) => setGenerationCriteria(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Los Angeles, CA"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Company Size</label>
                    <select
                      value={generationCriteria.company_size}
                      onChange={(e) => setGenerationCriteria(prev => ({ ...prev, company_size: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/40"
                    >
                      <option value="">Any Size</option>
                      <option value="startup">Startup (1-10)</option>
                      <option value="small">Small (11-50)</option>
                      <option value="medium">Medium (51-200)</option>
                      <option value="large">Large (201-1000)</option>
                      <option value="enterprise">Enterprise (1000+)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Job Title</label>
                    <input
                      type="text"
                      value={generationCriteria.job_title}
                      onChange={(e) => setGenerationCriteria(prev => ({ ...prev, job_title: e.target.value }))}
                      placeholder="e.g., CEO, Marketing Director, CTO"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-white/60 text-sm mb-2">Keywords</label>
                  <input
                    type="text"
                    value={generationCriteria.keywords}
                    onChange={(e) => setGenerationCriteria(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="e.g., SaaS, AI, automation, digital transformation"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>
                <button
                  onClick={generateLeads}
                  className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Generate Leads
                </button>
              </div>
            </div>
          )}

          {/* Other tabs would go here */}
        </div>
      </div>
    </div>
  )
}

export default LeadGeneratorInterface
