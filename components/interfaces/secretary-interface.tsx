"use client"

import React from "react"
import { ClipboardList } from "lucide-react"

export default function SecretaryInterface(): JSX.Element {
  return (
    <div className="min-h-screen text-white p-8 glass-dark backdrop-blur">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ClipboardList className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-light">secretary</h1>
        </div>
        <div className="glass border border-white/10 rounded-xl p-8 text-center">
          <p className="text-white/60">Secretary interface coming soon</p>
        </div>
      </div>
    </div>
  )
}
