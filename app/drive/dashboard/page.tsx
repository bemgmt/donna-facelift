"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail, ClipboardList, FileText, Calendar, Bell, Users, Building2,
  ArrowLeft, Clock, AlertTriangle, CheckCircle2, Circle, Star, ChevronRight,
} from "lucide-react"
import Link from "next/link"
import type {
  DemoContact, DemoEmail, DemoTask, DemoDocument,
  DemoCalendarEvent, DemoNotification, DemoRoleSlug,
} from "@/lib/donna-drive/types"
import { DEMO_ROLES } from "@/lib/donna-drive/constants"

type Tab = "inbox" | "tasks" | "documents" | "calendar" | "contacts" | "notifications"

interface DemoData {
  contacts: DemoContact[]
  emails: DemoEmail[]
  tasks: DemoTask[]
  documents: DemoDocument[]
  calendar_events: DemoCalendarEvent[]
  notifications: DemoNotification[]
}

const statusColors: Record<string, string> = {
  pending: "text-amber-400 bg-amber-400/10",
  in_progress: "text-blue-400 bg-blue-400/10",
  completed: "text-emerald-400 bg-emerald-400/10",
  blocked: "text-red-400 bg-red-400/10",
}

const priorityColors: Record<string, string> = {
  low: "text-white/40",
  medium: "text-amber-400",
  high: "text-orange-400",
  urgent: "text-red-400",
}

import FacilitatorSupportChat from "@/components/drive/FacilitatorSupportChat"

function getRoleLabel(slug: DemoRoleSlug): string {
  return DEMO_ROLES.find((r) => r.slug === slug)?.label ?? slug
}

function DriveDashboardContent() {
  const searchParams = useSearchParams()
  const roleSlug = (searchParams.get("role") || localStorage.getItem("donna_drive_role") || "commercial_broker") as DemoRoleSlug
  const userName = typeof window !== "undefined" ? localStorage.getItem("donna_drive_user_name") || "Attendee" : "Attendee"

  const [activeTab, setActiveTab] = useState<Tab>("inbox")
  const [data, setData] = useState<DemoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEmail, setSelectedEmail] = useState<DemoEmail | null>(null)

  const roleDef = DEMO_ROLES.find((r) => r.slug === roleSlug)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/demo/data?role=${roleSlug}`)
      const json = await res.json()
      if (json.success) {
        setData(json)
      }
    } catch (err) {
      console.error("Failed to fetch demo data:", err)
    } finally {
      setLoading(false)
    }
  }, [roleSlug])

  useEffect(() => {
    fetchData()
    // Poll for new data every 10s (to catch facilitator events)
    const interval = setInterval(fetchData, 10_000)
    return () => clearInterval(interval)
  }, [fetchData])

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "inbox", label: "Inbox", icon: <Mail className="w-4 h-4" />, count: data?.emails.filter((e) => !e.read).length },
    { id: "tasks", label: "Tasks", icon: <ClipboardList className="w-4 h-4" />, count: data?.tasks.filter((t) => t.status !== "completed").length },
    { id: "documents", label: "Documents", icon: <FileText className="w-4 h-4" />, count: data?.documents.length },
    { id: "calendar", label: "Calendar", icon: <Calendar className="w-4 h-4" />, count: data?.calendar_events.length },
    { id: "contacts", label: "Contacts", icon: <Users className="w-4 h-4" />, count: data?.contacts.length },
    { id: "notifications", label: "Alerts", icon: <Bell className="w-4 h-4" />, count: data?.notifications.filter((n) => !n.read).length },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-white/50">Loading your DONNA Drive experience…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Demo banner */}
      <div className="bg-gradient-to-r from-purple-600/20 via-cyan-600/20 to-purple-600/20 border-b border-white/10 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/70">
              <span className="font-semibold text-white/90">DONNA Drive</span>
              {" · "}Vernon Commerce Center · $8.5M Acquisition
            </span>
          </div>
          <Link href="/drive" className="text-xs text-white/40 hover:text-white/70 transition-colors">
            Exit Demo
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Role header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/drive" className="text-white/40 hover:text-white/70 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-white">{roleDef?.label}</h1>
              <p className="text-sm text-white/50">Welcome, {userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="glass rounded-lg px-3 py-1.5 text-xs text-white/60 border border-white/10">
              <Building2 className="w-3 h-3 inline mr-1" />
              Vernon Commerce Center
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedEmail(null) }}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                ${activeTab === tab.id
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }
              `}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? "bg-white/20" : "bg-white/10"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* INBOX */}
            {activeTab === "inbox" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Email list */}
                <div className="lg:col-span-1 space-y-1 max-h-[70vh] overflow-y-auto">
                  {data?.emails.map((email) => (
                    <button
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`
                        w-full text-left glass rounded-lg p-3 border transition-all
                        ${selectedEmail?.id === email.id
                          ? "border-purple-400/40 bg-purple-400/10"
                          : "border-white/10 hover:border-white/20"
                        }
                        ${!email.read ? "border-l-2 border-l-cyan-400" : ""}
                      `}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-white/40 mb-0.5">
                            From: {getRoleLabel(email.from_role)}
                          </div>
                          <div className={`text-sm truncate ${!email.read ? "font-semibold text-white" : "text-white/70"}`}>
                            {email.subject}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {email.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                          <ChevronRight className="w-3 h-3 text-white/30" />
                        </div>
                      </div>
                    </button>
                  ))}
                  {(!data?.emails || data.emails.length === 0) && (
                    <div className="text-center py-12 text-white/30 text-sm">No emails yet</div>
                  )}
                </div>

                {/* Email detail */}
                <div className="lg:col-span-2">
                  {selectedEmail ? (
                    <div className="glass rounded-xl border border-white/10 p-6">
                      <div className="mb-4">
                        <h2 className="text-lg font-semibold text-white">{selectedEmail.subject}</h2>
                        <div className="mt-2 flex items-center gap-4 text-xs text-white/40">
                          <span>From: <span className="text-white/60">{getRoleLabel(selectedEmail.from_role)}</span></span>
                          <span>To: <span className="text-white/60">{getRoleLabel(selectedEmail.to_role)}</span></span>
                        </div>
                      </div>
                      <div className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                        {selectedEmail.body}
                      </div>
                    </div>
                  ) : (
                    <div className="glass rounded-xl border border-white/10 p-12 text-center text-white/30 text-sm">
                      Select an email to read
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TASKS */}
            {activeTab === "tasks" && (
              <div className="space-y-2">
                {data?.tasks.map((task) => (
                  <div key={task.id} className="glass rounded-xl border border-white/10 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="mt-0.5">
                          {task.status === "completed" ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : task.status === "blocked" ? (
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-white/30" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className={`text-sm font-medium ${task.status === "completed" ? "text-white/50 line-through" : "text-white"}`}>
                            {task.title}
                          </h3>
                          <p className="text-xs text-white/40 mt-1">{task.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[task.status] || ""}`}>
                          {task.status.replace("_", " ")}
                        </span>
                        <span className={`text-xs ${priorityColors[task.priority] || ""}`}>
                          {task.priority}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-white/30">
                          <Clock className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {(!data?.tasks || data.tasks.length === 0) && (
                  <div className="text-center py-12 text-white/30 text-sm">No tasks assigned</div>
                )}
              </div>
            )}

            {/* DOCUMENTS */}
            {activeTab === "documents" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data?.documents.map((doc) => (
                  <div key={doc.id} className="glass rounded-xl border border-white/10 p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">{doc.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                          <span>{doc.type.toUpperCase()}</span>
                          <span>·</span>
                          <span>{doc.size_kb} KB</span>
                        </div>
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            doc.status === "signed" ? "bg-emerald-400/10 text-emerald-400"
                            : doc.status === "approved" ? "bg-blue-400/10 text-blue-400"
                            : doc.status === "pending_review" ? "bg-amber-400/10 text-amber-400"
                            : "bg-white/10 text-white/50"
                          }`}>
                            {doc.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CALENDAR */}
            {activeTab === "calendar" && (
              <div className="space-y-3">
                {data?.calendar_events.map((event) => (
                  <div key={event.id} className="glass rounded-xl border border-white/10 p-4">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-14 text-center">
                        <div className="text-2xl font-bold text-white">
                          {new Date(event.start_time).getDate()}
                        </div>
                        <div className="text-xs text-white/40">
                          {new Date(event.start_time).toLocaleDateString("en-US", { month: "short" })}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-white">{event.title}</h3>
                        <p className="text-xs text-white/50 mt-1">{event.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                          <span>📍 {event.location}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {event.attendees.map((a) => (
                            <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/50">
                              {getRoleLabel(a)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CONTACTS */}
            {activeTab === "contacts" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data?.contacts.map((contact) => (
                  <div key={contact.id} className="glass rounded-xl border border-white/10 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center text-sm font-semibold text-white/70 shrink-0">
                        {contact.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-white">{contact.name}</h3>
                        <p className="text-xs text-white/50">{contact.company}</p>
                        <p className="text-xs text-white/40 mt-1">{getRoleLabel(contact.role_slug)}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                          <span>{contact.email}</span>
                          <span>{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="space-y-2">
                {data?.notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`glass rounded-xl border p-4 ${
                      notif.type === "urgent" ? "border-red-400/30 bg-red-400/5"
                      : notif.type === "warning" ? "border-amber-400/30 bg-amber-400/5"
                      : notif.type === "action_required" ? "border-purple-400/30 bg-purple-400/5"
                      : "border-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {notif.type === "urgent" && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />}
                      {notif.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
                      {notif.type === "info" && <Bell className="w-5 h-5 text-blue-400 shrink-0" />}
                      {notif.type === "action_required" && <ClipboardList className="w-5 h-5 text-purple-400 shrink-0" />}
                      <div>
                        <h3 className="text-sm font-medium text-white">{notif.title}</h3>
                        <p className="text-xs text-white/50 mt-1">{notif.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!data?.notifications || data.notifications.length === 0) && (
                  <div className="text-center py-12 text-white/30 text-sm">No notifications</div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <FacilitatorSupportChat />
    </div>
  )
}

export default function DriveDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent flex items-center justify-center"><div className="w-10 h-10 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto" /></div>}>
      <DriveDashboardContent />
    </Suspense>
  )
}
