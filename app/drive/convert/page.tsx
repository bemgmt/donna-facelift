"use client"

import Link from "next/link"
import { ArrowLeft, Ban } from "lucide-react"

export default function ConvertDemoPage() {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/drive"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to DONNA Drive
        </Link>
      </div>

      <div className="px-4 py-12 sm:px-6 lg:px-8 flex items-center justify-center min-h-[80vh]">
        <div className="glass rounded-2xl border border-white/10 p-8 max-w-md w-full text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Ban className="h-7 w-7 text-white/70" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-3">Workspace conversion is not supported</h1>
          <p className="text-sm text-white/60 leading-relaxed">
            DONNA Drive is an event simulation. Event data, roles, and summaries stay inside the Drive experience.
          </p>
          <Link href="/drive/register" className="mt-6 inline-flex donna-btn px-5 py-2.5 rounded-xl text-sm">
            Register for an event
          </Link>
        </div>
      </div>
    </div>
  )
}
