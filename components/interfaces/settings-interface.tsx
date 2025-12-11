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
      <div className="w-64 border-r border-white/20 p-6 glass-dark backdrop-blur">
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
              <tab.icon className={`w-4 h-4 donna-icon ${activeTab === tab.id ? "donna-icon-active" : ""}`} />
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
                    className="w-full glass border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="john@example.com"
                    className="w-full glass border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-white/40"
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
                  <div key={index} className="flex items-center justify-between p-4 donna-glass donna-gradient-border rounded-lg">
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
                <div className="p-4 glass border border-white/20 rounded-lg">
                  <div className="font-medium mb-2">Two-Factor Authentication</div>
                  <div className="text-sm text-white/60 mb-3">Add an extra layer of security to your account</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Status: Enabled</span>
                    <button className="bg-white text-black px-4 py-2 rounded text-sm hover:bg-white/90 transition-colors">
                      Manage 2FA
                    </button>
                  </div>
                </div>
                <div className="p-4 glass border border-white/20 rounded-lg">
                  <div className="font-medium mb-2">Change Password</div>
                  <div className="text-sm text-white/60 mb-3">Update your account password</div>
                  <div className="space-y-3">
                    <input type="password" placeholder="Current password" className="w-full glass border border-white/20 rounded px-4 py-2 text-white" />
                    <input type="password" placeholder="New password" className="w-full glass border border-white/20 rounded px-4 py-2 text-white" />
                    <input type="password" placeholder="Confirm new password" className="w-full glass border border-white/20 rounded px-4 py-2 text-white" />
                  </div>
                  <button className="mt-3 border border-white/40 text-white px-4 py-2 rounded text-sm hover:bg-white/10 transition-colors">
                    Update Password
                  </button>
                </div>
                <div className="p-4 glass border border-white/20 rounded-lg">
                  <div className="font-medium mb-2">Active Sessions</div>
                  <div className="text-sm text-white/60 mb-3">Manage your active login sessions</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <div>
                        <p className="text-sm text-white">Chrome on Windows</p>
                        <p className="text-xs text-white/60">Last active: 2 hours ago</p>
                      </div>
                      <button className="text-xs text-red-400 hover:text-red-300">Revoke</button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <div>
                        <p className="text-sm text-white">Safari on Mac</p>
                        <p className="text-xs text-white/60">Last active: 1 day ago</p>
                      </div>
                      <button className="text-xs text-red-400 hover:text-red-300">Revoke</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "appearance" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Appearance Settings</h3>
              <div className="space-y-4">
                <div className="p-4 glass border border-white/20 rounded-lg">
                  <div className="font-medium mb-2">Theme</div>
                  <div className="text-sm text-white/60 mb-3">Choose your preferred theme</div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white text-black rounded text-sm">Dark</button>
                    <button className="px-4 py-2 bg-white/10 text-white rounded text-sm hover:bg-white/20">Light</button>
                    <button className="px-4 py-2 bg-white/10 text-white rounded text-sm hover:bg-white/20">Auto</button>
                  </div>
                </div>
                <div className="p-4 glass border border-white/20 rounded-lg">
                  <div className="font-medium mb-2">Accent Color</div>
                  <div className="text-sm text-white/60 mb-3">Customize your accent color</div>
                  <div className="flex gap-2">
                    <input type="color" defaultValue="#2563eb" className="w-16 h-10 rounded border border-white/20" />
                    <input type="text" defaultValue="#2563eb" className="flex-1 glass border border-white/20 rounded px-4 py-2 text-white" />
                  </div>
                </div>
                <div className="p-4 glass border border-white/20 rounded-lg">
                  <div className="font-medium mb-2">Font Size</div>
                  <div className="text-sm text-white/60 mb-3">Adjust the interface font size</div>
                  <input type="range" min="12" max="18" defaultValue="14" className="w-full" />
                  <div className="flex justify-between text-xs text-white/60 mt-1">
                    <span>Small</span>
                    <span>Medium</span>
                    <span>Large</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "integrations" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Integrations</h3>
              <div className="space-y-4">
                {[
                  { name: 'Gmail', description: 'Connect your Gmail account', status: 'connected', icon: '📧' },
                  { name: 'Google Calendar', description: 'Sync your calendar events', status: 'connected', icon: '📅' },
                  { name: 'Slack', description: 'Get notifications in Slack', status: 'available', icon: '💬' },
                  { name: 'Zapier', description: 'Automate workflows with Zapier', status: 'available', icon: '⚡' },
                  { name: 'Salesforce', description: 'Sync contacts and deals', status: 'available', icon: '☁️' },
                ].map((integration, index) => (
                  <div key={index} className="p-4 glass border border-white/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <div className="font-medium">{integration.name}</div>
                          <div className="text-sm text-white/60">{integration.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          integration.status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {integration.status}
                        </span>
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded text-sm transition-colors">
                          {integration.status === 'connected' ? 'Manage' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "advanced" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Advanced Settings</h3>
              <div className="space-y-4">
                <div className="p-4 glass border border-white/20 rounded-lg">
                  <div className="font-medium mb-2">API Access</div>
                  <div className="text-sm text-white/60 mb-3">Manage your API keys and tokens</div>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <div>
                        <p className="text-sm text-white">Production API Key</p>
                        <p className="text-xs text-white/60">Created: Jan 15, 2024</p>
                      </div>
                      <button className="text-xs text-white/60 hover:text-white">Show</button>
                    </div>
                  </div>
                  <button className="bg-white/10 hover:bg-white/15 border border-white/20 rounded px-4 py-2 text-sm transition-colors">
                    Generate New Key
                  </button>
                </div>
                <div className="p-4 glass border border-white/20 rounded-lg">
                  <div className="font-medium mb-2">Data Export</div>
                  <div className="text-sm text-white/60 mb-3">Download your account data</div>
                  <button className="bg-white/10 hover:bg-white/15 border border-white/20 rounded px-4 py-2 text-sm transition-colors">
                    Request Data Export
                  </button>
                </div>
                <div className="p-4 glass border border-white/20 rounded-lg">
                  <div className="font-medium mb-2">Account Deletion</div>
                  <div className="text-sm text-white/60 mb-3">Permanently delete your account and all data</div>
                  <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded px-4 py-2 text-sm transition-colors">
                    Delete Account
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
