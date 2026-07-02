"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Settings, Database, Play, Lock, RefreshCw, AlertTriangle, FileWarning,
  Clock, TrendingDown, FileX, Zap, Users, CheckCircle, Mail, LogOut,
  ArrowLeft, ArrowRight, Gavel, Sparkles, MessageSquare, ShieldCheck,
  ChevronDown, CheckCircle2, Circle
} from "lucide-react"
import { toast } from "sonner"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { DEMO_EVENTS } from "@/lib/donna-drive/constants"
import { SCENARIOS } from "@/lib/donna-drive/scenarios"

type FacilitatorTab = "dashboard" | "new_event" | "staged_live" | "view_old"

export default function FacilitatorDashboard() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [activeSecret, setActiveSecret] = useState("")
  const [loginMethod, setLoginMethod] = useState<"email" | "secret">("email")
  const [isAuthenticating, setIsAuthenticating] = useState(true)

  // Tab State
  const [activeTab, setActiveTab] = useState<FacilitatorTab>("dashboard")

  // Event State
  const [orgStatus, setOrgStatus] = useState("inactive")
  const [orgName, setOrgName] = useState("")
  const [propertyName, setPropertyName] = useState("")
  const [propertyValue, setPropertyValue] = useState("")
  const [orgDescription, setOrgDescription] = useState("")
  
  // Attendees & History
  const [members, setMembers] = useState<any[]>([])
  const [pastEvents, setPastEvents] = useState<any[]>([])
  const [expandedPastEventId, setExpandedPastEventId] = useState<string | null>(null)
  
  // New Event Form State
  const [selectedScenario, setSelectedScenario] = useState<string>(SCENARIOS[0].id)
  const [userCountInput, setUserCountInput] = useState(5)
  const [isStaging, setIsStaging] = useState(false)

  // Live progress stats
  const [stats, setStats] = useState<any>(null)
  const [isFetchingStats, setIsFetchingStats] = useState(false)
  
  // Chat State
  const [chats, setChats] = useState<any[]>([])
  const [selectedChatMemberId, setSelectedChatMemberId] = useState<string>("")
  const [chatReplyInput, setChatReplyInput] = useState("")
  const [sendingChat, setSendingChat] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)

  // Check auth & fetch initial data
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsAuthenticating(false)
      return
    }

    let subscription: any = null

    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        setIsAuthenticating(false)
        if (session) {
          fetchStatusAndMembers()
        }
      }).catch(err => {
        console.error("Auth session retrieval error:", err)
        setIsAuthenticating(false)
      })

      const authChangeRes = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        if (session) {
          fetchStatusAndMembers()
        }
      })
      subscription = authChangeRes.data?.subscription
    } catch (err) {
      console.error("Failed to initialize auth listeners:", err)
      setIsAuthenticating(false)
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  // Poll status, statistics, and chats
  useEffect(() => {
    if (!session && !activeSecret) return

    fetchStatusAndMembers()
    fetchStats()
    fetchChats()

    const interval = setInterval(() => {
      fetchStatusAndMembers()
      fetchStats()
      fetchChats()
    }, 4000)

    return () => clearInterval(interval)
  }, [session, selectedChatMemberId])

  // Scroll chat to bottom on updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chats])

  // Fetch Event Status, Attendees Staged and History
  const fetchStatusAndMembers = async () => {
    try {
      const res = await fetch("/api/demo/event-status", {
        headers: {
          ...(session ? { "Authorization": `Bearer ${session.access_token}` } : {}),
          ...(activeSecret ? { "x-facilitator-secret": activeSecret } : {})
        }
      })
      const data = await res.json()
      if (data.success) {
        setOrgStatus(data.org_status)
        setOrgName(data.org_name)
        setPropertyName(data.property_name)
        setPropertyValue(data.property_value)
        setOrgDescription(data.org_description)
        setMembers(data.members || [])
        setPastEvents(data.past_events || [])
      }
    } catch (err) {
      console.error("Failed to fetch event status:", err)
    }
  }

  // Fetch Live Task Progress statistics
  const fetchStats = async () => {
    if (!session && !activeSecret) return
    setIsFetchingStats(true)
    try {
      const res = await fetch("/api/demo/facilitator/stats", {
        headers: { 
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
          ...(activeSecret ? { "x-facilitator-secret": activeSecret } : {})
        }
      })
      const data = await res.json()
      if (data.success && data.stats) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error("Failed to fetch statistics:", err)
    } finally {
      setIsFetchingStats(false)
    }
  }

  // Fetch Live Support Chat Messages
  const fetchChats = async () => {
    try {
      const url = selectedChatMemberId 
        ? `/api/demo/chat?member_id=${selectedChatMemberId}`
        : '/api/demo/chat'
      const res = await fetch(url, {
        headers: {
          ...(session ? { "Authorization": `Bearer ${session.access_token}` } : {}),
          ...(activeSecret ? { "x-facilitator-secret": activeSecret } : {})
        }
      })
      const data = await res.json()
      if (data.success) {
        setChats(data.chats || [])
      }
    } catch (err) {
      console.error("Failed to fetch support chats:", err)
    }
  }

  // Form Submission — Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticating(true)
    
    if (loginMethod === "secret") {
      setActiveSecret(secretKey)
      toast.success("Signed in with Secret Key!")
      setIsAuthenticating(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setIsAuthenticating(false)
    } else {
      toast.success("Signed in successfully!")
    }
  }

  // Log out
  const handleLogout = async () => {
    if (activeSecret) {
      setActiveSecret("")
      setSecretKey("")
    } else {
      await supabase.auth.signOut()
      setSession(null)
    }
  }

  // Stage a new event (Move to Staging)
  const handleStageEvent = async () => {
    if (!session && !activeSecret) return
    setIsStaging(true)
    
    const scenarioDef = SCENARIOS.find(s => s.id === selectedScenario)
    
    try {
      const res = await fetch("/api/demo/event-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session ? { "Authorization": `Bearer ${session.access_token}` } : {}),
          ...(activeSecret ? { "x-facilitator-secret": activeSecret } : {})
        },
        body: JSON.stringify({
          action: "stage",
          scenario: selectedScenario,
          name: scenarioDef?.name || "Interactive CRE Simulation",
          description: scenarioDef?.scenarioBrief || ""
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Successfully staged the ${scenarioDef?.name} scenario!`)
        fetchStatusAndMembers()
        setActiveTab("staged_live")
      } else {
        toast.error(data.message || "Failed to stage scenario.")
      }
    } catch (err) {
      toast.error("Error staging event.")
    } finally {
      setIsStaging(false)
    }
  }

  // Auto-Sort Users inside Staging Room
  const handleAutoSort = async () => {
    if (!session && !activeSecret) return
    try {
      const res = await fetch("/api/demo/event-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session ? { "Authorization": `Bearer ${session.access_token}` } : {}),
          ...(activeSecret ? { "x-facilitator-secret": activeSecret } : {})
        },
        body: JSON.stringify({ action: "auto_sort" })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Attendees auto-sorted to required roles!")
        fetchStatusAndMembers()
      } else {
        toast.error(data.message || "Failed to auto-sort.")
      }
    } catch (err) {
      toast.error("Error auto-sorting users.")
    }
  }

  // Update Individual Attendee Role slug
  const handleAssignRole = async (memberId: string, roleSlug: string) => {
    if (!session && !activeSecret) return
    try {
      const res = await fetch("/api/demo/event-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session ? { "Authorization": `Bearer ${session.access_token}` } : {}),
          ...(activeSecret ? { "x-facilitator-secret": activeSecret } : {})
        },
        body: JSON.stringify({
          action: "assign_role",
          member_id: memberId,
          role_slug: roleSlug
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Attendee role updated.")
        fetchStatusAndMembers()
      } else {
        toast.error(data.message || "Failed to assign role.")
      }
    } catch (err) {
      toast.error("Error updating user role.")
    }
  }

  // Start Live Event
  const handleStartLiveEvent = async () => {
    if (!session && !activeSecret) return
    try {
      const res = await fetch("/api/demo/event-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session ? { "Authorization": `Bearer ${session.access_token}` } : {}),
          ...(activeSecret ? { "x-facilitator-secret": activeSecret } : {})
        },
        body: JSON.stringify({ action: "start" })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Event is now LIVE! Attendees notified.")
        fetchStatusAndMembers()
      } else {
        toast.error(data.message || "Failed to start live event.")
      }
    } catch (err) {
      toast.error("Error starting event.")
    }
  }

  // End Live Event
  const handleEndEvent = async () => {
    if (!session && !activeSecret) return
    if (!confirm("Are you sure you want to end this event? This will archive the progress and reset the room.")) return

    try {
      const res = await fetch("/api/demo/event-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session ? { "Authorization": `Bearer ${session.access_token}` } : {}),
          ...(activeSecret ? { "x-facilitator-secret": activeSecret } : {})
        },
        body: JSON.stringify({ action: "end" })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Event successfully completed and archived!")
        fetchStatusAndMembers()
        setActiveTab("dashboard")
      } else {
        toast.error(data.message || "Failed to end event.")
      }
    } catch (err) {
      toast.error("Error ending event.")
    }
  }

  // Inject Scenario Incident
  const handleInjectEvent = async (eventType: string) => {
    if (!session && !activeSecret) return
    try {
      const res = await fetch("/api/demo/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session ? { "Authorization": `Bearer ${session.access_token}` } : {}),
          ...(activeSecret ? { "x-facilitator-secret": activeSecret } : {})
        },
        body: JSON.stringify({
          event_type: eventType,
          org_id: "dd-org-001"
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Injected Incident: ${eventType.replace(/_/g, ' ')}!`)
        fetchStats()
      } else {
        toast.error(data.message || "Failed to inject event.")
      }
    } catch (err) {
      toast.error("Error injecting event.")
    }
  }

  // Send Support Chat Reply
  const handleSendChatReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatReplyInput.trim() || !selectedChatMemberId) return

    setSendingChat(true)
    try {
      const res = await fetch("/api/demo/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(session ? { "Authorization": `Bearer ${session.access_token}` } : {}),
          ...(activeSecret ? { "x-facilitator-secret": activeSecret } : {})
        },
        body: JSON.stringify({
          org_id: "dd-org-001",
          member_id: selectedChatMemberId,
          sender: "facilitator",
          message: chatReplyInput
        })
      })
      const data = await res.json()
      if (data.success) {
        setChatReplyInput("")
        fetchChats()
      } else {
        toast.error("Failed to send message.")
      }
    } catch (err) {
      toast.error("Error sending reply.")
    } finally {
      setSendingChat(false)
    }
  }

  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#0C0F16] to-[#10121A]">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  // Supabase Configuration Guard
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#0C0F16] to-[#10121A]">
        <div className="w-full max-w-md glass rounded-2xl border border-white/10 p-8 space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 text-amber-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold text-white">Database Required</h1>
          <p className="text-white/70 text-sm">
            The Facilitator Dashboard controls the live transaction database and requires an active Supabase connection.
          </p>
          <a
            href="/drive"
            className="block w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl border border-white/10 transition-colors text-center text-sm"
          >
            Back to DONNA Drive
          </a>
        </div>
      </div>
    )
  }

  // Authentication Login Screen
  if (!session && !activeSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#0C0F16] to-[#10121A]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="glass rounded-2xl border border-white/10 p-8 space-y-6 bg-black/40 backdrop-blur-md">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10">
                <Lock className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-semibold text-white">Facilitator Login</h1>
              <p className="text-white/50 text-sm">Access the live simulation control panel</p>
            </div>

            <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
              <button 
                onClick={() => setLoginMethod("email")}
                className={`flex-1 text-sm py-2 rounded-md font-medium transition-colors ${loginMethod === "email" ? "bg-cyan-500/20 text-cyan-400" : "text-white/50 hover:text-white"}`}
              >
                Email
              </button>
              <button 
                onClick={() => setLoginMethod("secret")}
                className={`flex-1 text-sm py-2 rounded-md font-medium transition-colors ${loginMethod === "secret" ? "bg-cyan-500/20 text-cyan-400" : "text-white/50 hover:text-white"}`}
              >
                Secret Key
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginMethod === "email" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-400/50 outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-400/50 outline-none"
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm text-white/70 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Facilitator Secret
                  </label>
                  <input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Enter secret key..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-400/50 outline-none"
                    required
                  />
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-3 rounded-xl transition-colors mt-6"
              >
                Sign In
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    )
  }

  // Active scenario definition details
  const activeScenarioDef = SCENARIOS.find(s => s.id === selectedScenario)
  // Find live scenario roles based on propertyName matching scenario name
  const liveScenarioDef = SCENARIOS.find(s => s.name === propertyName)
  const activeRoles = liveScenarioDef?.roles || []

  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-cyan-600/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10">
              <Settings className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-light tracking-tight">Facilitator Center</h1>
              <p className="text-xs text-white/40 mt-1">Configure, stage, and run live transaction events</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs text-white/60"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* ----------------- TAB VIEW 1: MAIN DASHBOARD ----------------- */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1: Create New Event */}
            <div
              onClick={() => setActiveTab("new_event")}
              className="group cursor-pointer glass rounded-2xl border border-white/10 p-6 space-y-4 hover:border-cyan-400/40 hover:bg-white/[0.02] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Create New Event</h3>
                <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
                  Stage a new interactive scenario (e.g. Vernon, Monterey), configure staging parameters, and enroll participants.
                </p>
              </div>
              <div className="flex items-center text-xs text-cyan-400 font-medium pt-2">
                Launch Wizard <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Box 2: Staged / Live Event Settings */}
            <div
              onClick={() => setActiveTab("staged_live")}
              className="group cursor-pointer glass rounded-2xl border border-white/10 p-6 space-y-4 hover:border-purple-400/40 hover:bg-white/[0.02] transition-all relative"
            >
              {/* Corner Indicator Status Light */}
              <div className="absolute top-6 right-6 flex items-center gap-2">
                {orgStatus === 'staged' && (
                  <>
                    <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">Staged</span>
                    <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse shadow-md shadow-amber-400/40" />
                  </>
                )}
                {orgStatus === 'live' && (
                  <>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded">Live</span>
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-400/40" />
                  </>
                )}
                {orgStatus === 'inactive' && (
                  <span className="text-[10px] uppercase font-bold text-white/30">No Event</span>
                )}
              </div>

              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Staged / Live Controls</h3>
                <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
                  Monitor the active staging room, adjust attendee roles, check live task checklists, inject incident alerts, and chat.
                </p>
              </div>
              <div className="flex items-center text-xs text-purple-400 font-medium pt-2">
                Open Controls <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Box 3: View An Old Event */}
            <div
              onClick={() => setActiveTab("view_old")}
              className="group cursor-pointer glass rounded-2xl border border-white/10 p-6 space-y-4 hover:border-white/30 hover:bg-white/[0.02] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/60 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">View Old Events</h3>
                <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
                  Inspect results of past transaction runs, check attendee counts, and review registered user lists.
                </p>
              </div>
              <div className="flex items-center text-xs text-white/60 font-medium pt-2">
                View History <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

          </div>
        )}

        {/* ----------------- TAB VIEW 2: CREATE NEW EVENT ----------------- */}
        {activeTab === "new_event" && (
          <div className="space-y-6">
            <button
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Form panel */}
              <div className="md:col-span-2 glass rounded-2xl border border-white/10 p-6 space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" /> Create Event
                </h2>

                <div className="space-y-4">
                  {/* Scenario selection */}
                  <div className="space-y-2">
                    <label className="text-xs text-white/60">Choose Scenario</label>
                    <div className="grid grid-cols-1 gap-2">
                      <select
                        value={selectedScenario}
                        onChange={(e) => setSelectedScenario(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-400/50 appearance-none cursor-pointer text-sm"
                      >
                        {SCENARIOS.map((s) => (
                          <option key={s.id} value={s.id} className="bg-zinc-900">
                            {s.name} ({s.propertyType})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Counter: Choose number of users */}
                  <div className="space-y-2">
                    <label className="text-xs text-white/60">Choose Target Number of Users</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setUserCountInput(Math.max(1, userCountInput - 1))}
                        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={userCountInput}
                        onChange={(e) => setUserCountInput(parseInt(e.target.value) || 1)}
                        className="w-16 h-10 bg-black/40 border border-white/10 rounded-lg text-center text-sm font-semibold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setUserCountInput(userCountInput + 1)}
                        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                      <span className="text-xs text-white/40 ml-2">Assures enough staging slots.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex gap-4">
                  <button
                    onClick={handleAutoSort}
                    className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Users className="w-4 h-4 text-cyan-400" /> Auto-Sort Queue
                  </button>
                  <button
                    onClick={handleStageEvent}
                    disabled={isStaging}
                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isStaging ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {isStaging ? "Staging Scenario..." : "Move to Staging"}
                  </button>
                </div>
              </div>

              {/* Scenario details panel */}
              <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Scenario Context</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold">{activeScenarioDef?.name}</h4>
                    <span className="inline-block px-2 py-0.5 bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-semibold rounded mt-1">
                      {activeScenarioDef?.propertyType}
                    </span>
                  </div>
                  <p className="text-xs text-white/55 leading-relaxed">
                    {activeScenarioDef?.scenarioBrief}
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ----------------- TAB VIEW 3: STAGED / LIVE EVENT CONTROLS ----------------- */}
        {activeTab === "staged_live" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab("dashboard")}
                className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
              </button>
              
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs">
                <span className="text-white/40">Status:</span>
                <span className={`font-semibold uppercase tracking-wider ${
                  orgStatus === 'live' ? 'text-emerald-400' :
                  orgStatus === 'staged' ? 'text-amber-400' : 'text-white/40'
                }`}>
                  {orgStatus}
                </span>
              </div>
            </div>

            {/* Split staged / live management */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Box: Staging Waiting Room Queue (Col Span 5) */}
              <div className="lg:col-span-5 glass rounded-2xl border border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" /> Waiting Room (Staging)
                  </h2>
                  <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-white/60">
                    {members.length} Users
                  </span>
                </div>

                <div className="space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
                  {members.length === 0 ? (
                    <div className="text-center py-12 text-white/30 text-xs">
                      No attendees currently in the waiting room. Ask users to sign up / log in to join staging.
                    </div>
                  ) : (
                    members.map((member) => (
                      <div key={member.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-semibold flex items-center gap-1.5">
                              {member.display_name}
                              <span className="text-[10px] font-normal text-white/40">{member.email}</span>
                            </div>
                            <div className="text-[10px] text-white/40 mt-0.5">Vertical: {member.industry}</div>
                          </div>
                        </div>

                        {/* Role Selector dropdown */}
                        <div className="flex items-center justify-between gap-4 pt-1">
                          <span className="text-xs text-white/60">Assign Role:</span>
                          <select
                            value={member.donna_drive_roles?.slug || ""}
                            onChange={(e) => handleAssignRole(member.id, e.target.value)}
                            className="bg-black/50 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400/50 cursor-pointer"
                          >
                            <option value="">-- Choose Role --</option>
                            {activeRoles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {orgStatus === 'staged' && (
                  <div className="pt-4 border-t border-white/5 flex gap-2">
                    <button
                      onClick={handleAutoSort}
                      className="w-1/2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Auto-Sort Queue
                    </button>
                    <button
                      onClick={handleStartLiveEvent}
                      className="w-1/2 py-3 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Play className="w-4 h-4 fill-black" /> Start Live Event
                    </button>
                  </div>
                )}
              </div>

              {/* Right Box: Live Tools Box (Col Span 7) */}
              <div className={`lg:col-span-7 space-y-6 ${orgStatus !== 'live' ? 'opacity-40 pointer-events-none' : ''}`}>
                
                {/* 1. Live Task Progress */}
                <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Live Task Progress
                    </h3>
                    {isFetchingStats && <RefreshCw className="w-3.5 h-3.5 animate-spin text-white/30" />}
                  </div>

                  <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                    {!stats || !stats.progressByRole || Object.keys(stats.progressByRole).length === 0 ? (
                      <div className="text-white/40 text-xs py-4 text-center">
                        Task tracker inactive. Attendees will populate checklist logs on load.
                      </div>
                    ) : (
                      Object.entries(stats.progressByRole).map(([roleSlug, data]: [string, any]) => {
                        const percentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
                        return (
                          <div key={roleSlug} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-white/80 capitalize">{roleSlug.replace(/_/g, ' ')}</span>
                              <span className="text-white/40 font-semibold">{data.completed} / {data.total} ({percentage}%)</span>
                            </div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-in-out"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* 2. Help Desk Live Chat */}
                <div className="glass rounded-2xl border border-white/10 p-6 flex flex-col h-[340px]">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-3">
                    <MessageSquare className="w-4 h-4" /> Attendee Help Desk
                  </h3>

                  {/* Active Chats Grid */}
                  <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
                    {/* Left: Attendee List */}
                    <div className="col-span-4 border-r border-white/5 pr-2 overflow-y-auto custom-scrollbar space-y-1 text-xs">
                      <button
                        onClick={() => setSelectedChatMemberId("")}
                        className={`w-full text-left p-2 rounded-lg transition-colors truncate ${!selectedChatMemberId ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'}`}
                      >
                        All Active Messages
                      </button>
                      {members.map(m => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedChatMemberId(m.id)}
                          className={`w-full text-left p-2 rounded-lg transition-colors truncate ${selectedChatMemberId === m.id ? 'bg-white/10 text-white font-medium' : 'text-white/55 hover:bg-white/5'}`}
                        >
                          {m.display_name}
                        </button>
                      ))}
                    </div>

                    {/* Right: Message Stream */}
                    <div className="col-span-8 flex flex-col justify-between overflow-hidden">
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2 custom-scrollbar">
                        {chats.length === 0 ? (
                          <div className="text-center text-white/30 text-xs py-12">
                            No chat logs recorded yet.
                          </div>
                        ) : (
                          chats.map((chat) => {
                            const isMe = chat.sender === 'facilitator'
                            return (
                              <div key={chat.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`text-[10px] text-white/40 mb-0.5`}>
                                  {isMe ? 'Facilitator' : chat.donna_drive_members?.display_name || 'Attendee'}
                                </div>
                                <div className={`p-2.5 rounded-lg text-xs max-w-[85%] leading-relaxed ${isMe ? 'bg-purple-600/20 border border-purple-500/30 text-purple-100' : 'bg-white/5 border border-white/10 text-white/90'}`}>
                                  {chat.message}
                                </div>
                              </div>
                            )
                          })
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Reply Input Form */}
                      {selectedChatMemberId && (
                        <form onSubmit={handleSendChatReply} className="flex gap-2 pt-2 border-t border-white/5">
                          <input
                            type="text"
                            value={chatReplyInput}
                            onChange={(e) => setChatReplyInput(e.target.value)}
                            placeholder="Type reply to attendee..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400/50"
                          />
                          <button
                            type="submit"
                            disabled={sendingChat || !chatReplyInput.trim()}
                            className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-black font-semibold text-xs rounded-lg transition-colors"
                          >
                            Reply
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Live Event Injections */}
                <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> Live Event Injections
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {DEMO_EVENTS.map((event) => (
                      <button
                        key={event.type}
                        onClick={() => handleInjectEvent(event.type)}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left flex flex-col gap-1 transition-all group"
                      >
                        <div className="text-xs font-semibold text-white/80 group-hover:text-white flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                          {event.label}
                        </div>
                        <p className="text-[10px] text-white/40 leading-snug truncate w-full">
                          {event.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. End Event Panel */}
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleEndEvent}
                    className="px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 animate-bounce" /> End Simulation Event
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ----------------- TAB VIEW 4: VIEW AN OLD EVENT ----------------- */}
        {activeTab === "view_old" && (
          <div className="space-y-6">
            <button
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>

            <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-white/60" /> Completed Event History
              </h2>

              <div className="space-y-2">
                {pastEvents.length === 0 ? (
                  <div className="text-center py-16 text-white/30 text-sm">
                    No completed event history found in database.
                  </div>
                ) : (
                  pastEvents.map((event) => {
                    const isExpanded = expandedPastEventId === event.id
                    
                    return (
                      <div key={event.id} className="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden">
                        {/* Event title summary row */}
                        <div
                          onClick={() => setExpandedPastEventId(isExpanded ? null : event.id)}
                          className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/[0.02] transition-colors"
                        >
                          <div>
                            <div className="text-sm font-semibold text-white/80">{event.name}</div>
                            <div className="text-[10px] text-white/40 mt-0.5">
                              Run Date: {new Date(event.created_at).toLocaleDateString()} at {new Date(event.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 rounded">
                              Completed
                            </span>
                            <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {/* Collapsible details content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 border-t border-white/5 bg-black/40 space-y-4 text-xs">
                                <div>
                                  <div className="text-white/40 font-semibold mb-1">Scenario Details:</div>
                                  <div className="text-white/70 italic bg-white/5 p-3 rounded-lg leading-relaxed">
                                    Property: {event.property_name} ({event.property_value}) <br />
                                    {event.description || "No description provided."}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="text-white/40 font-semibold">Registered User Profiles:</div>
                                  
                                  {/* List profile rows */}
                                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar">
                                    {/* Mock query list: we get all members for this archived org id */}
                                    <ArchivedMembersList orgId={event.id} />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// Inner helper component to query archived member lists dynamically
function ArchivedMembersList({ orgId }: { orgId: string }) {
  const [archMembers, setArchMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArchived() {
      try {
        const { data, error } = await supabase
          .from('donna_drive_members')
          .select('*, donna_drive_roles(label)')
          .eq('org_id', orgId)
        
        if (!error && data) {
          setArchMembers(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadArchived()
  }, [orgId])

  if (loading) {
    return <div className="text-[10px] text-white/30">Loading users...</div>
  }

  if (archMembers.length === 0) {
    return <div className="text-[10px] text-white/30">No attendee records archived.</div>
  }

  return (
    <table className="w-full text-left text-[11px] text-white/60">
      <thead>
        <tr className="border-b border-white/10 text-white/40">
          <th className="py-1.5 font-normal">Name</th>
          <th className="py-1.5 font-normal">Email</th>
          <th className="py-1.5 font-normal">Industry</th>
          <th className="py-1.5 font-normal">Assigned Role</th>
        </tr>
      </thead>
      <tbody>
        {archMembers.map((m) => (
          <tr key={m.id} className="border-b border-white/5">
            <td className="py-1.5 text-white/80 font-medium">{m.display_name}</td>
            <td className="py-1.5">{m.email}</td>
            <td className="py-1.5">{m.industry}</td>
            <td className="py-1.5 text-purple-400">{m.donna_drive_roles?.label || 'Not Assigned'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
