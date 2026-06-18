"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Building2, User, Briefcase, Mail, Phone, Globe } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const ROLES = [
  { slug: "commercial_broker", label: "Commercial Broker" },
  { slug: "commercial_lender", label: "Commercial Lender" },
  { slug: "title_company", label: "Title Company" },
  { slug: "escrow_officer", label: "Escrow Officer" },
  { slug: "insurance_broker", label: "Insurance Broker" },
  { slug: "appraiser", label: "Appraiser" },
  { slug: "environmental_consultant", label: "Environmental Consultant" },
  { slug: "surveyor", label: "Surveyor" },
  { slug: "real_estate_attorney", label: "Real Estate Attorney" },
  { slug: "property_manager", label: "Property Manager" },
]

export default function DriveRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    industry: "",
    role_slug: "",
  })

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.role_slug) {
      setError("Please fill in your name, email, and select a role.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/demo/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: "dd-org-001",
          role_slug: form.role_slug,
          user_name: form.name,
          user_company: form.company,
          user_email: form.email,
          user_phone: form.phone,
          user_industry: form.industry,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || "Registration failed. Please try again.")
        setLoading(false)
        return
      }

      // Store role in localStorage for the dashboard
      localStorage.setItem("donna_drive_role", form.role_slug)
      localStorage.setItem("donna_drive_member_id", data.member_id)
      localStorage.setItem("donna_drive_user_name", form.name)

      router.push(`/drive/dashboard?role=${form.role_slug}`)
    } catch {
      setError("Something went wrong. Please try again.")
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
              Join DONNA Drive
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Register with your real information — this creates a real DONNA account.
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

            {/* Company */}
            <div>
              <label className="flex items-center gap-2 text-sm text-white/60 mb-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Company
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="ABC Mortgage"
                className="donna-input text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm text-white/60 mb-1.5">
                <Mail className="w-3.5 h-3.5" /> Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="john@abcmortgage.com"
                className="donna-input text-sm"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm text-white/60 mb-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="(555) 555-0101"
                className="donna-input text-sm"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="flex items-center gap-2 text-sm text-white/60 mb-1.5">
                <Globe className="w-3.5 h-3.5" /> Industry
              </label>
              <input
                type="text"
                value={form.industry}
                onChange={(e) => update("industry", e.target.value)}
                placeholder="Commercial Real Estate"
                className="donna-input text-sm"
              />
            </div>

            {/* Role selection */}
            <div>
              <label className="text-sm text-white/60 mb-2 block">
                Select Your Demo Role *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role.slug}
                    type="button"
                    onClick={() => update("role_slug", role.slug)}
                    className={`
                      px-3 py-2 rounded-lg text-xs font-medium text-left transition-all duration-150
                      ${
                        form.role_slug === role.slug
                          ? "bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border-purple-400/50 text-white border"
                          : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    {role.label}
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
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registering…
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  Enter DONNA Drive
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>

            <div className="pt-4 border-t border-white/10 text-center space-y-3">
              <p className="text-xs text-white/50">
                By registering, you agree to create a real DONNA account. No credit card required.
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
