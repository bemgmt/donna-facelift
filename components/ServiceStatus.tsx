"use client"

import { useEffect, useState } from "react"

type Health = { ok: boolean; service?: string; version?: string; time?: number }

export default function ServiceStatus() {
  const [status, setStatus] = useState<"green"|"amber"|"red">("amber")
  const [info, setInfo] = useState<Health | null>(null)

  useEffect(() => {
    let cancelled = false
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || ""
    const intervalMs = Math.max(1000, Number(process.env.NEXT_PUBLIC_STATUS_POLL_MS) || 10000)
    const timeoutMs  = Math.max(1000, Number(process.env.NEXT_PUBLIC_STATUS_TIMEOUT_MS) || 5000)
    let inFlight = false
    let controller: AbortController | null = null

    const poll = async () => {
      if (inFlight) return
      inFlight = true
      controller?.abort()
      controller = new AbortController()
      const timer = setTimeout(() => controller?.abort(), timeoutMs)
      try {
        const res = await fetch(`${apiBase}/api/health.php`, { cache: 'no-store', signal: controller.signal })
        if (!res.ok) throw new Error("bad response")
        const json: Health = await res.json()
        if (!cancelled) {
          setInfo(json)
          setStatus(Boolean(json.ok) ? "green" : "amber")
        }
      } catch (err) {
        if (!cancelled) {
          setInfo(null)
          setStatus('red')
        }
      } finally {
        clearTimeout(timer)
        inFlight = false
        controller = null
      }
    }

    poll()
    const id: ReturnType<typeof setInterval> = setInterval(poll, intervalMs)
    return () => { cancelled = true; controller?.abort(); clearInterval(id) }
  }, [])

  const color = status === 'green' ? 'bg-green-500' : status === 'amber' ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="flex items-center gap-2 text-xs text-white/70" role="status" aria-live="polite">
      <span className={`inline-block w-2 h-2 rounded-full ${color}`}></span>
      <span>API status: {status}</span>
      {info?.version && <span className="text-white/40">({info.version})</span>}
    </div>
  )
}

