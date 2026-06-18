"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Settings,
  Database,
  Play,
  Lock,
  RefreshCw,
  AlertTriangle,
  FileWarning,
  Clock,
  TrendingDown,
  FileX,
  Zap,
  Users,
  CheckCircle,
  Mail,
  LogOut
} from "lucide-react"
import { toast } from "sonner"
import type { EventDefinition } from "@/lib/donna-drive/constants"
import { supabase } from "@/lib/supabase"

const ICONS: Record<string, React.ElementType> = {
  AlertTriangle: AlertTriangle,
  FileWarning: FileWarning,
  Clock: Clock,
  TrendingDown: TrendingDown,
  FileX: FileX,
}

const SCENARIOS = [
  { id: "vernon", name: "Vernon Commerce Center" },
  { id: "monterey", name: "Monterey Medical Center" },
  { id: "downtown", name: "Downtown Retail Center" },
  { id: "riverside", name: "Riverside Multifamily" },
  { id: "commerce", name: "Commerce Distribution Center" },
]

export default function FacilitatorDashboard() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isAuthenticating, setIsAuthenticating] = useState(true)

  const [selectedScenario, setSelectedScenario] = useState("vernon")
  const [events, setEvents] = useState<EventDefinition[]>([])
  const [isSeeding, setIsSeeding] = useState(false)
  const [injectingEvent, setInjectingEvent] = useState<string | null>(null)
  
  // Stats state
  const [stats, setStats] = useState<any>(null)
  const [isFetchingStats, setIsFetchingStats] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsAuthenticating(false)
      if (session) {
        fetchEvents()
        fetchStats(session.access_token)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchEvents()
        fetchStats(session.access_token)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Poll stats every 10 seconds
  useEffect(() => {
    if (!session) return
    const interval = setInterval(() => {
      fetchStats(session.access_token)
    }, 10000)
    return () => clearInterval(interval)
  }, [session])

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/demo/event")
      const data = await res.json()
      if (data.success && data.events) {
        setEvents(data.events)
      } else {
        // Events endpoint returned but no events — set empty so UI doesn't show "Loading"
        setEvents([])
      }
    } catch (err) {
      console.error("Failed to fetch events", err)
      setEvents([]) // ensure we exit the loading state
    }
  }

  const fetchStats = async (token: string) => {
    setIsFetchingStats(true)
    try {
      const res = await fetch("/api/demo/facilitator/stats", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success && data.stats) {
        setStats(data.stats)
      } else if (res.status === 403 || res.status === 401) {
        // User is not an admin, sign out automatically
        toast.error(data.message || "Unauthorized")
        supabase.auth.signOut()
      } else {
        // Stats failed (maybe tables don't exist yet) — set empty stats so UI renders
        setStats({ totalUsersInQueue: 0, progressByRole: {} })
      }
    } catch (err) {
      console.error("Failed to fetch stats", err)
      // Set empty stats so UI doesn't stay in loading state
      setStats({ totalUsersInQueue: 0, progressByRole: {} })
    } finally {
      setIsFetchingStats(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticating(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setIsAuthenticating(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleSeed = async () => {
    if (!session) return

    setIsSeeding(true)
    try {
      const res = await fetch("/api/demo/seed", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ scenario: selectedScenario }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Seeded ${selectedScenario} scenario successfully!`)
        fetchStats(session.access_token)
      } else {
        toast.error(data.message || "Failed to seed data")
      }
    } catch (err) {
      toast.error("An error occurred during seeding")
      console.error(err)
    } finally {
      setIsSeeding(false)
    }
  }

  const handleInjectEvent = async (eventType: string) => {
    if (!session) return

    setInjectingEvent(eventType)
    try {
      const res = await fetch("/api/demo/event", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          event_type: eventType,
          org_id: "dd-org-001",
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(
          `Event injected! Created: ${data.emails_created} emails, ${data.tasks_created} tasks, ${data.notifications_created} notifications.`
        )
        fetchStats(session.access_token)
      } else {
        toast.error(data.message || "Failed to inject event")
      }
    } catch (err) {
      toast.error("An error occurred injecting event")
      console.error(err)
    } finally {
      setInjectingEvent(null)
    }
  }

  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#0C0F16] to-[#10121A]">
        <RefreshCw className="w-8 h-8 text-rose-400 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#0C0F16] to-[#10121A]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="glass rounded-2xl border border-white/10 p-8 space-y-6 bg-black/40 backdrop-blur-md">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/20 mb-4">
                <Lock className="w-8 h-8 text-rose-400" />
              </div>
              <h1 className="text-2xl font-semibold text-white">Admin Access Required</h1>
              <p className="text-white/70">Sign in to access the Facilitator Dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500/50 outline-none"
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
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500/50 outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 rounded-xl transition-colors mt-6"
              >
                Sign In
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden py-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-rose-600/10 via-orange-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10">
              <Settings className="w-7 h-7 text-rose-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Facilitator Dashboard</h1>
              <p className="mt-1 text-white/50">Control the DONNA Drive demo environment</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </motion.div>

        {/* Live Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="glass rounded-2xl border border-white/10 p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 text-white/60 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="font-medium">Active Participants</span>
            </div>
            <div className="text-4xl font-bold">
              {stats ? stats.totalUsersInQueue : '-'}
            </div>
          </div>
          
          <div className="glass rounded-2xl border border-white/10 p-6 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-white/60">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="font-medium">Live Task Progress</span>
              </div>
              {isFetchingStats && <RefreshCw className="w-4 h-4 animate-spin text-white/30" />}
            </div>
            
            <div className="space-y-4 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
              {!stats || !stats.progressByRole ? (
                <div className="text-white/30 text-sm">Loading progress...</div>
              ) : Object.keys(stats.progressByRole).length === 0 ? (
                <div className="text-white/30 text-sm">No tasks assigned yet. Seed database to begin.</div>
              ) : (
                Object.entries(stats.progressByRole).map(([roleSlug, data]: [string, any]) => {
                  const percentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
                  return (
                    <div key={roleSlug} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-white/80 capitalize">{roleSlug.replace(/_/g, ' ')}</span>
                        <span className="text-white/60">{data.completed} / {data.total} ({percentage}%)</span>
                      </div>
                      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
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
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Seeding Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-2xl border border-white/10 p-6 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold">Environment Seeding</h2>
            </div>

            <div className="flex-1">
              <label className="block text-sm text-white/50 mb-2">Select Scenario</label>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all mb-6 appearance-none cursor-pointer"
              >
                {SCENARIOS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-zinc-900">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSeeding ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Database className="w-5 h-5" />
              )}
              {isSeeding ? "Seeding..." : "Seed Database"}
            </button>
          </motion.div>

          {/* Event Injection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-2xl border border-white/10 p-6 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-xl font-semibold">Live Event Injection</h2>
            </div>

            <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {events.length === 0 ? (
                <div className="text-white/40 text-sm text-center py-8">No events available. Ensure DONNA_DRIVE_ENABLED is set to true.</div>
              ) : (
                events.map((event) => {
                  const Icon = ICONS[event.icon] || Play
                  return (
                    <div
                      key={event.type}
                      className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col gap-3 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-md bg-${event.color}-500/10 text-${event.color}-400 shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <h3 className="font-medium text-sm">{event.label}</h3>
                        </div>
                        <button
                          onClick={() => handleInjectEvent(event.type)}
                          disabled={injectingEvent === event.type}
                          className="bg-white/10 hover:bg-white/20 text-white text-xs py-1.5 px-3 rounded-md transition-colors flex items-center gap-1 shrink-0 disabled:opacity-50"
                        >
                          {injectingEvent === event.type ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                          Inject
                        </button>
                      </div>
                      <p className="text-xs text-white/40 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
