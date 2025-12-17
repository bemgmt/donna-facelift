"use client"

import { TourTrigger } from './TourTrigger'
import { TourOverlay } from './TourOverlay'
import { useTour } from '@/contexts/TourContext'

/**
 * Client wrapper for the tour system
 * Renders tour trigger and overlay components
 */
export default function TourSystem() {
  const { isActive } = useTour()

  return (
    <>
      <TourTrigger />
      {isActive && <TourOverlay />}
    </>
  )
}

