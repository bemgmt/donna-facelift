"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Clock, MicOff, Phone, PhoneCall, UserRound } from "lucide-react"

const CALLS = [
  { id: "call-1", caller: "Morgan Lee", topic: "Investor follow-up", time: "9:24 AM" },
  { id: "call-2", caller: "Alex Rivera", topic: "Pilot scheduling", time: "10:12 AM" },
  { id: "call-3", caller: "Taylor Kim", topic: "DIN capability question", time: "11:03 AM" },
]

const DEFAULT_SCRIPT = [
  "Confirm caller identity and company.",
  "Capture purpose, urgency, and requested next step.",
  "Route investor diligence questions to the data room or founder follow-up.",
]

export default function ReceptionistSandboxInterface() {
  const [activeCall, setActiveCall] = useState<string | null>(null)
  const [notes, setNotes] = useState("Caller asked for a product walkthrough and follow-up materials.")
  const [completed, setCompleted] = useState<string[]>(["Confirm caller identity and company."])

  const currentCaller = useMemo(
    () => CALLS.find((call) => call.id === activeCall) ?? null,
    [activeCall]
  )

  const toggleStep = (step: string) => {
    setCompleted((prev) =>
      prev.includes(step) ? prev.filter((item) => item !== step) : [...prev, step]
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-6 text-white glass-dark backdrop-blur"
      data-tour="receptionist-content"
    >
      <div className="mx-auto flex h-[calc(100vh-3rem)] max-w-7xl flex-col">
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <h1 className="text-2xl font-light">Receptionist</h1>
            <p className="mt-1 text-sm text-white/55">Local call handling sandbox. No voice, Telnyx, or realtime API connection.</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveCall(activeCall ? null : "call-preview")}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-400/15"
          >
            <PhoneCall className="h-4 w-4" />
            {activeCall ? "End Demo Call" : "Start Demo Call"}
          </button>
        </div>

        <div className="grid flex-1 gap-4 overflow-hidden lg:grid-cols-12">
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4 lg:col-span-4">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-white/80">
              <Phone className="h-4 w-4 text-cyan-300" />
              Call Queue
            </h2>
            <div className="space-y-2">
              {CALLS.map((call) => (
                <button
                  key={call.id}
                  type="button"
                  onClick={() => setActiveCall(call.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    activeCall === call.id
                      ? "border-cyan-300/40 bg-cyan-300/10"
                      : "border-white/8 bg-white/[0.03] hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{call.caller}</span>
                    <span className="text-xs text-white/45">{call.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-white/55">{call.topic}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col rounded-lg border border-white/10 bg-white/[0.04] p-4 lg:col-span-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-white/80">
              <UserRound className="h-4 w-4 text-violet-300" />
              Active Handling
            </h2>
            <div className="mb-4 rounded-lg border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <MicOff className="h-5 w-5 text-white/55" />
                </div>
                <div>
                  <p className="text-sm font-medium">{currentCaller?.caller ?? (activeCall ? "Preview Caller" : "No active call")}</p>
                  <p className="text-xs text-white/50">{activeCall ? "Simulated call in progress" : "Start or select a call"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {DEFAULT_SCRIPT.map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => toggleStep(step)}
                  className="flex w-full items-center gap-3 rounded-lg bg-white/[0.04] p-3 text-left text-sm hover:bg-white/[0.075]"
                >
                  <CheckCircle2
                    className={`h-4 w-4 ${completed.includes(step) ? "text-emerald-300" : "text-white/25"}`}
                  />
                  <span className={completed.includes(step) ? "text-white/80" : "text-white/55"}>{step}</span>
                </button>
              ))}
            </div>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-4 min-h-32 flex-1 rounded-lg border border-white/10 bg-black/25 p-3 text-sm text-white outline-none focus:border-cyan-300/40"
            />
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4 lg:col-span-3">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-white/80">
              <Clock className="h-4 w-4 text-amber-300" />
              Local Outcome
            </h2>
            <div className="space-y-3 text-sm text-white/60">
              <p>Disposition: route to founder follow-up.</p>
              <p>Next action: attach data room link and schedule product walkthrough.</p>
              <p>Persistence: browser-local only until sandbox reset.</p>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  )
}
