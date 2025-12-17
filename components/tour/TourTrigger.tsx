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
    // Listen for tour requests from chat or other sources
    const handleTourRequest = (event: CustomEvent) => {
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
      
      if (tourConfig) {
        startTour(tourConfig)
      } else {
        console.warn(`Tour not found: ${tourId}. Starting default dashboard tour.`)
        startTour(dashboardTour)
      }
    }

    // Listen for tour control events (from chat)
    const handleTourControl = (event: CustomEvent) => {
      const { action, tourId } = event.detail
      
      if (action === 'start' && tourId) {
        handleTourRequest(event)
      }
    }

    window.addEventListener('donna:tour-requested', handleTourRequest as EventListener)
    window.addEventListener('donna:tour-control', handleTourControl as EventListener)

    return () => {
      window.removeEventListener('donna:tour-requested', handleTourRequest as EventListener)
      window.removeEventListener('donna:tour-control', handleTourControl as EventListener)
    }
  }, [startTour])

  // This component doesn't render anything
  return null
}

