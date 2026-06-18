"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Building2, User, Briefcase, Mail, Phone, Globe, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

const INDUSTRIES = [
  { slug: "real_estate", label: "Real Estate" },
  { slug: "hospitality", label: "Hospitality" },
  { slug: "professional_services", label: "Professional Services" },
]

export default function DriveRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    phone: "",
    industry: "real_estate",
  })

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.password || !form.industry) {
      setError("Please fill in your name, email, password, and select an industry.")
      return
    }

    setLoading(true)
    setError("")

    try {
      let userId = "preview-user-id"

      // 1. Supabase Auth Signup (if database is configured)
      if (isSupabaseConfigured) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              name: form.name,
              vertical: form.industry
            }
          }
        })

        if (authError) {
          setError(authError.message || "Authentication signup failed.")
          setLoading(false)
          return
        }

        if (authData?.user) {
          userId = authData.user.id
        }
      }

      // 2. Call backend register API to save user and member records
      const friendlyIndustry = INDUSTRIES.find(ind => ind.slug === form.industry)?.label || form.industry
      const res = await fetch("/api/demo/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          org_id: "dd-org-001",
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          industry: friendlyIndustry,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || "Registration failed. Please try again.")
        setLoading(false)
        return
      }

      // Store in localStorage for application context/navigation
      localStorage.setItem("donna_drive_member_id", data.member_id)
      localStorage.setItem("donna_drive_user_name", form.name)
      localStorage.setItem("donna_drive_industry", form.industry)
      localStorage.setItem("donna_drive_role", "") // Assigned by facilitator later
      localStorage.setItem("donna_demo_session", "true")
      localStorage.setItem("donna_demo_user", form.email)
      
      // Cookie helper for server-side route guards if Clerk middleware is disabled
      document.cookie = `donna_demo_session=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      document.cookie = `donna_demo_user=${form.email}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

      router.push("/drive/waiting-room")
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Back button */}
      <div className="px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/drive"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to DONNA Drive
        </Link>
      </div>

      <div className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white/80" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Register for DONNA Drive
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Create an account with your credentials to join the live simulation event.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="glass rounded-2xl border border-white/10 p-6 space-y-5"
          >
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm text-white/60 mb-1.5">
                <User className="w-3.5 h-3.5" /> Full Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="John Smith"
                className="donna-input text-sm"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm text-white/60 mb-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="john@example.com"
                className="donna-input text-sm"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-2 text-sm text-white/60 mb-1.5">
                <Lock className="w-3.5 h-3.5" /> Password *
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="••••••••"
                className="donna-input text-sm"
                required
              />
            </div>

            {/* Company */}
            <div>
              <label className="flex items-center gap-2 text-sm text-white/60 mb-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Company Name (Optional)
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="Acme Real Estate"
                className="donna-input text-sm"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm text-white/60 mb-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="(555) 555-0100"
                className="donna-input text-sm"
              />
            </div>

            {/* Industry selection */}
            <div>
              <label className="flex items-center gap-2 text-sm text-white/60 mb-2">
                <Globe className="w-3.5 h-3.5" /> Choose Your Industry *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind.slug}
                    type="button"
                    onClick={() => update("industry", ind.slug)}
                    className={`
                      px-3 py-3 rounded-lg text-xs font-medium text-center transition-all duration-150
                      ${
                        form.industry === ind.slug
                          ? "bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border-purple-400/50 text-white border"
                          : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full donna-btn text-sm py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registering…
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  Register & Enter Waiting Room
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>

            <div className="pt-4 border-t border-white/10 text-center space-y-3">
              <p className="text-xs text-white/50">
                After registering, wait in the waiting room for the facilitator to start the live event.
              </p>
              <p className="text-sm text-white/60">
                Already have an account?{' '}
                <Link href="/sign-in" className="text-donna-cyan hover:underline transition-all">
                  Sign In
                </Link>
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  )
}
