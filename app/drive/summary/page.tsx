"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Award, ArrowRight } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

function SummaryContent() {
  const searchParams = useSearchParams()
  const roleSlug = searchParams.get("role") || (typeof window !== "undefined" ? localStorage.getItem("donna_drive_role") : null) || "commercial_broker"
  const userName = typeof window !== "undefined" ? localStorage.getItem("donna_drive_user_name") || "Attendee" : "Attendee"

  const [emailing, setEmailing] = useState(false)

  const handleEmailSummary = async () => {
    setEmailing(true)
    try {
      const res = await fetch("/api/donna-drive/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId: roleSlug,
          userName: userName
        })
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Summary emailed successfully!")
      } else {
        toast.error("Failed to email summary.")
      }
    } catch (err) {
      toast.error("An error occurred.")
    } finally {
      setEmailing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C0F16] to-[#10121A] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-radial from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-2xl w-full glass rounded-2xl border border-white/10 p-8 md:p-12 z-10"
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
            <Award className="w-10 h-10 text-emerald-400" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Event Completed</h1>
          
          <p className="text-white/60 text-lg leading-relaxed max-w-xl mx-auto">
            Thanks for participating in Donna Drive, {userName}. The facilitator has concluded the simulation. 
            Donna has prepared a summary of what you worked on today, what you completed, who you connected with, and suggested next steps.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleEmailSummary}
              disabled={emailing}
              className="w-full sm:w-auto px-8 py-4 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-black font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {emailing ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
              {emailing ? "Sending Email..." : "Email My Donna Drive Summary"}
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-colors"
            >
              Back to Home <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function SummaryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent flex items-center justify-center"><div className="w-10 h-10 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto" /></div>}>
      <SummaryContent />
    </Suspense>
  )
}
