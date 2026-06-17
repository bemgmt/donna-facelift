"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap, AlertTriangle, FileWarning, Clock, TrendingDown, FileX,
  ChevronDown, ChevronUp, CheckCircle2, Loader2,
} from "lucide-react"

const EVENTS = [
  {
    type: "environmental_issue",
    label: "Environmental Issue Discovered",
    description: "Phase I ESA reveals a REC near the loading dock.",
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "red",
  },
  {
    type: "title_easement",
    label: "Title Easement Found",
    description: "Unrecorded utility easement across south parking.",
    icon: <FileWarning className="w-5 h-5" />,
    color: "amber",
  },
  {
    type: "appraisal_delayed",
    label: "Appraisal Delayed",
    description: "Appraiser needs 5 more business days.",
    icon: <Clock className="w-5 h-5" />,
    color: "orange",
  },
  {
    type: "financing_issue",
    label: "Financing Issue",
    description: "DSCR falls below 1.25x threshold.",
    icon: <TrendingDown className="w-5 h-5" />,
    color: "rose",
  },
  {
    type: "missing_escrow_document",
    label: "Missing Escrow Document",
    description: "Anchor tenant estoppel certificate missing.",
    icon: <FileX className="w-5 h-5" />,
    color: "violet",
  },
]

interface FacilitatorPanelProps {
  orgId?: string
  facilitatorSecret?: string
}

export default function FacilitatorPanel({
  orgId = "dd-org-001",
  facilitatorSecret = "",
}: FacilitatorPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [firing, setFiring] = useState<string | null>(null)
  const [fired, setFired] = useState<Set<string>>(new Set())
  const [lastResult, setLastResult] = useState<string | null>(null)

  const triggerEvent = async (eventType: string) => {
    setFiring(eventType)
    setLastResult(null)

    try {
      const res = await fetch("/api/demo/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilitator_secret: facilitatorSecret,
          event_type: eventType,
          org_id: orgId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setFired((prev) => new Set(prev).add(eventType))
        setLastResult(
          `✅ Injected: ${data.emails_created} emails, ${data.tasks_created} tasks, ${data.notifications_created} notifications`
        )
      } else {
        setLastResult(`❌ Error: ${data.message}`)
      }
    } catch (err) {
      setLastResult(`❌ Network error: ${String(err)}`)
    } finally {
      setFiring(null)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50" style={{ maxWidth: "380px" }}>
      {/* Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 text-amber-300 text-sm font-medium hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
      >
        <span className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Facilitator Controls
        </span>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 glass-dark rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="p-4">
              <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">Inject Scenario Event</h3>

              <div className="space-y-2">
                {EVENTS.map((event) => {
                  const isFired = fired.has(event.type)
                  const isFiring = firing === event.type

                  return (
                    <button
                      key={event.type}
                      onClick={() => triggerEvent(event.type)}
                      disabled={isFiring}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm
                        ${isFired
                          ? "bg-white/5 border border-white/5 opacity-60"
                          : `bg-${event.color}-500/10 border border-${event.color}-400/20 hover:bg-${event.color}-500/20`
                        }
                        disabled:cursor-not-allowed
                      `}
                    >
                      <div className={`shrink-0 ${isFired ? "text-white/30" : `text-${event.color}-400`}`}>
                        {isFiring ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isFired ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          event.icon
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className={`font-medium ${isFired ? "text-white/40" : "text-white/80"}`}>
                          {event.label}
                        </div>
                        <div className="text-xs text-white/30 mt-0.5 truncate">{event.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Result feedback */}
              {lastResult && (
                <div className="mt-3 text-xs text-white/50 bg-white/5 rounded-lg px-3 py-2">
                  {lastResult}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
