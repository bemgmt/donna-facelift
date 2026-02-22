"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { OnboardingState, OnboardingStep, TourState, TourStatus } from '@/types/onboarding'

interface OnboardingContextType {
  state: OnboardingState
  updateUserData: (data: Partial<OnboardingState['userData']>) => void
  updatePersonality: (data: Partial<OnboardingState['personalitySelection']>) => void
  completeStep: (step: OnboardingStep) => void
  goToStep: (step: OnboardingStep) => void
  updateTourState: (tourState: Partial<TourState>) => void
  startTour: (type: 'full' | 'section' | 'mini') => void
  pauseTour: () => void
  resumeTour: () => void
  completeTour: () => void
  skipTour: () => void
  resetOnboarding: () => void
  saveProgress: () => Promise<void>
  loadProgress: () => Promise<void>
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

const INITIAL_STATE: OnboardingState = {
  currentStep: 'welcome',
  completedSteps: [],
  userData: {},
  personalitySelection: {},
  tourState: {
    status: 'not_started',
    currentStepIndex: 0,
    totalSteps: 0,
    visitedSections: [],
    canResume: false
  },
  isComplete: false
}

const STORAGE_KEY = 'donna_onboarding_state'

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE)

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setState(parsed)
      } catch (error) {
        console.error('Failed to parse onboarding state:', error)
      }
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const updateUserData = useCallback((data: Partial<OnboardingState['userData']>) => {
    setState(prev => ({
      ...prev,
      userData: { ...prev.userData, ...data }
    }))
  }, [])

  const updatePersonality = useCallback((data: Partial<OnboardingState['personalitySelection']>) => {
    setState(prev => ({
      ...prev,
      personalitySelection: { ...prev.personalitySelection, ...data }
    }))
  }, [])

  const completeStep = useCallback((step: OnboardingStep) => {
    setState(prev => {
      const completedSteps = prev.completedSteps.includes(step)
        ? prev.completedSteps
        : [...prev.completedSteps, step]
      
      // Determine next step
      const stepOrder: OnboardingStep[] = ['welcome', 'profile', 'personality', 'tour', 'complete']
      const currentIndex = stepOrder.indexOf(step)
      const nextStep = stepOrder[currentIndex + 1] || 'complete'
      
      return {
        ...prev,
        completedSteps,
        currentStep: nextStep,
        isComplete: nextStep === 'complete'
      }
    })
  }, [])

  const goToStep = useCallback((step: OnboardingStep) => {
    setState(prev => ({ ...prev, currentStep: step }))
  }, [])

  const updateTourState = useCallback((tourState: Partial<TourState>) => {
    setState(prev => ({
      ...prev,
      tourState: { ...prev.tourState, ...tourState }
    }))
  }, [])

  const startTour = useCallback((type: 'full' | 'section' | 'mini') => {
    setState(prev => ({
      ...prev,
      tourState: {
        ...prev.tourState,
        status: 'in_progress',
        currentTourType: type,
        currentStepIndex: 0,
        canResume: true
      }
    }))
  }, [])

  const pauseTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      tourState: {
        ...prev.tourState,
        status: 'paused',
        lastPausedAt: new Date(),
        canResume: true
      }
    }))
  }, [])

  const resumeTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      tourState: {
        ...prev.tourState,
        status: 'in_progress'
      }
    }))
  }, [])

  const completeTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      tourState: {
        ...prev.tourState,
        status: 'completed',
        canResume: false
      }
    }))
  }, [])

  const skipTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      tourState: {
        ...prev.tourState,
        status: 'skipped',
        canResume: false
      }
    }))
  }, [])

  const resetOnboarding = useCallback(() => {
    setState(INITIAL_STATE)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const saveProgress = useCallback(async () => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/0a1b9e1f-6daf-4456-a763-89705411c976',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'19edd3'},body:JSON.stringify({sessionId:'19edd3',runId:'initial',hypothesisId:'H1',location:'contexts/OnboardingContext.tsx:173',message:'saveProgress request start',data:{hasState:!!state,currentStep:state.currentStep,isComplete:state.isComplete},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      // Save to backend API
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      })

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/0a1b9e1f-6daf-4456-a763-89705411c976',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'19edd3'},body:JSON.stringify({sessionId:'19edd3',runId:'initial',hypothesisId:'H1',location:'contexts/OnboardingContext.tsx:179',message:'saveProgress response received',data:{ok:response.ok,status:response.status},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (!response.ok) {
        throw new Error('Failed to save onboarding progress')
      }
    } catch (error) {
      console.error('Error saving onboarding progress:', error)
      // Still save to localStorage as fallback
    }
  }, [state])

  const loadProgress = useCallback(async () => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/0a1b9e1f-6daf-4456-a763-89705411c976',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'19edd3'},body:JSON.stringify({sessionId:'19edd3',runId:'initial',hypothesisId:'H1',location:'contexts/OnboardingContext.tsx:190',message:'loadProgress request start',data:{storageKey:'donna_onboarding_state'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const response = await fetch('/api/user/onboarding')
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/0a1b9e1f-6daf-4456-a763-89705411c976',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'19edd3'},body:JSON.stringify({sessionId:'19edd3',runId:'initial',hypothesisId:'H1',location:'contexts/OnboardingContext.tsx:192',message:'loadProgress response received',data:{ok:response.ok,status:response.status},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (response.ok) {
        const data = await response.json()
        if (data.progress) {
          setState(data.progress)
        }
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error)
      // Fall back to localStorage
    }
  }, [])

  const value: OnboardingContextType = {
    state,
    updateUserData,
    updatePersonality,
    completeStep,
    goToStep,
    updateTourState,
    startTour,
    pauseTour,
    resumeTour,
    completeTour,
    skipTour,
    resetOnboarding,
    saveProgress,
    loadProgress
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}

