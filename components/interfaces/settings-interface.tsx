"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Bell, Building2, Save, Shield, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const INVESTOR_SETTINGS_KEY = "donna_sandbox_settings"

type SandboxSettings = {
  name: string
  company: string
  role: string
  notifications: boolean
  dataRoomUpdates: boolean
  dinDigest: boolean
}

const defaults: SandboxSettings = {
  name: "Investor Preview User",
  company: "DONNA Capital Review",
  role: "Investor",
  notifications: true,
  dataRoomUpdates: true,
  dinDigest: false,
}

export default function SettingsInterface() {
  const [settings, setSettings] = useState<SandboxSettings>(defaults)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const stored = localStorage.getItem(INVESTOR_SETTINGS_KEY)
    if (!stored) return
    try {
      setSettings({ ...defaults, ...JSON.parse(stored) })
    } catch {
      setSettings(defaults)
    }
  }, [])

  const update = <K extends keyof SandboxSettings>(key: K, value: SandboxSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const save = () => {
    localStorage.setItem(INVESTOR_SETTINGS_KEY, JSON.stringify(settings))
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    setSavedAt(timestamp)
    toast({
      title: "Saved locally",
      description: "Investor sandbox settings were saved in this browser.",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-6 text-white glass-dark backdrop-blur"
      data-tour="settings-content"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 border-b border-white/10 pb-5">
          <h1 className="text-2xl font-light">Settings</h1>
          <p className="mt-1 text-sm text-white/55">Local investor preview preferences. No account, billing, auth, or backend sync.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5 lg:col-span-7">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-white/80">
              <User className="h-4 w-4 text-cyan-300" />
              Preview Profile
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm text-white/65">
                Name
                <input
                  value={settings.name}
                  onChange={(event) => update("name", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-white outline-none focus:border-cyan-300/40"
                />
              </label>
              <label className="space-y-1.5 text-sm text-white/65">
                Company
                <input
                  value={settings.company}
                  onChange={(event) => update("company", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-white outline-none focus:border-cyan-300/40"
                />
              </label>
              <label className="space-y-1.5 text-sm text-white/65 sm:col-span-2">
                Role
                <select
                  value={settings.role}
                  onChange={(event) => update("role", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-white outline-none focus:border-cyan-300/40"
                >
                  <option>Investor</option>
                  <option>Advisor</option>
                  <option>Founder</option>
                  <option>Operator</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5 lg:col-span-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-white/80">
              <Bell className="h-4 w-4 text-emerald-300" />
              Local Preferences
            </h2>
            <div className="space-y-3">
              {[
                ["notifications", "In-preview notifications"],
                ["dataRoomUpdates", "Data room update badges"],
                ["dinDigest", "DIN digest reminders"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center justify-between rounded-lg bg-white/[0.04] p-3 text-sm text-white/70">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(settings[key as keyof SandboxSettings])}
                    onChange={(event) => update(key as keyof SandboxSettings, event.target.checked as never)}
                    className="h-4 w-4"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5 lg:col-span-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 text-sm text-white/60">
                <Shield className="mt-0.5 h-4 w-4 text-white/45" />
                <div>
                  <p className="text-white/75">Sandbox persistence</p>
                  <p className="mt-1">These values stay in localStorage and reset with the Investor sandbox reset control.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={save}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-300/15"
              >
                <Save className="h-4 w-4" />
                Save Locally
              </button>
            </div>
            {savedAt && (
              <p className="mt-3 flex items-center gap-2 text-xs text-white/45">
                <Building2 className="h-3.5 w-3.5" />
                Last saved at {savedAt}
              </p>
            )}
          </section>
        </div>
      </div>
    </motion.div>
  )
}
