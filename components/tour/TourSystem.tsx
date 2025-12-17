"use client"

import { TourTrigger } from './TourTrigger'

/**
 * Client wrapper for the tour system
 * Renders tour trigger component
 * TourOverlay is rendered in OnboardingFlow to avoid circular dependency issues
 */
export default function TourSystem() {
  // Just render TourTrigger - TourOverlay is handled in OnboardingFlow
  // This avoids circular dependency issues with useTour hook
  return <TourTrigger />
}

