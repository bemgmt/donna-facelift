"use client"

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { TourTrigger } from './TourTrigger'
import { TourOverlay } from './TourOverlay'

/**
 * Client wrapper for the tour system with error boundary
 */
export function TourSystem() {
  return (
    <ErrorBoundary fallback={null}>
      <TourTrigger />
      <TourOverlay />
    </ErrorBoundary>
  )
}

