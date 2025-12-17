"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for demo session
    const demoSession = localStorage.getItem('donna_demo_session')
    
    if (demoSession === 'true') {
      // User is authenticated, show the interface
      setIsAuthenticated(true)
      setIsChecking(false)
    } else {
      // User is not authenticated, redirect to login
      setIsChecking(false)
      // Use setTimeout to ensure redirect happens after render
      const timer = setTimeout(() => {
        router.replace('/sign-in')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [router])

  // Show loading while checking authentication
  if (isChecking) {
    return <GridLoading />
  }

  // If not authenticated, redirect is happening - show loading briefly
  if (!isAuthenticated) {
    return <GridLoading />
  }

  // User is authenticated, show the interface
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
