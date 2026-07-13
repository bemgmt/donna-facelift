import { Suspense } from "react"
import DriveWorkspace from "@/features/drive/components/DriveWorkspace"

export default function DriveDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center bg-[#07090d] text-white/50">Loading DONNA Drive...</div>}>
      <DriveWorkspace />
    </Suspense>
  )
}
