"use client"

import dynamic from "next/dynamic"
import NoSSR from "@/components/no-ssr"
import GridLoading from "@/components/grid-loading"
import ServiceStatus from "@/components/ServiceStatus"

// Dynamically import the InteractiveGrid with no SSR
const InteractiveGrid = dynamic(
  () => import("@/components/interactive-grid"),
  {
    ssr: false,
    loading: () => <GridLoading />
  }
)

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <div className="p-4 flex justify-end">
        <ServiceStatus />
      </div>
      <NoSSR fallback={<GridLoading />}>
        <InteractiveGrid />
      </NoSSR>
    </main>
  )
}
