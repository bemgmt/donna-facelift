"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, RefreshCw, AlertTriangle, CheckCircle2, User, Globe, ShieldAlert, ArrowRight, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const INDUSTRIES = [
  { slug: "Real Estate", label: "Real Estate" },
  { slug: "Hospitality", label: "Hospitality" },
  { slug: "Professional Services", label: "Professional Services" },
]

export default function WaitingRoomPage() {
  const router = useRouter()
  
  // Attendee state from local storage
  const [userName, setUserName] = useState("")
  const [memberId, setMemberId] = useState("")
  const [currentIndustry, setCurrentIndustry] = useState("Real Estate")
  const [assignedRoleLabel, setAssignedRoleLabel] = useState("Not Assigned Yet")
  const [assignedRoleSlug, setAssignedRoleSlug] = useState("")
  
  // Status states
  const [orgStatus, setOrgStatus] = useState("inactive")
  const [loading, setLoading] = useState(true)
  const [updatingIndustry, setUpdatingIndustry] = useState(false)
  const [roleSwitched, setRoleSwitched] = useState(false)
  const [error, setError] = useState("")

  // Load details on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("donna_drive_user_name") || "Attendee"
      const mId = localStorage.getItem("donna_drive_member_id") || ""
      const ind = localStorage.getItem("donna_drive_industry") || "Real Estate"
      const cachedRole = localStorage.getItem("donna_drive_role") || ""
      
      setUserName(name)
      setMemberId(mId)
      setCurrentIndustry(ind)
      setAssignedRoleSlug(cachedRole)

      if (!mId) {
        setError("Missing registration details. Redirecting to registration page...")
        setTimeout(() => router.push("/drive/register"), 2000)
      }
    }
  }, [router])

  // Polling for event status and role changes
  useEffect(() => {
    if (!memberId) return

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/demo/waiting-room?member_id=${memberId}`)
        const data = await res.json()

        if (data.success) {
          setOrgStatus(data.org_status)
          setAssignedRoleLabel(data.role_label)
          setCurrentIndustry(data.industry)
          
          // Check if role has been switched
          const cachedRole = localStorage.getItem("donna_drive_role") || ""
          if (data.role_slug && data.role_slug !== cachedRole) {
            localStorage.setItem("donna_drive_role", data.role_slug)
            setAssignedRoleSlug(data.role_slug)
            setRoleSwitched(true)
          }

          // If the event goes live, automatically redirect to the interactive grid
          if (data.org_status === "live") {
            localStorage.setItem("donna_demo_session", "true")
            router.push("/")
          }
        }
      } catch (err) {
        console.error("Waiting room check error:", err)
      } finally {
        setLoading(false)
      }
    }

    // Initial check
    checkStatus()

    // Poll every 3 seconds
    const interval = setInterval(checkStatus, 3000)
    return () => clearInterval(interval)
  }, [memberId, router])

  // Switch industry handler
  const handleSwitchIndustry = async (industryName: string) => {
    if (orgStatus === "live" || orgStatus === "completed") {
      return
    }

    setUpdatingIndustry(true)
    try {
      const res = await fetch("/api/demo/waiting-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: memberId,
          industry: industryName
        }),
      })

      const data = await res.json()
      if (data.success) {
        setCurrentIndustry(industryName)
        localStorage.setItem("donna_drive_industry", industryName)
      } else {
        setError(data.message || "Failed to update industry.")
      }
    } catch {
      setError("Failed to update industry. Try again.")
    } finally {
      setUpdatingIndustry(false)
    }
  }

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("donna_demo_session")
    localStorage.removeItem("donna_demo_user")
    localStorage.removeItem("donna_drive_member_id")
    localStorage.removeItem("donna_drive_user_name")
    localStorage.removeItem("donna_drive_role")
    document.cookie = "donna_demo_session=; path=/; max-age=0"
    document.cookie = "donna_demo_user=; path=/; max-age=0"
    router.push("/drive")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0C0F16] to-[#10121A] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm text-white/50">Loading waiting room...</p>
        </div>
      </div>
    )
  }

  const isLocked = orgStatus === "live" || orgStatus === "completed"

  return (
    <div className="min-h-screen bg-transparent text-white py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-cyan-600/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-cyan-400" />
            <span className="text-sm font-semibold tracking-wider uppercase text-white/70">DONNA Drive Event</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs text-white/60"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>

        {/* Refresh Notification Banner */}
        <AnimatePresence>
          {roleSwitched && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-sm text-amber-200">
                  Your simulation role has been adjusted by the facilitator. Please reload the dashboard to confirm.
                </span>
              </div>
              <button
                onClick={() => {
                  setRoleSwitched(false)
                  window.location.reload()
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Page
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Card */}
        <div className="glass rounded-2xl border border-white/10 overflow-hidden bg-black/30 backdrop-blur-md">
          {/* Header */}
          <div className="p-8 text-center border-b border-white/5 relative">
            {/* Pulsing indicator */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-400/20">
                  <Globe className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-ping" />
              </div>
            </div>

            <h1 className="text-3xl font-light tracking-tight">Staging Waiting Room</h1>
            <p className="mt-2 text-sm text-white/50 max-w-md mx-auto">
              Welcome, <span className="text-white font-medium">{userName}</span>. You are successfully enrolled. 
              Waiting for the facilitator to stage and start the transaction.
            </p>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left box: Industry Switcher */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Select Industry Vertical
              </h2>
              <p className="text-xs text-white/40 leading-relaxed">
                Choose the industry context you want to participate under. You can change this until the event starts.
              </p>

              <div className="space-y-2">
                {INDUSTRIES.map((ind) => {
                  const isActive = currentIndustry.toLowerCase().replace(/ /g, '_') === ind.slug.toLowerCase().replace(/ /g, '_')
                  return (
                    <button
                      key={ind.slug}
                      onClick={() => handleSwitchIndustry(ind.slug)}
                      disabled={isLocked || updatingIndustry}
                      className={`
                        w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all
                        ${isActive 
                          ? "bg-cyan-500/10 border-cyan-400/40 text-white shadow-lg shadow-cyan-500/5" 
                          : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/10"
                        }
                        ${isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      <div>
                        <div className="text-sm font-semibold">{ind.label}</div>
                      </div>
                      {isActive && <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />}
                    </button>
                  )
                })}
              </div>
              
              {isLocked && (
                <div className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>The industry selection is locked because the event configuration has been frozen.</span>
                </div>
              )}
            </div>

            {/* Right box: Staging Status */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  Current Staging Status
                </h2>

                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
                  {/* Event status */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs text-white/40">Event State:</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                      orgStatus === 'staged' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' :
                      orgStatus === 'live' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' :
                      'bg-white/10 text-white/40'
                    }`}>
                      {orgStatus === 'staged' ? 'Staged (Pre-Start)' :
                       orgStatus === 'live' ? 'Live' : 'Waiting for Stage'}
                    </span>
                  </div>

                  {/* Assigned role */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs text-white/40">Assigned Role:</span>
                    <span className={`text-xs font-semibold ${assignedRoleSlug ? 'text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2.5 py-1 rounded-full' : 'text-white/60'}`}>
                      {assignedRoleLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action notice */}
              <div className="bg-gradient-to-r from-purple-900/10 to-cyan-900/10 border border-white/5 rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">How to join</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  The facilitator will configure your role matching your background. Once they start the live transaction, 
                  this screen will automatically route you to the live environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
