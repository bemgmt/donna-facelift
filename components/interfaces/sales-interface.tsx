"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, TrendingUp, Mail, Phone, Plus, Search } from "lucide-react"
import CampaignBuilder, { type Campaign } from "../campaigns/CampaignBuilder"
import CampaignDashboard from "../CampaignDashboard"

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  status: 'new' | 'contacted' | 'qualified' | 'converted'
  score: number
  created_at: string
}

interface Lead {
  id: string
  contact_id: string
  status: 'cold' | 'warm' | 'hot' | 'converted'
  score: number
  last_contact: string
  notes: string
}

interface SalesData {
  contacts: Contact[]
  leads: Lead[]
  stats: {
    total_contacts: number
    hot_leads: number
    conversion_rate: number
  }
}

const SalesInterface: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'leads' | 'campaigns'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Campaign states
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false)
  // Campaign type matches CampaignBuilder's expected shape
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)

  useEffect(() => {
    fetchSalesData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Mount-only effect - fetchSalesData is stable and encapsulates state updates
  }, [])

  const fetchSalesData = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || '/donna'
      const response = await fetch(`${apiBase}/api/sales/overview.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const result = await response.json()
      if (result.success) {
        setSalesData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addContact = async (contact: Partial<Contact>) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || '/donna'
      const response = await fetch(`${apiBase}/api/sales/overview.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add_contact',
          contact: contact
        })
      })
      const result = await response.json()
      if (result.success) {
        fetchSalesData() // Refresh data
      }
    } catch (error) {
      console.error('Failed to add contact:', error)
    }
  }

  // const updateLead = async (lead: Partial<Lead>) => {
  //   try {
  //     const apiBase = process.env.NEXT_PUBLIC_API_BASE || '/donna'
  //     const response = await fetch(`${apiBase}/api/sales/overview.php`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         action: 'update_lead',
  //         lead: lead
  //       })
  //     })
  //     const result = await response.json()
  //     if (result.success) {
  //       fetchSalesData() // Refresh data
  //     }
  //   } catch (error) {
  //     console.error('Failed to update lead:', error)
  //   }
  // }

  const sendEmail = async (emailData: { to: string; subject?: string; body?: string }) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || '/donna'
      const response = await fetch(`${apiBase}/api/sales/overview.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_email',
          email: emailData
        })
      })
      const result = await response.json()
      if (result.success) {
        // Show success message
        console.log('Email sent successfully')
      }
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }

  // Campaign handlers
  const handleCreateCampaign = () => {
    setEditingCampaign(null)
    setShowCampaignBuilder(true)
  }

  const handleEditCampaign = (campaign: Campaign) => {
    // Open builder prefilled from selected summary
    setEditingCampaign(campaign)
    setShowCampaignBuilder(true)
  }

  const handleSaveCampaign = async (campaign: Campaign) => {
    try {
      // TODO: API call to save campaign
      console.log('Saving campaign:', campaign)
      setShowCampaignBuilder(false)
      setEditingCampaign(null)
    } catch (error) {
      console.error('Failed to save campaign:', error)
    }
  }

  const filteredContacts = salesData?.contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400'
      case 'contacted': return 'bg-yellow-500/20 text-yellow-400'
      case 'qualified': return 'bg-orange-500/20 text-orange-400'
      case 'converted': return 'bg-green-500/20 text-green-400'
      case 'hot': return 'bg-red-500/20 text-red-400'
      case 'warm': return 'bg-orange-500/20 text-orange-400'
      case 'cold': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 rounded-lg overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-light text-white">Sales Dashboard</h2>
            <p className="text-white/60 text-sm">Manage leads and track conversions</p>
          </div>
          <button
            onClick={() => {
              // Open add contact modal
              const name = prompt('Contact Name:')
              const email = prompt('Contact Email:')
              if (name && email) {
                addContact({ name, email, status: 'new', score: 0 })
              }
            }}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {['overview', 'contacts', 'leads', 'campaigns'].map((tab) => (
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-white/60 text-sm">Total Contacts</p>
                    <p className="text-2xl font-light text-white">{salesData?.stats.total_contacts || 0}</p>
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
                  <TrendingUp className="w-8 h-8 text-red-400" />
                  <div>
                    <p className="text-white/60 text-sm">Hot Leads</p>
                    <p className="text-2xl font-light text-white">{salesData?.stats.hot_leads || 0}</p>
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
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-white/60 text-sm">Conversion Rate</p>
                    <p className="text-2xl font-light text-white">{salesData?.stats.conversion_rate || 0}%</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="h-full flex flex-col">
              {/* Search and Filter */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/40"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                </select>
              </div>

              {/* Contacts List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredContacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/10 rounded-lg p-4 hover:bg-white/15 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{contact.name}</h3>
                        <p className="text-white/60 text-sm">{contact.email}</p>
                        {contact.phone && (
                          <p className="text-white/60 text-sm">{contact.phone}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(contact.status)}`}>
                          {contact.status}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => sendEmail({ to: contact.email, subject: 'Follow up' })}
                            className="p-1 hover:bg-white/20 rounded"
                          >
                            <Mail className="w-4 h-4 text-white/60" />
                          </button>
                          <button className="p-1 hover:bg-white/20 rounded">
                            <Phone className="w-4 h-4 text-white/60" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="h-full">
              <p className="text-white/60">Lead management interface coming soon...</p>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="h-full">
              <CampaignDashboard
                onCreateCampaign={handleCreateCampaign}
                onEditCampaign={handleEditCampaign}
              />
            </div>
          )}
        </div>
      </div>

      {/* Campaign Builder Modal */}
      <CampaignBuilder
        isOpen={showCampaignBuilder}
        onClose={() => setShowCampaignBuilder(false)}
        onSave={handleSaveCampaign}
        editingCampaign={editingCampaign}
      />
    </div>
  )
}

export default SalesInterface
