"use client"

import { useState, useEffect, useMemo } from "react"
import type React from "react"
import { Send, Inbox, Star, Archive, Trash2, Mail, RefreshCw, Bot, Zap, Filter, Tag, Users, Template, CheckSquare, Settings } from "lucide-react"
import type { gmail_v1 } from 'googleapis'
import DOMPurify from 'isomorphic-dompurify'
import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
// Simple type definitions
type EmailCategory = 'personal' | 'work' | 'marketing' | 'social' | 'updates' | 'forums' | 'promotions'
type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent'

// Simple hook fallbacks
const useBulkSelection = (ids: string[], options?: { maxSelection?: number; onSelectionChange?: (ids: Set<string>) => void }) => ({
  selectedIds: new Set<string>(),
  selectAll: () => {},
  selectNone: () => {},
  toggleSelection: () => {},
  isSelected: () => false,
  selectionCount: 0,
  hasSelection: false,
  isAllSelected: false,
  isPartiallySelected: false,
  selectRange: () => {},
  selectByFilter: () => {},
  invertSelection: () => {},
  maxSelection: 1000,
  availableCount: ids.length
})

const useEmailTemplates = (options?: { refreshInterval?: number; autoRefresh?: boolean }) => ({
  templates: [],
  loading: false,
  error: null,
  createTemplate: () => {},
  updateTemplate: () => {},
  deleteTemplate: () => {},
  refreshTemplates: () => {}
})

// Render sanitized HTML to prevent injection
const EmailBody = ({ htmlBody }: { htmlBody: string }) => {
  const sanitized = useMemo(
    () => DOMPurify.sanitize(htmlBody, { USE_PROFILES: { html: true } }),
    [htmlBody]
  )
  return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitized }} />
}

interface Email {
  id: string
  from: string
  from_email: string
  subject: string
  preview: string
  time: string
  dateISO: string | null
  starred: boolean
  unread?: boolean
  category?: EmailCategory
  priority?: PriorityLevel
  custom_tags?: string[]
  campaign_id?: string
  payload?: gmail_v1.Schema$Message['payload']
  metadata?: {
    category: EmailCategory
    priority_level: PriorityLevel
    custom_tags: string[]
    campaign_id?: string
  }
}

export default function HybridEmailInterface() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [composer, setComposer] = useState({ to: "", subject: "", body: "" })
  const [isSending, setIsSending] = useState(false)
  const [isDrafting, setIsDrafting] = useState(false)
  const [aiGoal, setAiGoal] = useState("")

  // Autopilot state
  const [isAutopilotOn, setIsAutopilotOn] = useState(false)

  const [stats, setStats] = useState({ inbox: 0, starred: 0, sent: 0 })

  // Enhanced email interface state (simplified)
  const [selectedCategory, setSelectedCategory] = useState<EmailCategory | 'all'>('all')
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'category'>('date')

  // Simplified hooks
  const bulkSelection = useBulkSelection(emails.map(email => email.id))
  const emailTemplates = useEmailTemplates()

  // Shell mode - static demo data only
  useEffect(() => {
    // Static demo emails for design preview
    setEmails([
      {
        id: '1',
        from: 'John Doe',
        from_email: 'john@example.com',
        subject: 'Meeting Request',
        preview: 'Hi, I would like to schedule a meeting...',
        time: '2 hours ago',
        dateISO: new Date().toISOString(),
        starred: false,
        unread: true,
        category: 'work',
        priority: 'high'
      },
      {
        id: '2',
        from: 'Sarah Smith',
        from_email: 'sarah@example.com',
        subject: 'Project Update',
        preview: 'Here is the latest update on the project...',
        time: '5 hours ago',
        dateISO: new Date().toISOString(),
        starred: true,
        unread: false,
        category: 'work',
        priority: 'medium'
      },
      {
        id: '3',
        from: 'Newsletter',
        from_email: 'news@example.com',
        subject: 'Weekly Newsletter',
        preview: 'Check out this week\'s highlights...',
        time: '1 day ago',
        dateISO: new Date().toISOString(),
        starred: false,
        unread: true,
        category: 'marketing',
        priority: 'low'
      }
    ])
    setLoading(false)
    setStats({ inbox: 3, starred: 1, sent: 0 })
  }, [])

  // Shell mode - visual only, no API calls
  const handleAutopilotToggle = () => {
    setIsAutopilotOn(!isAutopilotOn)
    // No API call in shell mode
  }

  const startGmailConnect = () => {
    // No redirect in shell mode - just show message
    setError("Design Preview Mode - Gmail connection disabled")
  }

  const fetchEmails = async () => {
    // Shell mode - already set static data in useEffect
    return

      const emailList = (data.messages || []).map((msg: gmail_v1.Schema$Message): Email => {
        const headers = (msg.payload?.headers || []) as gmail_v1.Schema$MessagePartHeader[]
        const h = Object.fromEntries(
          headers
            .filter((x): x is { name: string; value: string } => !!x?.name && !!x?.value)
            .map(x => [x.name!.toLowerCase(), x.value!])
        ) as Record<string, string>
        const fromField = h["from"] || "Unknown"
        const fromNameMatch = fromField.match(/(.*)<.*>/)

        // Ensure non-null string id with safe fallback
        const safeId = msg.id || msg.threadId || msg.internalDate || `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Extract and convert date to stable ISO timestamp
        const rawDate = h["date"]
        let dateISO: string | null = null
        try {
          if (rawDate) {
            const parsedDate = new Date(rawDate)
            if (!isNaN(parsedDate.getTime())) {
              dateISO = parsedDate.toISOString()
            }
          }
        } catch {
          // Invalid date, keep dateISO as null
        }

        return {
          id: String(safeId),
          from: fromNameMatch ? fromNameMatch[1].trim().replace(/\"/g, "") : fromField,
          from_email: (fromField.match(/<(.+)>/) || [])[1] || fromField,
          subject: h["subject"] || "No Subject",
          preview: msg.snippet || "No preview available",
          time: formatDate(dateISO),
          dateISO,
          starred: msg.labelIds?.includes("STARRED") || false,
          unread: msg.labelIds?.includes("UNREAD") || false,
          payload: msg.payload
        }
      })

      setEmails(emailList)
      setStats({
        inbox: emailList.filter((e: Email) => e.unread).length,
        starred: emailList.filter((e: Email) => e.starred).length,
        sent: 0
      })
    } catch (err: unknown) {
      console.error("Email fetch error:", err)
      const msg = err instanceof Error ? err.message : 'Failed to fetch emails'
      setError(msg)
      setEmails([])
    } finally {
      setLoading(false)
    }
  }

  // Shell mode - visual only
  const sendEmail = async () => {
    if (!composer.to || !composer.subject) {
      alert("To and Subject are required")
      return
    }
    // Shell mode - no actual sending
    alert("Design Preview Mode - Email sending disabled")
    setIsSending(false)
  }

  const handleReply = (message: Email) => {
    // Get the real plain-text body instead of preview
    const plainTextBody = getEmailBody(message.payload) || message.preview || ""

    // Normalize line endings and prefix each line with "> "
    const normalizedBody = plainTextBody.replace(/\r?\n/g, '\n')
    const quotedLines = normalizedBody.split('\n').map(line => `> ${line}`).join('\n')

    const replyDate = message.dateISO ? new Date(message.dateISO).toLocaleString() : "Unknown date"
    setComposer({
      to: message.from_email,
      subject: `Re: ${message.subject}`,
      body: `\n\n> On ${replyDate}, ${message.from} wrote:\n${quotedLines}`
    })
    setIsModalOpen(false)
    window.scrollTo(0, 0)
  }

  // Shell mode - visual only
  const draftWithAi = async () => {
    if (!selectedEmail) return
    if (!aiGoal) {
      alert("Please provide a goal for the AI.")
      return
    }
    // Shell mode - show demo draft
    alert("Design Preview Mode - AI drafting disabled")
    handleReply(selectedEmail)
    setComposer(prev => ({ ...prev, body: "This is a demo AI-generated reply. Full functionality will be available when the backend is connected." }))
    setIsDrafting(false)
  }

  const decodeBase64Url = (data: string): string => {
    try {
      const d = data.replace(/-/g, '+').replace(/_/g, '/')
      const pad = '='.repeat((4 - (d.length % 4)) % 4)
      const bin = atob(d + pad)
      const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
      return new TextDecoder().decode(bytes)
    } catch {
      return ''
    }
  }

  const getEmailBody = (payload: gmail_v1.Schema$Message['payload'] | undefined): string => {
    if (!payload) return ""
    let body = ""
    const parts = payload.parts as gmail_v1.Schema$MessagePart[] | undefined
    if (parts && parts.length) {
      // Prioritize plain text for better quoting, fallback to HTML
      const part = parts.find((p) => p.mimeType === "text/plain") || parts.find((p) => p.mimeType === "text/html")
      if (part?.body?.data) body = decodeBase64Url(part.body.data)
    } else if (payload.body?.data) {
      body = decodeBase64Url(payload.body.data)
    }

    // If we got HTML, strip basic tags for plain text quoting
    if (body && /<[a-z][\s\S]*>/i.test(body)) {
      body = body.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                 .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                 .replace(/<[^>]+>/g, '\n')
                 .replace(/\n{2,}/g, '\n')
                 .trim()
    }

    return body
  }

  const fullEmailBody = useMemo(() => (selectedEmail ? getEmailBody(selectedEmail.payload) : ""), [selectedEmail])

  const formatDate = (dateISO: string | null) => {
    if (!dateISO) return "Unknown"
    try {
      const date = new Date(dateISO)
      if (isNaN(date.getTime())) return "Unknown"

      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      if (diffHours < 1) return "Just now"
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString()
    } catch {
      return "Unknown"
    }
  }

  const openEmail = (email: Email) => {
    setSelectedEmail(email)
    setIsModalOpen(true)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen flex pt-20 bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/20 p-4 flex flex-col">
        <div className="mb-4">
          <button onClick={startGmailConnect} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm mb-2">
            Connect Gmail
          </button>
          <button onClick={fetchEmails} className="w-full py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded text-sm flex items-center justify-center gap-2" title="Refresh emails" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh Inbox"}
          </button>
        </div>

        {/* Autopilot Section */}
        <div className="border-t border-b border-white/10 py-4 my-4">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="autopilot-toggle" className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              Autopilot
            </label>
            <button onClick={handleAutopilotToggle} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isAutopilotOn ? "bg-purple-600" : "bg-gray-600"}`}>
              <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isAutopilotOn ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          <p className="text-xs text-white/60">When enabled, Donna automatically checks for and replies to new emails every 30 minutes.</p>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300">{error}</div>
        )}

        <nav className="space-y-1">
          {[
            { icon: Inbox, label: "Inbox", count: stats.inbox },
            { icon: Star, label: "Starred", count: stats.starred },
            { icon: Send, label: "Sent", count: stats.sent },
            { icon: Archive, label: "Archive" },
            { icon: Trash2, label: "Trash" }
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer">
              <item.icon className="w-4 h-4 text-white/60" />
              <span className="text-sm">{item.label}</span>
              {(item.count ?? 0) > 0 && <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">{item.count}</span>}
            </div>
          ))}
        </nav>
      </div>

      {/* Email List */}
      <div className="w-80 border-r border-white/20 flex flex-col">
        <div className="p-4 border-b border-white/20">
          <h3 className="font-medium text-lg">Inbox</h3>
        </div>
        <div className="overflow-y-auto flex-1">
          {emails.length === 0 && !loading ? (
            <div className="p-4 text-center text-white/60 mt-10">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No emails found</p>
            </div>
          ) : (
            emails.map(email => (
              <div key={email.id} className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors ${selectedEmail?.id === email.id ? "bg-blue-500/10" : ""} ${email.unread ? "border-l-2 border-blue-400" : ""}`} onClick={() => openEmail(email)}>
                <div className="flex items-start justify-between mb-1">
                  <span className={`font-medium text-sm ${email.unread ? "text-white" : "text-white/80"}`}>{email.from}</span>
                  <span className="text-xs text-white/60 flex-shrink-0 ml-2">{email.time}</span>
                </div>
                <div className={`text-sm mb-1 ${email.unread ? "text-white font-medium" : "text-white/80"}`}>{email.subject}</div>
                <div className="text-xs text-white/60 line-clamp-2">{email.preview}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Composer / Main View */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-white/20">
          <h2 className="text-lg font-light">Composer</h2>
        </div>
        <div className="p-4 space-y-3">
          <input value={composer.to} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComposer(s => ({ ...s, to: e.target.value }))} placeholder="To" className="w-full bg-white/5 p-2 rounded border border-white/10" />
          <input value={composer.subject} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComposer(s => ({ ...s, subject: e.target.value }))} placeholder="Subject" className="w-full bg-white/5 p-2 rounded border border-white/10" />
          <textarea value={composer.body} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComposer(s => ({ ...s, body: e.target.value }))} placeholder="Message body..." className="w-full bg-white/5 p-2 rounded h-48 border border-white/10" />
          <div className="flex justify-end">
            <button onClick={sendEmail} disabled={isSending} className="px-5 py-2 bg-white text-black rounded text-sm font-medium disabled:opacity-50 flex items-center gap-2">
              <Send className="w-4 h-4" />
              {isSending ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>
      </div>

      {/* Email View Modal */}
      {isModalOpen && selectedEmail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold">{selectedEmail.subject}</h2>
              <p className="text-sm text-white/60">From: {selectedEmail.from} &lt;{selectedEmail.from_email}&gt;</p>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <EmailBody htmlBody={fullEmailBody} />
            </div>
            <div className="p-4 border-t border-white/10 bg-[#222] rounded-b-lg space-y-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <input value={aiGoal} onChange={e => setAiGoal(e.target.value)} placeholder="Enter AI goal (e.g., 'schedule a meeting for next week')" className="w-full bg-white/5 p-2 rounded text-sm border border-white/10" />
                <button onClick={draftWithAi} disabled={isDrafting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm disabled:opacity-50 flex-shrink-0">
                  {isDrafting ? "Drafting..." : "Draft Reply with AI"}
                </button>
              </div>
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button onClick={() => handleReply(selectedEmail)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm">Reply</button>
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
