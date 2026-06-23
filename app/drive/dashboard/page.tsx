"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2, ArrowLeft, Sparkles, MessageSquare, Send, Users,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

type Tab = "secretary" | "din"

interface OrgInfo {
  property_name: string
  property_value: string
}

interface DinMember {
  id: string
  name: string
  company: string
  roleId: string
  roleLabel: string
}

function DriveDashboardContent() {
  const searchParams = useSearchParams()
  const roleSlug = searchParams.get("role") || (typeof window !== "undefined" ? localStorage.getItem("donna_drive_role") : null) || "commercial_broker"
  const userName = typeof window !== "undefined" ? localStorage.getItem("donna_drive_user_name") || "Attendee" : "Attendee"

  const [activeTab, setActiveTab] = useState<Tab>("secretary")
  const [loading, setLoading] = useState(true)

  // Org info for dynamic banner
  const [orgInfo, setOrgInfo] = useState<OrgInfo>({ property_name: "", property_value: "" })

  // Secretary chat state
  const [chatHistory, setChatHistory] = useState<{role: 'assistant' | 'user', content: string}[]>([
    {
      role: 'assistant',
      content: "Hi, I'm Donna. I'm here to help you complete your Donna Drive role today. You can ask me what to work on first, check your leads, assign a task, contact another role through DIN, or ask what actions I can help with."
    }
  ])
  const [chatInput, setChatInput] = useState("")
  const [sendingChat, setSendingChat] = useState(false)

  // DIN state
  const [dinMembers, setDinMembers] = useState<DinMember[]>([])
  const [dinLoading, setDinLoading] = useState(false)
  const [dinMessageInputs, setDinMessageInputs] = useState<Record<string, string>>({})
  const [dinSending, setDinSending] = useState<string | null>(null)

  // Fetch org info for dynamic banner
  const fetchOrgInfo = useCallback(async () => {
    try {
      const res = await fetch("/api/demo/event-status")
      const json = await res.json()
      if (json.success) {
        setOrgInfo({
          property_name: json.property_name || "",
          property_value: json.property_value || "",
        })
      }
    } catch (err) {
      console.error("Failed to fetch org info:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrgInfo()
  }, [fetchOrgInfo])

  // Fetch DIN members when tab opens
  const fetchDinMembers = useCallback(async () => {
    setDinLoading(true)
    try {
      const res = await fetch(`/api/donna-drive/din?my_role_id=${roleSlug}`)
      const json = await res.json()
      if (json.success) {
        setDinMembers(json.members || [])
      }
    } catch (err) {
      console.error("Failed to fetch DIN members:", err)
    } finally {
      setDinLoading(false)
    }
  }, [roleSlug])

  useEffect(() => {
    if (activeTab === "din") {
      fetchDinMembers()
    }
  }, [activeTab, fetchDinMembers])

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "secretary", label: "Secretary", icon: <Sparkles className="w-4 h-4" /> },
    { id: "din", label: "DIN Network", icon: <MessageSquare className="w-4 h-4" /> }
  ]

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || sendingChat) return

    const userMessage = chatInput
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }])
    setChatInput("")
    setSendingChat(true)

    try {
      const res = await fetch('/api/donna-drive/secretary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, roleId: roleSlug })
      })
      const json = await res.json()
      if (json.success) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: json.reply }])
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an issue: ${json.message || 'Unknown error'}` }])
      }
    } catch (err) {
      console.error(err)
      setChatHistory(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again." }])
    } finally {
      setSendingChat(false)
    }
  }

  const handleDinPing = async (memberId: string) => {
    const message = dinMessageInputs[memberId]?.trim()
    if (!message) {
      toast.error("Please enter a message to send.")
      return
    }
    setDinSending(memberId)
    try {
      const res = await fetch('/api/donna-drive/din', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetMemberId: memberId, message, senderRoleId: roleSlug })
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Ping sent successfully!")
        setDinMessageInputs(prev => ({ ...prev, [memberId]: "" }))
      } else {
        toast.error(json.message || "Failed to send ping.")
      }
    } catch {
      toast.error("Error sending DIN ping.")
    } finally {
      setDinSending(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-white/50">Loading your DONNA Drive experience…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Dynamic demo banner */}
      <div className="bg-gradient-to-r from-purple-600/20 via-cyan-600/20 to-purple-600/20 border-b border-white/10 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/70">
              <span className="font-semibold text-white/90">DONNA Drive</span>
              {orgInfo.property_name && ` · ${orgInfo.property_name}`}
              {orgInfo.property_value && ` · ${orgInfo.property_value}`}
            </span>
          </div>
          <Link href="/drive" className="text-xs text-white/40 hover:text-white/70 transition-colors">
            Exit Demo
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Role header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/drive" className="text-white/40 hover:text-white/70 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-white">{roleSlug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h1>
              <p className="text-sm text-white/50">Welcome, {userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {orgInfo.property_name && (
              <div className="glass rounded-lg px-3 py-1.5 text-xs text-white/60 border border-white/10">
                <Building2 className="w-3 h-3 inline mr-1" />
                {orgInfo.property_name}
              </div>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                ${activeTab === tab.id
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* SECRETARY TAB */}
            {activeTab === "secretary" && (
              <div className="glass rounded-xl border border-white/10 flex flex-col h-[70vh]">
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-xl p-4 text-sm ${msg.role === 'user' ? 'bg-cyan-500/20 text-white' : 'bg-white/5 border border-white/10 text-white/90 whitespace-pre-wrap'}`}>
                        {msg.role === 'assistant' && <Sparkles className="w-4 h-4 text-cyan-400 inline-block mr-2 mb-1" />}
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {sendingChat && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleSendChat} className="p-4 border-t border-white/10 bg-black/20 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask Donna what to do next..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400/50"
                  />
                  <button
                    type="submit"
                    disabled={sendingChat || !chatInput.trim()}
                    className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-black p-3 rounded-xl transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            )}

            {/* DIN TAB */}
            {activeTab === "din" && (
              <div className="glass rounded-xl border border-white/10 p-6 min-h-[70vh]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-400" /> DIN Matchmaking
                  </h2>
                  <button
                    onClick={fetchDinMembers}
                    className="text-xs text-white/40 hover:text-white/70 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Refresh
                  </button>
                </div>
                <p className="text-sm text-white/50 mb-6">Connect with other roles in your scenario to complete tasks, send bids, or refer leads.</p>

                {dinLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                  </div>
                ) : dinMembers.length === 0 ? (
                  <div className="p-12 text-center text-white/30 text-sm border border-dashed border-white/10 rounded-xl">
                    No other participants are currently in this event. Waiting for attendees to join...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dinMembers.map((member) => (
                      <div key={member.id} className="glass rounded-xl border border-white/10 p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center text-sm font-semibold text-white/70 shrink-0">
                            {member.name?.split(" ").map((n: string) => n[0]).join("") || <Users className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-medium text-white">{member.name}</h3>
                            {member.company && <p className="text-xs text-white/50">{member.company}</p>}
                            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-purple-400/10 text-purple-400 border border-purple-400/20">
                              {member.roleLabel || member.roleId || "Unassigned"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={dinMessageInputs[member.id] || ""}
                            onChange={e => setDinMessageInputs(prev => ({ ...prev, [member.id]: e.target.value }))}
                            placeholder="Type a message..."
                            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400/50"
                          />
                          <button
                            onClick={() => handleDinPing(member.id)}
                            disabled={dinSending === member.id}
                            className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors shrink-0"
                          >
                            {dinSending === member.id ? "..." : "Ping"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  )
}

export default function DriveDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent flex items-center justify-center"><div className="w-10 h-10 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto" /></div>}>
      <DriveDashboardContent />
    </Suspense>
  )
}
