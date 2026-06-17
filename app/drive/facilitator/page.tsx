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
  Zap
} from "lucide-react"
import { toast } from "sonner"
import type { EventDefinition } from "@/lib/donna-drive/constants"

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
  const [secret, setSecret] = useState("")
  const [selectedScenario, setSelectedScenario] = useState("vernon")
  const [events, setEvents] = useState<EventDefinition[]>([])
  const [isSeeding, setIsSeeding] = useState(false)
  const [injectingEvent, setInjectingEvent] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/demo/event")
        const data = await res.json()
        if (data.success && data.events) {
          setEvents(data.events)
        }
      } catch (err) {
        console.error("Failed to fetch events", err)
      }
    }
    fetchEvents()
  }, [])

  const handleSeed = async () => {
    if (!secret) {
      toast.error("Please enter the facilitator secret")
      return
    }

    setIsSeeding(true)
    try {
      const res = await fetch("/api/demo/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facilitator_secret: secret, scenario: selectedScenario }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Seeded ${selectedScenario} scenario successfully!`)
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
    if (!secret) {
      toast.error("Please enter the facilitator secret")
      return
    }

    setInjectingEvent(eventType)
    try {
      const res = await fetch("/api/demo/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilitator_secret: secret,
          event_type: eventType,
          org_id: "dd-org-001",
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(
          `Event injected! Created: ${data.emails_created} emails, ${data.tasks_created} tasks, ${data.notifications_created} notifications.`
        )
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

  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-rose-600/10 via-orange-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6">
            <Settings className="w-8 h-8 text-rose-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Facilitator Dashboard</h1>
          <p className="mt-4 text-white/50 text-lg">
            Control the DONNA Drive demo environment
          </p>
        </motion.div>

        {/* Secret Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass rounded-2xl border border-white/10 p-6 mb-8 max-w-md mx-auto"
        >
          <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Facilitator Secret
          </label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter secret to unlock controls"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all"
          />
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
                <div className="text-white/40 text-sm text-center py-8">Loading events...</div>
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
