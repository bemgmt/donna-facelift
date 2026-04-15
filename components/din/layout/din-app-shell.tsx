"use client"

import { DinSidebar } from "./din-sidebar"
import { DinTopbar } from "./din-topbar"

interface DinAppShellProps {
  children: React.ReactNode
}

export function DinAppShell({ children }: DinAppShellProps) {
  return (
    <div className="min-h-screen">
      <DinSidebar />
      <div className="md:ml-64 min-h-screen flex flex-col">
        <DinTopbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
