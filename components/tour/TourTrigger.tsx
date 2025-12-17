"use client"

import { useEffect, useContext } from 'react'
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

    // Cache for loaded tour configs
    let tourConfigsCache: any = null
    let isLoading = false
    
    const loadTourConfigs = async (retryCount = 0): Promise<any> => {
      if (tourConfigsCache) {
        return tourConfigsCache
      }
      
      if (isLoading) {
        // Wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 100))
        return loadTourConfigs(retryCount)
      }
      
      if (retryCount > 3) {
        console.error('Failed to load tour configs after multiple retries')
        return null
      }
      
      isLoading = true
      
      try {
        // Use requestIdleCallback or setTimeout to ensure we're not blocking
        await new Promise(resolve => {
          if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(() => resolve(undefined))
          } else {
            setTimeout(resolve, 200 + retryCount * 100)
          }
        })
        
        const tourModule = await import('@/lib/tours/dashboard-tour')
        
        // Wait a bit more to ensure module is fully initialized
        await new Promise(resolve => setTimeout(resolve, 50))
        
        tourConfigsCache = {
          dashboardTour: tourModule.dashboardTour,
          quickTips: tourModule.quickTips,
          allTours: tourModule.allTours
        }
        
        isLoading = false
        return tourConfigsCache
      } catch (error) {
        isLoading = false
        console.error('Failed to load tour configs:', error)
        // Retry with exponential backoff
        if (retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 200 * (retryCount + 1)))
          return loadTourConfigs(retryCount + 1)
        }
        return null
      }
    }

    // Listen for tour requests from chat or other sources
    const handleTourRequest = async (event: CustomEvent) => {
      try {
        if (!startTour) {
          // Context not ready yet, wait a bit and try again
          setTimeout(() => handleTourRequest(event), 100)
          return
        }

        // Load tour configs with retry mechanism
        const tourConfigs = await loadTourConfigs()
        
        if (!tourConfigs || !tourConfigs.dashboardTour) {
          console.warn('Tour configs not available')
          return
        }

        const { tourId } = event.detail
        
        // Find the tour config by ID from allTours object
        let tourConfig = null
        
        // Check allTours object first
        if (tourConfigs.allTours && typeof tourConfigs.allTours === 'object') {
          try {
            for (const [key, tour] of Object.entries(tourConfigs.allTours)) {
              if (tour && typeof tour === 'object' && 'id' in tour && tour.id === tourId) {
                tourConfig = tour
                break
              }
            }
          } catch (e) {
            console.warn('Error iterating allTours:', e)
          }
        }
        
        // Fallback to specific tours
        if (!tourConfig) {
          if (tourId === 'dashboard-full-tour' && tourConfigs.dashboardTour) {
            tourConfig = tourConfigs.dashboardTour
          } else if (tourId === 'quick-tips' && tourConfigs.quickTips) {
            tourConfig = tourConfigs.quickTips
          }
        }
        
        if (tourConfig && startTour) {
          startTour(tourConfig)
        } else if (startTour && tourConfigs.dashboardTour) {
          console.warn(`Tour not found: ${tourId}. Starting default dashboard tour.`)
          startTour(tourConfigs.dashboardTour)
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

