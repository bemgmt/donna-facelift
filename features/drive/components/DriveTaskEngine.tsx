"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Circle, Clock3, ExternalLink, Loader2, LockKeyhole } from "lucide-react"
import { toast } from "sonner"
import type { DriveTaskAction, DriveTaskRecord } from "@/lib/donna-drive/task-engine"

type Module = "home" | "tasks" | "room" | "affiliates" | "calendar" | "secretary" | "din"

export function DriveTaskEngine({ tasks, roleObjective, donnaOverlay, pendingTaskId, error, onAction, onOpenModule }: {
  tasks: DriveTaskRecord[]
  roleObjective: string
  donnaOverlay: string
  pendingTaskId: string | null
  error: string | null
  onAction: (taskId: string, action: DriveTaskAction, note?: string) => Promise<void>
  onOpenModule: (module: Module) => void
}) {
  const [selectedId, setSelectedId] = useState(tasks.find((task) => task.can_act)?.id || tasks[0]?.id)
  const [note, setNote] = useState("")
  const [mode, setMode] = useState<"complete" | "block">("complete")
  const selected = useMemo(() => tasks.find((task) => task.id === selectedId) || tasks[0], [tasks, selectedId])
  useEffect(() => { if (selected && !tasks.some((task) => task.id === selectedId)) setSelectedId(selected.id) }, [tasks, selected, selectedId])
  if (!selected) return <div className="rounded-2xl border border-white/10 p-8 text-sm text-white/50">The facilitator has not staged scenario tasks yet.</div>

  const busy = pendingTaskId === selected.id
  const doAction = async (action: DriveTaskAction, evidence?: string) => {
    try {
      await onAction(selected.id, action, evidence)
      setNote("")
      toast.success(action === "complete" ? "Task completed and shared with the event." : action === "block" ? "Blocker reported to the event." : "Task status updated.")
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Task update failed.")
    }
  }

  return <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
    <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 sm:p-5">
      {error && <div className="mb-4 flex gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-xs text-amber-100"><AlertTriangle className="h-4 w-4 shrink-0" />{error}</div>}
      <div className="space-y-2">{tasks.map((task) => <TaskButton key={task.id} task={task} selected={task.id === selected.id} onClick={() => { setSelectedId(task.id); setNote("") }} />)}</div>
    </section>
    <section className="rounded-2xl border border-cyan-300/15 bg-white/[0.045] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-cyan-300">{selected.scenario_task_id || selected.id}</p><h3 className="mt-2 text-lg font-semibold">{selected.title}</h3></div><StatusBadge status={selected.status} /></div>
      <p className="mt-4 text-sm leading-6 text-white/55">{selected.description}</p>
      {!selected.dependencies_complete && <div className="mt-4 flex gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-xs text-amber-100"><LockKeyhole className="h-4 w-4 shrink-0" />A dependency must be completed before this task can start or finish.</div>}
      <TaskList title="What to do" items={selected.instructions} numbered />
      <TaskList title="What you need" items={selected.required_inputs} />
      <TaskList title="Done means" items={selected.completion_criteria} />
      {selected.action_config.module && <button onClick={() => onOpenModule(selected.action_config.module as Module)} className="mt-5 flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"><ExternalLink className="h-4 w-4" />{selected.action_config.label || "Open supporting module"}</button>}
      <div className="my-5 h-px bg-white/10" />
      {!selected.can_act ? <p className="text-sm text-white/40">This task belongs to {selected.assigned_to.replace(/[-_]/g, " ")}. You can review its status, but only that role or the facilitator can update it.</p> : selected.status === "completed" ? <button disabled={busy} onClick={() => doAction("reopen")} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/70">Reopen task</button> : <>
        {selected.status !== "in_progress" && <button disabled={busy || !selected.dependencies_complete} onClick={() => doAction("start")} className="w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-medium text-black disabled:opacity-40">Start task</button>}
        <div className="mt-4 flex gap-2 text-xs"><button onClick={() => setMode("complete")} className={`rounded-lg px-3 py-2 ${mode === "complete" ? "bg-emerald-300/15 text-emerald-200" : "bg-white/5 text-white/45"}`}>Submit completion</button><button onClick={() => setMode("block")} className={`rounded-lg px-3 py-2 ${mode === "block" ? "bg-amber-300/15 text-amber-100" : "bg-white/5 text-white/45"}`}>Report blocker</button></div>
        <label htmlFor="drive-task-evidence" className="mt-4 block text-xs uppercase tracking-wider text-white/40">{mode === "complete" ? selected.evidence_requirements[0] || "Completion evidence" : "What is blocking this task?"}</label>
        <textarea id="drive-task-evidence" value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder={mode === "complete" ? "Summarize what you reviewed, delivered, or confirmed…" : "Name the missing input, owner, and requested next action…"} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-cyan-300/40" />
        <button disabled={busy || !note.trim() || (mode === "complete" && !selected.dependencies_complete)} onClick={() => doAction(mode, note)} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium disabled:opacity-40 ${mode === "complete" ? "bg-emerald-300 text-black" : "bg-amber-300 text-black"}`}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{mode === "complete" ? "Complete task" : "Send blocker"}</button>
      </>}
      <div className="mt-6 rounded-xl bg-black/20 p-4"><p className="text-xs uppercase tracking-wider text-white/35">Your role objective</p><p className="mt-2 text-sm leading-6 text-white/60">{roleObjective}</p><p className="mt-3 text-xs leading-5 text-cyan-100/60">{donnaOverlay}</p></div>
    </section>
  </div>
}

function TaskButton({ task, selected, onClick }: { task: DriveTaskRecord; selected: boolean; onClick: () => void }) {
  const Icon = task.status === "completed" ? CheckCircle2 : task.status === "blocked" || task.status === "waiting" ? AlertTriangle : task.status === "in_progress" ? Clock3 : Circle
  return <button onClick={onClick} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left ${selected ? "border-cyan-300/25 bg-cyan-300/[0.07]" : "border-white/5 bg-black/10 hover:bg-white/[0.04]"}`}><Icon className={`mt-0.5 h-5 w-5 shrink-0 ${task.status === "completed" ? "text-emerald-300" : task.status === "blocked" || task.status === "waiting" ? "text-amber-300" : task.status === "in_progress" ? "text-cyan-300" : "text-white/20"}`} /><div className="min-w-0"><p className={`text-sm font-medium ${task.status === "completed" ? "text-white/35 line-through" : "text-white/80"}`}>{task.title}</p><p className="mt-2 text-[10px] uppercase tracking-wider text-white/30">{task.scenario_task_id || task.id} · {task.assigned_to.replace(/[-_]/g, " ")} · {task.status.replace(/_/g, " ")}</p></div></button>
}

function StatusBadge({ status }: { status: DriveTaskRecord["status"] }) { return <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/50">{status.replace(/_/g, " ")}</span> }
function TaskList({ title, items, numbered = false }: { title: string; items: string[]; numbered?: boolean }) { if (!items.length) return null; return <div className="mt-5"><p className="text-xs uppercase tracking-wider text-white/35">{title}</p><ol className="mt-3 space-y-2">{items.map((item, index) => <li key={item} className="flex gap-3 text-sm leading-5 text-white/65"><span className="text-cyan-300/60">{numbered ? `${index + 1}.` : "•"}</span>{item}</li>)}</ol></div> }
