"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import {
  Activity,
  Building2,
  Clock3,
  FileText,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Users,
} from "lucide-react"
import type {
  DemoCalendarEvent,
  DemoContact,
  DemoDINBidRequest,
  DemoDINBidResponse,
  DemoDocument,
  DemoEmail,
  DemoNotification,
  DemoTask,
} from "@/lib/donna-drive/types"
import { supabase } from "@/lib/supabase"
import { SCENARIOS } from "@/lib/donna-drive/scenarios"
import { useDriveTasks } from "@/features/drive/hooks/use-drive-tasks"
import { DriveTaskEngine } from "@/features/drive/components/DriveTaskEngine"


type DriveData = {
  role?: { slug: string; label: string; description?: string }
  contacts: DemoContact[]
  emails: DemoEmail[]
  tasks: DemoTask[]
  documents: DemoDocument[]
  calendar_events: DemoCalendarEvent[]
  notifications: DemoNotification[]
  din_bid_requests: DemoDINBidRequest[]
  din_bid_responses: DemoDINBidResponse[]
}

type Props = { moduleId: string; onOpenModule?: (moduleId: string) => void }

const emptyData: DriveData = {
  contacts: [], emails: [], tasks: [], documents: [], calendar_events: [],
  notifications: [], din_bid_requests: [], din_bid_responses: [],
}

function formatDate(value?: string) {
  if (!value) return "Not scheduled"
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value))
}

function titleCase(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.035] ${className}`}>
      <div className="border-b border-white/10 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">{title}</div>
      <div className="p-5">{children}</div>
    </section>
  )
}

export default function DriveGridModule({ moduleId, onOpenModule }: Props) {
  const [data, setData] = useState<DriveData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "donna"; text: string }>>([])
  const [chatting, setChatting] = useState(false)

  const [roleId] = useState(() => localStorage.getItem("donna_drive_role") || "")
  const [propertyName, setPropertyName] = useState("")
  const scenario = useMemo(() => SCENARIOS.find((item) => item.name === propertyName) || SCENARIOS[0], [propertyName])
  const scenarioRole = scenario.roles.find((item) => item.id === roleId)
  const taskEngine = useDriveTasks(scenario, roleId)

  const loadData = useCallback(async () => {
    if (!roleId) {
      setError("Your event role has not been assigned yet.")
      setLoading(false)
      return
    }
    try {
      const [response, statusResponse] = await Promise.all([
        fetch(`/api/demo/data?role=${encodeURIComponent(roleId)}`, { cache: "no-store" }),
        fetch("/api/demo/event-status", { cache: "no-store" }),
      ])
      const payload = await response.json()
      const status = await statusResponse.json()
      if (!response.ok || !payload.success) throw new Error(payload.message || "Unable to load CRE workspace")
      setData({ ...emptyData, ...payload })
      setError("")
      if (status.success) {
        setPropertyName(status.property_name || "")
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load CRE workspace")
    } finally {
      setLoading(false)
    }
  }, [roleId])

  useEffect(() => {
    loadData()
    const timer = window.setInterval(loadData, 10000)
    return () => window.clearInterval(timer)
  }, [loadData])

  const selected = data.emails.find((email) => email.id === selectedEmail) || data.emails[0]
  const roleTasks = taskEngine.tasks.filter((task) => task.assigned_to === roleId)
  const activeTasks = roleTasks.filter((task) => task.status !== "completed")
  const filteredContacts = data.contacts.filter((contact) =>
    `${contact.name} ${contact.title || ""} ${contact.company} ${contact.notes}`.toLowerCase().includes(search.toLowerCase())
  )
  const completedCount = roleTasks.filter((task) => task.status === "completed").length
  const completionRate = roleTasks.length ? Math.min(100, Math.round((completedCount / roleTasks.length) * 100)) : 0
  const generatedDocumentIds = new Set(taskEngine.ecosystem.documents.map((document) => document.id))
  const allDocuments = [...taskEngine.ecosystem.documents, ...data.documents.filter((document) => !generatedDocumentIds.has(document.id))]

  const generatedCalendarIds = new Set(taskEngine.ecosystem.calendar.map((event) => event.id))
  const allCalendarEvents = [...taskEngine.ecosystem.calendar, ...data.calendar_events.filter((event) => !generatedCalendarIds.has(event.id))]
  const sendChat = async (event: FormEvent) => {
    event.preventDefault()
    const message = chatInput.trim()
    if (!message || !roleId || chatting) return
    setChatMessages((current) => [...current, { sender: "user", text: message }])
    setChatInput("")
    setChatting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error("Sign in to use DONNA Secretary.")
      const response = await fetch("/api/donna-drive/secretary", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ message, roleId }),
      })
      const payload = await response.json()
      setChatMessages((current) => [...current, {
        sender: "donna",
        text: response.ok && payload.success ? payload.reply : payload.message || "Donna could not complete that request.",
      }])
    } catch {
      setChatMessages((current) => [...current, { sender: "donna", text: "Donna is temporarily unavailable. Your CRE workspace data is still accessible in the other modules." }])
    } finally {
      setChatting(false)
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-white/60"><RefreshCw className="mr-3 h-5 w-5 animate-spin" /> Loading live CRE workspace...</div>

  if (error) return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-center">
        <p className="text-sm text-red-100">{error}</p>
        <button onClick={loadData} className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-xs hover:bg-white/15">Try again</button>
      </div>
    </div>
  )

  const header = (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 pt-20">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-300"><Activity className="h-3.5 w-3.5" /> Live CRE workspace</div>
        <h1 className="text-3xl font-light">{data.role?.label || titleCase(roleId || "CRE professional")}</h1>
        {data.role?.description && <p className="mt-2 max-w-3xl text-sm text-white/50">{data.role.description}</p>}
      </div>
      <button onClick={loadData} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 hover:bg-white/10"><RefreshCw className="h-3.5 w-3.5" /> Refresh live data</button>
    </div>
  )

  let content: React.ReactNode

  if (moduleId === "sales") {
    content = <>
      <DriveTaskEngine tasks={roleTasks} roleObjective={scenarioRole?.primaryObjective || "Coordinate the work assigned to your role."} donnaOverlay={scenarioRole?.secretaryOverlay || "Track each owner, dependency, deadline, and next action."} pendingTaskId={taskEngine.pendingTaskId} error={taskEngine.error} onAction={taskEngine.act} onOpenModule={(target) => onOpenModule?.(target === "secretary" || target === "din" ? target : "sales")} />
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title={`Transaction documents · ${allDocuments.length}`}><div className="space-y-3">{allDocuments.slice(0, 12).map((doc) => <div key={doc.id} className="flex items-center gap-3"><FileText className="h-4 w-4 text-cyan-300" /><div><p className="text-sm text-white/75">{doc.name}</p><p className="text-[11px] text-white/35">{titleCase(doc.status)} · {doc.type.toUpperCase()}</p></div></div>)}{!allDocuments.length && <p className="text-sm text-white/40">No transaction documents have been added yet.</p>}</div></Panel>
        <Panel title="Upcoming"><div className="space-y-3">{allCalendarEvents.map((event) => <div key={event.id}><p className="text-sm text-white/75">{event.title}</p><p className="text-xs text-white/35">{formatDate(event.start_time)} · {event.location}</p></div>)}{!allCalendarEvents.length && <p className="text-sm text-white/40">Deadlines are shown on the assigned tasks.</p>}</div></Panel>
      </div>
    </>
  } else if (moduleId === "email") {
    content = (
      <div className="grid min-h-[560px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] md:grid-cols-[360px_1fr]">
        <div className="border-r border-white/10"><div className="border-b border-white/10 p-5 text-xs uppercase tracking-wider text-white/40">Deal communications · {data.emails.length}</div>{data.emails.map((email) => <button key={email.id} onClick={() => setSelectedEmail(email.id)} className={`block w-full border-b border-white/5 p-4 text-left hover:bg-white/5 ${selected?.id === email.id ? "bg-cyan-400/10" : ""}`}><div className="flex items-center justify-between gap-3"><p className="truncate text-sm text-white/80">{titleCase(email.from_role)}</p><span className="text-[10px] text-white/30">{formatDate(email.created_at)}</span></div><p className="mt-1 truncate text-sm font-medium">{email.subject}</p><p className="mt-1 line-clamp-2 text-xs text-white/40">{email.body}</p></button>)}</div>
        <div className="p-7">{selected ? <><div className="flex items-center gap-3 text-cyan-300"><Mail className="h-5 w-5" /><span className="text-xs uppercase tracking-wider">CRE transaction message</span></div><h2 className="mt-6 text-2xl font-light">{selected.subject}</h2><p className="mt-3 text-sm text-white/45">From {titleCase(selected.from_role)} · To {titleCase(selected.to_role)}</p><div className="mt-8 whitespace-pre-wrap rounded-xl border border-white/8 bg-black/15 p-5 text-sm leading-7 text-white/70">{selected.body}</div><button onClick={() => setChatInput(`Draft a response to: ${selected.subject}`)} className="mt-5 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-black">Prepare response with Donna</button></> : <p className="text-white/40">No deal communications have arrived.</p>}</div>
      </div>
    )
  } else if (moduleId === "lead-generator") {
    content = <Panel title="CRE deal team and opportunities"><div className="mb-5 flex items-center rounded-xl border border-white/10 bg-black/20 px-4"><Search className="h-4 w-4 text-white/35" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contacts, companies, roles, or objectives" className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-white/25" /></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredContacts.map((contact) => <article key={contact.id} className="rounded-xl border border-white/8 bg-black/15 p-5"><div className="flex items-center gap-3"><div className="rounded-full bg-cyan-400/10 p-2"><Building2 className="h-4 w-4 text-cyan-300" /></div><div><h3 className="text-sm font-medium">{contact.title || contact.name}</h3><p className="text-xs text-white/40">{contact.company}</p></div></div><p className="mt-4 text-xs leading-5 text-white/50">{contact.notes}</p><div className="mt-4 space-y-1 text-xs text-white/45"><p>{contact.email}</p><p>{contact.phone}</p></div></article>)}</div></Panel>
  } else if (moduleId === "analytics") {
    const metrics = [
      ["Workflow complete", `${completionRate}%`, completionRate],
      ["Deal communications", String(data.emails.length), Math.min(100, data.emails.length * 12)],
      ["Documents ready", String(data.documents.length), Math.min(100, data.documents.length * 14)],
      ["DIN opportunities", String(data.din_bid_requests.length), Math.min(100, data.din_bid_requests.length * 25)],
    ] as const
    content = <div className="grid gap-5 md:grid-cols-2">{metrics.map(([label, value, percent]) => <Panel key={label} title={label}><div className="text-4xl font-light">{value}</div><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-400" style={{ width: `${percent}%` }} /></div></Panel>)}<Panel title="Role activity" className="md:col-span-2"><div className="grid gap-4 sm:grid-cols-4"><div><p className="text-2xl">{activeTasks.length}</p><p className="text-xs text-white/40">Open actions</p></div><div><p className="text-2xl">{data.notifications.length}</p><p className="text-xs text-white/40">Live alerts</p></div><div><p className="text-2xl">{data.contacts.length}</p><p className="text-xs text-white/40">Deal contacts</p></div><div><p className="text-2xl">{data.din_bid_responses.length}</p><p className="text-xs text-white/40">DIN responses</p></div></div></Panel></div>
  } else if (moduleId === "din") {
    content = <div className="grid gap-5 lg:grid-cols-[1fr_.7fr]"><Panel title="Open DIN marketplace requests"><div className="space-y-4">{data.din_bid_requests.map((request) => <article key={request.id} className="rounded-xl border border-violet-300/15 bg-violet-400/5 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-violet-300">{titleCase(request.service_type)}</p><h3 className="mt-2 text-lg">{request.title}</h3></div><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">{titleCase(request.status)}</span></div><p className="mt-3 text-sm leading-6 text-white/50">{request.description}</p><p className="mt-4 text-xs text-white/35">Requested by {titleCase(request.requested_by)} · Due {formatDate(request.due_date)}</p><button onClick={() => setChatInput(`Help me respond to this DIN request: ${request.title}`)} className="mt-4 rounded-lg border border-violet-300/20 bg-violet-400/10 px-3 py-2 text-xs text-violet-200 hover:bg-violet-400/15">Prepare DIN response</button></article>)}{!data.din_bid_requests.length && <p className="text-sm text-white/40">No DIN requests are open for this transaction.</p>}</div></Panel><Panel title="Network participants"><div className="space-y-4">{data.contacts.map((contact) => <div key={contact.id} className="flex items-start gap-3"><Users className="mt-0.5 h-4 w-4 text-cyan-300" /><div><p className="text-sm text-white/75">{contact.title || contact.name}</p><p className="text-xs text-white/35">{contact.company}</p></div></div>)}</div></Panel></div>
  } else {
    content = (
      <div className="grid gap-5 lg:grid-cols-[1fr_.7fr]">
        <Panel title="Donna CRE command center"><div className="min-h-[360px] space-y-4">{chatMessages.length === 0 && <div className="rounded-xl border border-cyan-300/15 bg-cyan-400/5 p-5"><MessageSquare className="h-5 w-5 text-cyan-300" /><p className="mt-3 text-sm text-white/65">Ask Donna to prioritize your tasks, summarize a deal communication, prepare a response, or identify the right DIN participant.</p><div className="mt-4 flex flex-wrap gap-2">{["What should I do next?", "Summarize my urgent deal items", "Who should I contact through DIN?"].map((prompt) => <button key={prompt} onClick={() => setChatInput(prompt)} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/55 hover:bg-white/5">{prompt}</button>)}</div></div>}{chatMessages.map((message, index) => <div key={`${message.sender}-${index}`} className={`max-w-[85%] rounded-xl p-4 text-sm leading-6 ${message.sender === "user" ? "ml-auto bg-cyan-400/15 text-cyan-50" : "border border-white/8 bg-black/20 text-white/70"}`}>{message.text}</div>)}</div><form onSubmit={sendChat} className="mt-5 flex gap-2"><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ask Donna about this CRE transaction..." className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-cyan-300/40" /><button disabled={chatting || !chatInput.trim()} className="rounded-xl bg-cyan-400 px-4 text-black disabled:opacity-40">{chatting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button></form></Panel>
        <div className="space-y-5"><Panel title="Priority actions">{activeTasks.slice(0, 5).map((task) => <div key={task.id} className="mb-3 flex gap-3"><Clock3 className="mt-0.5 h-4 w-4 text-orange-300" /><div><p className="text-sm text-white/70">{task.title}</p><p className="text-xs text-white/30">Due {formatDate(task.due_date)}</p></div></div>)}</Panel><Panel title="Live alerts">{data.notifications.map((notification) => <div key={notification.id} className="mb-3"><p className="text-sm text-white/70">{notification.title}</p><p className="mt-1 text-xs text-white/35">{notification.body}</p></div>)}</Panel></div>
      </div>
    )
  }

  return <div className="mx-auto min-h-screen max-w-7xl px-6 pb-12">{header}{content}</div>
}
