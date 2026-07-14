"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import GridLoading from "@/components/grid-loading"

const InteractiveGrid = dynamic(() => import("@/components/interactive-grid"), {
  ssr: false,
  loading: () => <GridLoading />,
})

export default function DriveDashboardPage() {
  const router = useRouter()
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    const hasDriveSession =
      localStorage.getItem("donna_demo_session") === "true" &&
      Boolean(localStorage.getItem("donna_drive_member_id"))

    if (!hasDriveSession) {
      router.replace("/drive/register")
      return
    }

    const role = new URLSearchParams(window.location.search).get("role")
    if (role) {
      localStorage.setItem("donna_drive_role", role)
    }

    setSessionReady(true)
  }, [router])

  useEffect(() => {
    if (!sessionReady) return
    let active = true
    const checkEventStatus = async () => {
      try {
        const response = await fetch("/api/demo/event-status", { cache: "no-store" })
        const data = await response.json()
        if (active && data.success && data.org_status === "completed") {
          router.replace("/drive/summary")
        }
      } catch {
        // Task updates continue if this lightweight status poll is interrupted.
      }
    }
    void checkEventStatus()
    const interval = window.setInterval(checkEventStatus, 3000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [router, sessionReady])

  if (!sessionReady) {
    return <GridLoading />
  }

  return (
    <main className="min-h-screen">
      <InteractiveGrid showDriveChatbot={false} />
    </main>
  )
}
