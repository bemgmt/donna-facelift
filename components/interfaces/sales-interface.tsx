"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, TrendingUp, Mail, Phone, Plus, Search, Calendar, DollarSign, Target, BarChart3, Filter, Download, Eye, Edit, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react"
import CampaignBuilder, { type Campaign } from "../campaigns/CampaignBuilder"
import CampaignDashboard from "../CampaignDashboard"

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  status: 'new' | 'contacted' | 'qualified' | 'converted'
  score: number
  created_at: string
  last_contact?: string
  notes?: string
  value?: number
  source?: string
}

interface Lead {
  id: string
  contact_id: string
  contact_name?: string
  status: 'cold' | 'warm' | 'hot' | 'converted'
  score: number
  last_contact: string
  notes: string
  estimated_value?: number
  probability?: number
}

interface Deal {
  id: string
  name: string
  contact_id: string
  contact_name: string
  value: number
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  expected_close: string
  created_at: string
}

interface SalesData {
  contacts: Contact[]
  leads: Lead[]
  deals: Deal[]
  stats: {
    total_contacts: number
    hot_leads: number
    conversion_rate: number
    total_revenue: number
    pipeline_value: number
    avg_deal_size: number
    win_rate: number
  }
  activities: {
    id: string
    type: 'call' | 'email' | 'meeting' | 'note'
    contact_name: string
    description: string
    date: string
  }[]
}

const SalesInterface: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'leads' | 'deals' | 'activities' | 'campaigns'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)

  // Campaign states
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false)
  // Campaign type matches CampaignBuilder's expected shape
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)

  // Shell mode - static demo data with extensive dummy data
  useEffect(() => {
    const mockContacts: Contact[] = [
      { id: '1', name: 'John Doe', email: 'john@techcorp.com', phone: '+1-555-0101', company: 'TechCorp Inc', status: 'qualified', score: 85, created_at: '2024-01-15', last_contact: '2024-01-20', notes: 'Very interested in enterprise solution', value: 50000, source: 'Website' },
      { id: '2', name: 'Jane Smith', email: 'jane@startup.io', phone: '+1-555-0102', company: 'Startup.io', status: 'contacted', score: 72, created_at: '2024-01-14', last_contact: '2024-01-19', notes: 'Follow up scheduled for next week', value: 25000, source: 'Referral' },
      { id: '3', name: 'Bob Johnson', email: 'bob@consulting.com', phone: '+1-555-0103', company: 'Johnson Consulting', status: 'new', score: 45, created_at: '2024-01-13', value: 15000, source: 'LinkedIn' },
      { id: '4', name: 'Sarah Williams', email: 'sarah@enterprise.com', phone: '+1-555-0104', company: 'Enterprise Solutions', status: 'converted', score: 95, created_at: '2024-01-10', last_contact: '2024-01-18', notes: 'Closed deal - Premium package', value: 75000, source: 'Event' },
      { id: '5', name: 'Michael Chen', email: 'michael@innovate.com', phone: '+1-555-0105', company: 'Innovate Labs', status: 'qualified', score: 78, created_at: '2024-01-12', last_contact: '2024-01-17', notes: 'Requested demo', value: 40000, source: 'Website' },
      { id: '6', name: 'Emily Davis', email: 'emily@digital.com', phone: '+1-555-0106', company: 'Digital Marketing Pro', status: 'contacted', score: 68, created_at: '2024-01-11', last_contact: '2024-01-16', value: 30000, source: 'Social Media' },
      { id: '7', name: 'David Martinez', email: 'david@finance.com', phone: '+1-555-0107', company: 'Finance Corp', status: 'new', score: 52, created_at: '2024-01-09', value: 20000, source: 'Cold Outreach' },
      { id: '8', name: 'Lisa Anderson', email: 'lisa@retail.com', company: 'Retail Solutions', status: 'qualified', score: 82, created_at: '2024-01-08', last_contact: '2024-01-15', notes: 'Interested in bulk pricing', value: 60000, source: 'Referral' },
    ]

    const mockLeads: Lead[] = [
      { id: '1', contact_id: '1', contact_name: 'John Doe', status: 'hot', score: 90, last_contact: '2024-01-20', notes: 'Interested in premium plan, budget approved', estimated_value: 50000, probability: 85 },
      { id: '2', contact_id: '2', contact_name: 'Jane Smith', status: 'warm', score: 65, last_contact: '2024-01-19', notes: 'Follow up scheduled', estimated_value: 25000, probability: 60 },
      { id: '3', contact_id: '5', contact_name: 'Michael Chen', status: 'hot', score: 88, last_contact: '2024-01-17', notes: 'Demo completed, very positive feedback', estimated_value: 40000, probability: 80 },
      { id: '4', contact_id: '8', contact_name: 'Lisa Anderson', status: 'warm', score: 70, last_contact: '2024-01-15', notes: 'Requested pricing information', estimated_value: 60000, probability: 55 },
      { id: '5', contact_id: '3', contact_name: 'Bob Johnson', status: 'cold', score: 45, last_contact: '2024-01-13', notes: 'Initial contact made', estimated_value: 15000, probability: 25 },
    ]

    const mockDeals: Deal[] = [
      { id: '1', name: 'Enterprise Package - TechCorp', contact_id: '1', contact_name: 'John Doe', value: 50000, stage: 'negotiation', probability: 75, expected_close: '2024-02-15', created_at: '2024-01-10' },
      { id: '2', name: 'Premium Solution - Enterprise Solutions', contact_id: '4', contact_name: 'Sarah Williams', value: 75000, stage: 'closed_won', probability: 100, expected_close: '2024-01-18', created_at: '2024-01-05' },
      { id: '3', name: 'Standard Package - Innovate Labs', contact_id: '5', contact_name: 'Michael Chen', value: 40000, stage: 'proposal', probability: 65, expected_close: '2024-02-28', created_at: '2024-01-12' },
      { id: '4', name: 'Bulk License - Retail Solutions', contact_id: '8', contact_name: 'Lisa Anderson', value: 60000, stage: 'qualification', probability: 50, expected_close: '2024-03-10', created_at: '2024-01-08' },
    ]

    const mockActivities = [
      { id: '1', type: 'call', contact_name: 'John Doe', description: 'Discussed enterprise features and pricing', date: '2024-01-20T10:30:00' },
      { id: '2', type: 'email', contact_name: 'Jane Smith', description: 'Sent follow-up email with proposal', date: '2024-01-19T14:15:00' },
      { id: '3', type: 'meeting', contact_name: 'Michael Chen', description: 'Product demo completed successfully', date: '2024-01-17T09:00:00' },
      { id: '4', type: 'note', contact_name: 'Sarah Williams', description: 'Deal closed - Premium package', date: '2024-01-18T16:45:00' },
      { id: '5', type: 'call', contact_name: 'Lisa Anderson', description: 'Initial discovery call', date: '2024-01-15T11:20:00' },
    ]

    setSalesData({
      contacts: mockContacts,
      leads: mockLeads,
      deals: mockDeals,
      stats: {
        total_contacts: mockContacts.length,
        hot_leads: mockLeads.filter(l => l.status === 'hot').length,
        conversion_rate: 28.5,
        total_revenue: 125000,
        pipeline_value: 150000,
        avg_deal_size: 56250,
        win_rate: 25.0
      },
      activities: mockActivities
    })
    setLoading(false)
  }, [])

  // Shell mode - visual only
  const addContact = async (_contact: Partial<Contact>) => {
    alert("Design Preview Mode - Contact creation disabled")
    // No API call in shell mode
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
    <div className="w-full h-full glass-dark p-6 rounded-lg overflow-hidden backdrop-blur">
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
        <div className="flex space-x-1 mb-6 overflow-x-auto">
          {['overview', 'contacts', 'leads', 'deals', 'activities', 'campaigns'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
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
            <div className="space-y-6 overflow-y-auto">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-lg p-4"
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
                  className="glass rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-red-400" />
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
                  className="glass rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-green-400" />
                    <div>
                      <p className="text-white/60 text-sm">Total Revenue</p>
                      <p className="text-2xl font-light text-white">${(salesData?.stats.total_revenue || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                    <div>
                      <p className="text-white/60 text-sm">Pipeline Value</p>
                      <p className="text-2xl font-light text-white">${(salesData?.stats.pipeline_value || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-orange-400" />
                    <div>
                      <p className="text-white/60 text-sm">Conversion Rate</p>
                      <p className="text-2xl font-light text-white">{salesData?.stats.conversion_rate || 0}%</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-cyan-400" />
                    <div>
                      <p className="text-white/60 text-sm">Avg Deal Size</p>
                      <p className="text-2xl font-light text-white">${(salesData?.stats.avg_deal_size || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="glass rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <div>
                      <p className="text-white/60 text-sm">Win Rate</p>
                      <p className="text-2xl font-light text-white">{salesData?.stats.win_rate || 0}%</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Recent Activity */}
              <div className="glass rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-medium text-lg">Recent Activity</h3>
                  <button className="text-sm text-white/60 hover:text-white">View All</button>
                </div>
                <div className="space-y-3">
                  {salesData?.activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'call' ? 'bg-blue-500/20 text-blue-400' :
                        activity.type === 'email' ? 'bg-purple-500/20 text-purple-400' :
                        activity.type === 'meeting' ? 'bg-green-500/20 text-green-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {activity.type === 'call' ? <Phone className="w-4 h-4" /> :
                         activity.type === 'email' ? <Mail className="w-4 h-4" /> :
                         activity.type === 'meeting' ? <Calendar className="w-4 h-4" /> :
                         <Edit className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.contact_name}</p>
                        <p className="text-white/60 text-xs">{activity.description}</p>
                        <p className="text-white/40 text-xs mt-1">{new Date(activity.date).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Deals */}
              <div className="glass rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-medium text-lg">Top Deals</h3>
                  <button className="text-sm text-white/60 hover:text-white">View All</button>
                </div>
                <div className="space-y-3">
                  {salesData?.deals.slice(0, 5).map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <div className="flex-1">
                        <p className="text-white font-medium">{deal.name}</p>
                        <p className="text-white/60 text-sm">{deal.contact_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">${deal.value.toLocaleString()}</p>
                        <p className="text-white/60 text-xs">{deal.probability}% probability</p>
                      </div>
                      <span className={`ml-4 px-2 py-1 rounded text-xs ${
                        deal.stage === 'closed_won' ? 'bg-green-500/20 text-green-400' :
                        deal.stage === 'closed_lost' ? 'bg-red-500/20 text-red-400' :
                        deal.stage === 'negotiation' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {deal.stage.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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
                    className="w-full glass border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
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
                <button className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-4 py-2 text-white flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-4 py-2 text-white flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              {/* Contacts List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredContacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedContact(contact)
                      setShowContactModal(true)
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-medium">{contact.name}</h3>
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                            Score: {contact.score}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm">{contact.email}</p>
                        {contact.phone && (
                          <p className="text-white/60 text-sm">{contact.phone}</p>
                        )}
                        {contact.company && (
                          <p className="text-white/50 text-xs mt-1">{contact.company}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {contact.value && (
                            <span className="text-xs text-white/60">Value: ${contact.value.toLocaleString()}</span>
                          )}
                          {contact.source && (
                            <span className="text-xs text-white/60">Source: {contact.source}</span>
                          )}
                          {contact.last_contact && (
                            <span className="text-xs text-white/60">Last: {new Date(contact.last_contact).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(contact.status)}`}>
                          {contact.status}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              sendEmail({ to: contact.email, subject: 'Follow up' })
                            }}
                            className="p-1.5 hover:bg-white/20 rounded transition-colors"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4 text-white/60" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 hover:bg-white/20 rounded transition-colors"
                            title="Call"
                          >
                            <Phone className="w-4 h-4 text-white/60" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedContact(contact)
                              setShowContactModal(true)
                            }}
                            className="p-1.5 hover:bg-white/20 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-white/60" />
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
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium text-lg">Lead Pipeline</h3>
                <div className="flex gap-2">
                  <button className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-4 py-2 text-white text-sm flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-4 py-2 text-white text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {salesData?.leads.map((lead) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-medium">{lead.contact_name}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                            Score: {lead.score}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm mb-2">{lead.notes}</p>
                        <div className="flex items-center gap-4 text-xs text-white/60">
                          {lead.estimated_value && (
                            <span>Est. Value: ${lead.estimated_value.toLocaleString()}</span>
                          )}
                          {lead.probability && (
                            <span>Probability: {lead.probability}%</span>
                          )}
                          <span>Last Contact: {new Date(lead.last_contact).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/20 rounded transition-colors" title="View Details">
                          <Eye className="w-4 h-4 text-white/60" />
                        </button>
                        <button className="p-2 hover:bg-white/20 rounded transition-colors" title="Edit">
                          <Edit className="w-4 h-4 text-white/60" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium text-lg">Sales Pipeline</h3>
                <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <Plus className="w-4 h-4" />
                  New Deal
                </button>
              </div>
              <div className="grid grid-cols-6 gap-4 mb-4 text-xs text-white/60 font-medium">
                <div>Deal Name</div>
                <div>Contact</div>
                <div>Value</div>
                <div>Stage</div>
                <div>Probability</div>
                <div>Actions</div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {salesData?.deals.map((deal) => (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <div>
                        <p className="text-white font-medium">{deal.name}</p>
                        <p className="text-white/60 text-xs">Expected: {new Date(deal.expected_close).toLocaleDateString()}</p>
                      </div>
                      <div className="text-white/80">{deal.contact_name}</div>
                      <div className="text-white font-medium">${deal.value.toLocaleString()}</div>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          deal.stage === 'closed_won' ? 'bg-green-500/20 text-green-400' :
                          deal.stage === 'closed_lost' ? 'bg-red-500/20 text-red-400' :
                          deal.stage === 'negotiation' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {deal.stage.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-blue-400 h-2 rounded-full" 
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                          <span className="text-white/80 text-sm">{deal.probability}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-white/20 rounded transition-colors" title="View">
                          <Eye className="w-4 h-4 text-white/60" />
                        </button>
                        <button className="p-1.5 hover:bg-white/20 rounded transition-colors" title="Edit">
                          <Edit className="w-4 h-4 text-white/60" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium text-lg">Activity Timeline</h3>
                <div className="flex gap-2">
                  <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm">
                    <option>All Types</option>
                    <option>Calls</option>
                    <option>Emails</option>
                    <option>Meetings</option>
                    <option>Notes</option>
                  </select>
                  <button className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-4 py-2 text-white text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {salesData?.activities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        activity.type === 'call' ? 'bg-blue-500/20 text-blue-400' :
                        activity.type === 'email' ? 'bg-purple-500/20 text-purple-400' :
                        activity.type === 'meeting' ? 'bg-green-500/20 text-green-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {activity.type === 'call' ? <Phone className="w-5 h-5" /> :
                         activity.type === 'email' ? <Mail className="w-5 h-5" /> :
                         activity.type === 'meeting' ? <Calendar className="w-5 h-5" /> :
                         <Edit className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white font-medium">{activity.contact_name}</p>
                          <span className="text-white/40 text-xs">{new Date(activity.date).toLocaleString()}</span>
                        </div>
                        <p className="text-white/60 text-sm">{activity.description}</p>
                        <span className="inline-block mt-2 text-xs text-white/50 bg-white/5 px-2 py-1 rounded">
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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

      {/* Contact Details Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 glass-dark backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowContactModal(false)}>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-light text-white mb-2">{selectedContact.name}</h2>
                  <p className="text-white/60">{selectedContact.email}</p>
                  {selectedContact.phone && <p className="text-white/60">{selectedContact.phone}</p>}
                  {selectedContact.company && <p className="text-white/60 mt-1">{selectedContact.company}</p>}
                </div>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <h3 className="text-white font-medium mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/60 text-sm mb-1">Status</p>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedContact.status)}`}>
                      {selectedContact.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Score</p>
                    <p className="text-white">{selectedContact.score}</p>
                  </div>
                  {selectedContact.value && (
                    <div>
                      <p className="text-white/60 text-sm mb-1">Estimated Value</p>
                      <p className="text-white">${selectedContact.value.toLocaleString()}</p>
                    </div>
                  )}
                  {selectedContact.source && (
                    <div>
                      <p className="text-white/60 text-sm mb-1">Source</p>
                      <p className="text-white">{selectedContact.source}</p>
                    </div>
                  )}
                </div>
              </div>
              {selectedContact.notes && (
                <div>
                  <h3 className="text-white font-medium mb-3">Notes</h3>
                  <p className="text-white/80 text-sm">{selectedContact.notes}</p>
                </div>
              )}
              <div>
                <h3 className="text-white font-medium mb-3">Quick Actions</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => sendEmail({ to: selectedContact.email, subject: 'Follow up' })}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </button>
                  <button className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <Phone className="w-4 h-4" />
                    Schedule Call
                  </button>
                  <button className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <Edit className="w-4 h-4" />
                    Edit Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesInterface
