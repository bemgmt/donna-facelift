"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Skip check if already on onboarding page
    if (pathname?.includes('/onboarding')) {
      setIsChecking(false)
      return
    }

    // Check if user has selected a vertical
    const checkVertical = async () => {
      try {
        const response = await fetch('/api/user/vertical')
        
        if (!response.ok) {
          // If unauthorized or error, let the page handle it
          setIsChecking(false)
          return
        }

        const data = await response.json()
        
        // If user doesn't have a vertical, redirect to onboarding
        if (!data.vertical) {
          router.push('/protected/onboarding')
          return
        }

        // User has vertical, allow access
        setIsChecking(false)
      } catch (error) {
        console.error('Error checking vertical:', error)
        // On error, allow access (fail open) - the page can handle errors
        setIsChecking(false)
      }
    }

    checkVertical()
  }, [pathname, router])

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/70">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}

