"use client"

import { VerticalNavigation } from "@/components/VerticalNavigation"
import { useVertical } from "@/hooks/use-vertical"
import { VERTICALS } from "@/lib/constants/verticals"

export default function ProtectedPage() {
  const { vertical, isLoading } = useVertical()
  
  const verticalLabel = vertical 
    ? VERTICALS.find(v => v.key === vertical)?.label 
    : null

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          {verticalLabel ? `Welcome to DONNA - ${verticalLabel} Edition` : "Welcome to DONNA"}
        </h1>
        <p className="text-white/70 mt-2">
          {isLoading 
            ? "Loading your dashboard..." 
            : verticalLabel 
              ? `Your ${verticalLabel} dashboard is ready.`
              : "Please complete onboarding to access your dashboard."}
        </p>
      </div>

      {vertical && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Quick Access</h2>
          <VerticalNavigation />
        </div>
      )}

      <div className="mt-8 p-6 bg-white/5 rounded-lg border border-white/10">
        <h3 className="text-sm font-semibold text-white mb-2">Dashboard Overview</h3>
        <p className="text-sm text-white/60">
          Your vertical-specific modules and features will appear here. Use the navigation above to access industry-specific tools.
        </p>
      </div>
    </div>
  )
}

