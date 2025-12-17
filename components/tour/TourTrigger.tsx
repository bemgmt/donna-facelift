"use client"

import { useEffect } from 'react'
import { useTour } from '@/contexts/TourContext'
import { dashboardTour, quickTips, allTours } from '@/lib/tours/dashboard-tour'

/**
 * Component that listens for tour requests and starts the appropriate tour
 * This handles both chat-triggered tours and programmatic tour requests
 */
export function TourTrigger() {
  const { startTour } = useTour()

  useEffect(() => {
    // Don't set up listeners if startTour is not available
    if (!startTour) {
      return
    }

    // Listen for tour requests from chat or other sources
    const handleTourRequest = (event: CustomEvent) => {
      try {
        const { tourId } = event.detail
        
        // Find the tour config by ID from allTours object
        let tourConfig = null
        
        // Check allTours object first
        for (const [key, tour] of Object.entries(allTours)) {
          if (tour.id === tourId) {
            tourConfig = tour
            break
          }
        }
        
        // Fallback to specific tours
        if (!tourConfig) {
          if (tourId === 'dashboard-full-tour') {
            tourConfig = dashboardTour
          } else if (tourId === 'quick-tips') {
            tourConfig = quickTips
          }
        }
        
        if (tourConfig && startTour) {
          startTour(tourConfig)
        } else if (startTour) {
          console.warn(`Tour not found: ${tourId}. Starting default dashboard tour.`)
          startTour(dashboardTour)
        }
      } catch (error) {
        console.error('Error handling tour request:', error)
      }
    }

    // Listen for tour control events (from chat)
    const handleTourControl = (event: CustomEvent) => {
      try {
        const { action, tourId } = event.detail
        
        if (action === 'start' && tourId) {
          handleTourRequest(event)
        }
      } catch (error) {
        console.error('Error handling tour control:', error)
      }
    }

    // Only add listeners if window is available (client-side)
    if (typeof window !== 'undefined') {
      window.addEventListener('donna:tour-requested', handleTourRequest as EventListener)
      window.addEventListener('donna:tour-control', handleTourControl as EventListener)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('donna:tour-requested', handleTourRequest as EventListener)
        window.removeEventListener('donna:tour-control', handleTourControl as EventListener)
      }
    }
  }, [startTour])

  // This component doesn't render anything
  return null
}

