"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Rocket, Building2, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ConvertDemoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [newOrgName, setNewOrgName] = useState("")

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newOrgName.trim()) {
      setError("Please enter a workspace name.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/demo/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: "dd-org-001", // In a real app, this would be dynamic
          new_org_name: newOrgName,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        // Redirect to the main app dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard") // Or wherever the real app lives
        }, 2000)
      } else {
        setError(data.message || "Conversion failed. Please try again.")
        setLoading(false)
      }
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Workspace Created</h2>
          <p className="text-white/60 text-sm mb-6">
            Your DONNA account is now active. Redirecting you to your new workspace...
          </p>
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="px-4 pt-6 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="px-4 py-12 sm:px-6 lg:px-8 flex items-center justify-center min-h-[80vh]">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-white/10 p-8"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center mb-6">
              <Rocket className="w-7 h-7 text-white/80" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-3">
              Keep your DONNA
            </h1>
            <p className="text-sm text-white/60 mb-6 leading-relaxed">
              Ready to use DONNA for your own business? Convert your demo account into a real workspace. We&apos;ll clear the demo data and set you up with a clean slate.
            </p>

            <form onSubmit={handleConvert} className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm text-white/60 mb-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Workspace Name
                </label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => {
                    setNewOrgName(e.target.value)
                    if (error) setError("")
                  }}
                  placeholder="e.g. Pacific Commercial Realty"
                  className="donna-input text-sm"
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full donna-btn py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Converting...
                  </span>
                ) : (
                  "Create Workspace"
                )}
              </button>

              <p className="text-xs text-white/30 text-center">
                14-day free trial included. No credit card required.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
