"use client"

import { useEffect, useContext, useState } from 'react'
import { TourContext } from '@/contexts/TourContext'

/**
 * Component that listens for tour requests and starts the appropriate tour
 * This handles both chat-triggered tours and programmatic tour requests
 */
export function TourTrigger() {
  // Use useContext directly to avoid throwing errors if context is not available
  const context = useContext(TourContext)
  
  // If context is not available, set up listeners but they won't work until context is ready
  const startTour = context?.startTour

  useEffect(() => {
    // Set up listeners even if startTour is not available yet
    // They will work once the context is ready
    if (typeof window === 'undefined') {
      return
    }

    // Lazy load tour configs to avoid circular dependency issues
    let tourConfigs: any = null
    
    const loadTourConfigs = async () => {
      if (!tourConfigs) {
        try {
          const tourModule = await import('@/lib/tours/dashboard-tour')
          tourConfigs = {
            dashboardTour: tourModule.dashboardTour,
            quickTips: tourModule.quickTips,
            allTours: tourModule.allTours
          }
        } catch (error) {
          console.error('Failed to load tour configs:', error)
          return null
        }
      }
      return tourConfigs
    }

    // Listen for tour requests from chat or other sources
    const handleTourRequest = async (event: CustomEvent) => {
      try {
        if (!startTour) {
          // Context not ready yet, wait a bit and try again
          setTimeout(() => handleTourRequest(event), 100)
          return
        }

        const configs = await loadTourConfigs()
        if (!configs) return

        const { tourId } = event.detail
        
        // Find the tour config by ID from allTours object
        let tourConfig = null
        
        // Check allTours object first
        for (const [key, tour] of Object.entries(configs.allTours)) {
          if (tour.id === tourId) {
            tourConfig = tour
            break
          }
        }
        
        // Fallback to specific tours
        if (!tourConfig) {
          if (tourId === 'dashboard-full-tour') {
            tourConfig = configs.dashboardTour
          } else if (tourId === 'quick-tips') {
            tourConfig = configs.quickTips
          }
        }
        
        if (tourConfig && startTour) {
          startTour(tourConfig)
        } else if (startTour) {
          console.warn(`Tour not found: ${tourId}. Starting default dashboard tour.`)
          startTour(configs.dashboardTour)
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

