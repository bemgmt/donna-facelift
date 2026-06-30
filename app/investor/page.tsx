"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import NoSSR from "@/components/no-ssr"
import GridLoading from "@/components/grid-loading"
import ServiceStatus from "@/components/ServiceStatus"

// Dynamically import the InteractiveGrid with no SSR
const InteractiveGrid = dynamic(
  () => import("@/components/interactive-grid"),
  {
    ssr: false,
    loading: () => <GridLoading />
  }
)

export default function Home() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    localStorage.setItem("donna_demo_session", "true")
    localStorage.setItem("donna_demo_user", "investor-preview@donna.local")
    localStorage.setItem("donna_investor_preview", "true")
    localStorage.removeItem("donna_drive_member_id")
    localStorage.removeItem("donna_drive_role")
    localStorage.removeItem("donna_drive_user_name")
    localStorage.removeItem("donna_drive_industry")
    sessionStorage.setItem("donna_context_initialized", "true")
    document.cookie = `donna_demo_session=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    document.cookie = `donna_demo_user=investor-preview@donna.local; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    window.dispatchEvent(new CustomEvent("donna:auth-ready"))
    setIsReady(true)
  }, [])

  if (!isReady) {
    return <GridLoading />
  }

  return (
    <main className="min-h-screen">
      <div className="p-4 flex justify-end">
        <ServiceStatus />
      </div>
      <NoSSR fallback={<GridLoading />}>
        <InteractiveGrid />
      </NoSSR>
    </main>
  )
}
