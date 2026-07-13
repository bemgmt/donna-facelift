"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import GridLoading from "@/components/grid-loading"

const InteractiveGrid = dynamic(
  () => import("@/components/interactive-grid"),
  {
    ssr: false,
    loading: () => <GridLoading />,
  }
)

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

  if (!sessionReady) {
    return <GridLoading />
  }

  return (
    <main className="min-h-screen">
      <InteractiveGrid showDriveChatbot={false} />
    </main>
  )
}
