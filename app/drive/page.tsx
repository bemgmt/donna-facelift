"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Building2,
  ArrowRight,
  Briefcase,
  Landmark,
  FileSearch,
  ShieldCheck,
  Umbrella,
  Calculator,
  Leaf,
  Map,
  Scale,
  Users,
  Zap,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"

const ICONS: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase className="w-6 h-6" />,
  Landmark: <Landmark className="w-6 h-6" />,
  FileSearch: <FileSearch className="w-6 h-6" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6" />,
  Umbrella: <Umbrella className="w-6 h-6" />,
  Calculator: <Calculator className="w-6 h-6" />,
  Leaf: <Leaf className="w-6 h-6" />,
  Map: <Map className="w-6 h-6" />,
  Scale: <Scale className="w-6 h-6" />,
  Building2: <Building2 className="w-6 h-6" />,
}

const ROLES = [
  { slug: "commercial_broker", label: "Commercial Broker", icon: "Briefcase", color: "blue" },
  { slug: "commercial_lender", label: "Commercial Lender", icon: "Landmark", color: "emerald" },
  { slug: "title_company", label: "Title Company", icon: "FileSearch", color: "amber" },
  { slug: "escrow_officer", label: "Escrow Officer", icon: "ShieldCheck", color: "violet" },
  { slug: "insurance_broker", label: "Insurance Broker", icon: "Umbrella", color: "rose" },
  { slug: "appraiser", label: "Appraiser", icon: "Calculator", color: "cyan" },
  { slug: "environmental_consultant", label: "Environmental Consultant", icon: "Leaf", color: "green" },
  { slug: "surveyor", label: "Surveyor", icon: "Map", color: "orange" },
  { slug: "real_estate_attorney", label: "Real Estate Attorney", icon: "Scale", color: "indigo" },
  { slug: "property_manager", label: "Property Manager", icon: "Building2", color: "teal" },
]

const FEATURES = [
  "Live CRE transaction simulation",
  "Role-based inbox, tasks & documents",
  "Facilitator-injected scenario events",
  "Real DONNA account — keep it after the demo",
]

export default function DriveLandingPage() {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 sm:px-6 lg:px-8">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-purple-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-white/15 bg-white/5 text-sm text-white/70"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            Interactive Demo Experience
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
          >
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              DONNA Drive
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            Get in the driver seat. Experience a live{" "}
            <span className="text-white/90 font-medium">$8.5M commercial acquisition</span>{" "}
            from the perspective of any transaction participant.
          </motion.p>

          {/* Property card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 mx-auto max-w-lg glass rounded-2xl border border-white/10 p-6 text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white/80" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Vernon Commerce Center</h3>
                <p className="text-sm text-white/50">2810 Leonis Blvd, Vernon, CA 90058</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-cyan-400">$8.5M</div>
                <div className="text-xs text-white/40 mt-1">Purchase Price</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-400">45K</div>
                <div className="text-xs text-white/40 mt-1">Sq. Ft.</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-400">92%</div>
                <div className="text-xs text-white/40 mt-1">Occupied</div>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10"
          >
            <Link
              href="/drive/register"
              className="donna-btn text-base px-8 py-3.5 rounded-xl"
            >
              Register for DONNA Drive
              <ArrowRight className="w-5 h-5 ml-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 glass rounded-xl border border-white/10 px-4 py-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm text-white/80">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles grid */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">Choose Your Role</h2>
            <p className="mt-2 text-sm text-white/50">
              Each role has a unique inbox, task list, documents, and perspective on the deal.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ROLES.map((role, i) => (
              <motion.div
                key={role.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 + i * 0.05 }}
                onMouseEnter={() => setHoveredRole(role.slug)}
                onMouseLeave={() => setHoveredRole(null)}
                className={`
                  relative cursor-pointer rounded-xl border p-4 text-center transition-all duration-200
                  ${
                    hoveredRole === role.slug
                      ? "border-white/30 bg-white/10 scale-105 shadow-lg shadow-purple-500/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }
                `}
              >
                <div className={`mx-auto mb-3 w-10 h-10 rounded-lg bg-${role.color}-500/20 flex items-center justify-center text-${role.color}-400`}>
                  {ICONS[role.icon] || <Users className="w-6 h-6" />}
                </div>
                <div className="text-xs font-medium text-white/80 leading-tight">{role.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-semibold text-white mb-3">
            Your DONNA account is real
          </h3>
          <p className="text-sm text-white/50 mb-8 leading-relaxed">
            After the demo, keep the account you already used.
            Activate a subscription and start using DONNA for your own business — no migration needed.
          </p>
          <Link
            href="/drive/register"
            className="donna-btn-glass text-sm px-6 py-2.5 rounded-xl inline-flex items-center gap-2 hover:bg-white/10 transition-colors"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
