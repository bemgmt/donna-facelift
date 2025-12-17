"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import NoSSR from "@/components/no-ssr"
import GridLoading from "@/components/grid-loading"
import ServiceStatus from "@/components/ServiceStatus"
import DonnaContextInitializer from "@/components/donna-context-initializer"

// Dynamically import the InteractiveGrid with no SSR
const InteractiveGrid = dynamic(
  () => import("@/components/interactive-grid"),
  {
    ssr: false,
    loading: () => <GridLoading />
  }
)

type FlowState = 'loading' | 'initializing' | 'checking-auth' | 'authenticated' | 'unauthenticated'

export default function Home() {
  const router = useRouter()
  const [flowState, setFlowState] = useState<FlowState>('loading')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const checkAuthentication = useCallback(() => {
    // Check for demo session
    const demoSession = localStorage.getItem('donna_demo_session')
    
    if (demoSession === 'true') {
      // User is authenticated, show the interface
      setIsAuthenticated(true)
      setFlowState('authenticated')
      
      // Dispatch event to notify ChatWidget that it's ready
      window.dispatchEvent(new CustomEvent('donna:auth-ready'))
    } else {
      // User is not authenticated, redirect to login
      setIsAuthenticated(false)
      setFlowState('unauthenticated')
      router.push('/sign-in')
    }
  }, [router])

  useEffect(() => {
    // Check if initialization has already been completed
    const isInitialized = sessionStorage.getItem('donna_context_initialized')
    
    if (isInitialized === 'true') {
      // Skip initialization, go straight to auth check
      setFlowState('checking-auth')
      checkAuthentication()
    } else {
      // Start with loading screen, then move to initialization
      const timer = setTimeout(() => {
        setFlowState('initializing')
      }, 500) // Brief loading screen before initialization

      return () => clearTimeout(timer)
    }
  }, [checkAuthentication])

  const handleInitializationComplete = useCallback(() => {
    // After initialization, check authentication
    setFlowState('checking-auth')
    checkAuthentication()
  }, [checkAuthentication])

  const handleInitializationError = useCallback((error: Error) => {
    console.error('DONNA Context initialization failed:', error)
    // Continue with auth check even if initialization fails
    handleInitializationComplete()
  }, [handleInitializationComplete])

  // Show loading screen initially
  if (flowState === 'loading') {
    return <GridLoading />
  }

  // Show initialization screen
  if (flowState === 'initializing') {
    return (
      <DonnaContextInitializer
        onComplete={handleInitializationComplete}
        onError={handleInitializationError}
      />
    )
  }

  // Show loading while checking authentication
  if (flowState === 'checking-auth') {
    return <GridLoading />
  }

  // If not authenticated, the redirect will happen, but show loading as fallback
  if (flowState === 'unauthenticated' || !isAuthenticated) {
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
