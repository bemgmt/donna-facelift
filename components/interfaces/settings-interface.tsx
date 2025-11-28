"use client"

import { motion } from "framer-motion"
import { User, Bell, Shield, Palette, Database, Zap } from "lucide-react"
import { useState } from "react"

export default function SettingsInterface() {
  const [activeTab, setActiveTab] = useState("profile")

  const settingsTabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "integrations", label: "Integrations", icon: Database },
    { id: "advanced", label: "Advanced", icon: Zap },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen flex pt-20">
      {/* Settings Sidebar */}
      <div className="w-64 border-r border-white/20 p-6">
        <h2 className="text-xl font-light mb-6">Settings</h2>
        <nav className="space-y-1">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                activeTab === tab.id ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 p-6">
        {activeTab === "profile" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Profile Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue="John Doe"
                    className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="john@example.com"
                    className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    rows={3}
                    defaultValue="AI enthusiast and business owner"
                    className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-white/40 resize-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "notifications" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: "Email notifications", description: "Receive updates via email" },
                  { label: "Push notifications", description: "Browser push notifications" },
                  { label: "SMS alerts", description: "Critical alerts via SMS" },
                  { label: "Weekly reports", description: "Weekly analytics summary" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-white/60">{item.description}</div>
                    </div>
                    <div className="w-12 h-6 bg-white/20 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "security" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="font-medium mb-2">Two-Factor Authentication</div>
                  <div className="text-sm text-white/60 mb-3">Add an extra layer of security to your account</div>
                  <button className="bg-white text-black px-4 py-2 rounded text-sm hover:bg-white/90 transition-colors">
                    Enable 2FA
                  </button>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="font-medium mb-2">Change Password</div>
                  <div className="text-sm text-white/60 mb-3">Update your account password</div>
                  <button className="border border-white/40 text-white px-4 py-2 rounded text-sm hover:bg-white/10 transition-colors">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <button className="bg-white text-black px-6 py-2 rounded hover:bg-white/90 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </motion.div>
  )
}
