"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { VERNON_TASK_DEFINITIONS, type DriveEcosystemData, type DriveTaskAction, type DriveTaskRecord } from "@/lib/donna-drive/task-engine"
import type { ScenarioPack } from "@/lib/donna-drive/types"

function fallbackTasks(scenario: ScenarioPack, roleId: string): DriveTaskRecord[] {
  return scenario.tasks.map((task) => {
    const definition = VERNON_TASK_DEFINITIONS[task.id]
    return {
      id: task.id,
      org_id: "dd-org-001",
      scenario_task_id: task.id,
      assigned_to: task.ownerRoleId,
      title: task.title,
      description: definition?.description || task.title,
      status: task.status === "done" ? "completed" : task.status === "waiting" ? "waiting" : task.status === "in_progress" ? "in_progress" : "pending",
      priority: "medium",
      due_date: null,
      dependency_task_ids: task.dependencies,
      instructions: definition?.instructions || [],
      required_inputs: definition?.requiredInputs || [],
      completion_criteria: definition?.completionCriteria || [],
      evidence_requirements: definition?.evidenceRequirements || [],
      action_config: definition ? {
        module: definition.actionModule,
        label: definition.actionLabel,
        completion_effects: {
          document_name: definition.completionEffects.documentName,
          notify_roles: definition.completionEffects.notifyRoles,
          email_to_role: definition.completionEffects.emailToRole,
          email_subject: definition.completionEffects.emailSubject,
        },
      } : {},
      started_at: null,
      completed_at: null,
      blocked_reason: null,
      version: 1,
      updated_at: new Date(0).toISOString(),
      can_act: task.ownerRoleId === roleId,
      dependencies_complete: task.dependencies.length === 0,
    }
  })
}

export function useDriveTasks(scenario: ScenarioPack, roleId: string) {
  const fallback = useMemo(() => fallbackTasks(scenario, roleId), [scenario, roleId])
  const [tasks, setTasks] = useState<DriveTaskRecord[]>(fallback)
  const [live, setLive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null)
  const [ecosystem, setEcosystem] = useState<DriveEcosystemData>({ activity: [], notifications: [], calendar: [], documents: [], emails: [] })

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setTasks(fallback)
      setLoading(false)
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setTasks(fallback)
      setError("Sign in with your attendee account to save task progress.")
      setLoading(false)
      return
    }
    const response = await fetch("/api/donna-drive/tasks", { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" })
    const body = await response.json()
    if (!response.ok || !body.success) throw new Error(body.message || "Unable to load live tasks.")
    setTasks(body.tasks)
    setEcosystem(body.ecosystem || { activity: [], notifications: [], calendar: [], documents: [], emails: [] })
    setLive(true)
    setError(null)
    setLoading(false)
  }, [fallback])

  useEffect(() => { refresh().catch((cause) => { setTasks(fallback); setError(cause.message); setLoading(false) }) }, [refresh, fallback])

  useEffect(() => {
    if (!live || !isSupabaseConfigured) return
    const channel = supabase.channel("drive-task-engine")
      .on("postgres_changes", { event: "*", schema: "public", table: "donna_drive_tasks", filter: "org_id=eq.dd-org-001" }, () => { refresh().catch(() => undefined) })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "donna_drive_task_events", filter: "org_id=eq.dd-org-001" }, () => { refresh().catch(() => undefined) })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [live, refresh])

  const act = useCallback(async (taskId: string, action: DriveTaskAction, note?: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error("Sign in with your attendee account to update this task.")
    setPendingTaskId(taskId)
    try {
      const response = await fetch("/api/donna-drive/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ task_id: taskId, action, note, idempotency_key: crypto.randomUUID() }),
      })
      const body = await response.json()
      if (!response.ok || !body.success) throw new Error(body.message || "Task update failed.")
      await refresh()
    } finally {
      setPendingTaskId(null)
    }
  }, [refresh])

  return { tasks, ecosystem, live, loading, error, pendingTaskId, act, refresh }
}
