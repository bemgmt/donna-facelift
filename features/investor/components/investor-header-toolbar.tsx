"use client"

import Link from "next/link"
import { FolderArchive, Globe, RotateCcw, Settings } from "lucide-react"
import SettingsButton from "@/components/SettingsButton"

export function InvestorHeaderToolbar() {
  const resetSandbox = () => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("donna_investor_") || key.startsWith("donna_sandbox_"))
      .forEach((key) => localStorage.removeItem(key))
    sessionStorage.removeItem("donna_investor_welcome_v1")
    sessionStorage.removeItem("donna_investor_chat_opened_v1")
    window.dispatchEvent(new CustomEvent("donna:auth-ready"))
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-3 text-xs opacity-70">
      <Link
        href="/drive"
        className="flex items-center gap-1.5 text-xs opacity-70 hover:opacity-100 transition-opacity text-purple-400 hover:text-purple-300"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>DONNA Drive Demo</span>
      </Link>
      <Link
        href="/investor/din"
        className="flex items-center gap-1.5 text-xs opacity-70 hover:opacity-100 transition-opacity"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>Access the DIN</span>
      </Link>
      <Link
        href="/investor/data-room"
        data-tour="data-room-nav"
        className="flex items-center gap-1.5 text-xs opacity-70 hover:opacity-100 transition-opacity"
      >
        <FolderArchive className="w-3.5 h-3.5" />
        <span>Data Room</span>
      </Link>
      <button
        type="button"
        onClick={resetSandbox}
        className="flex items-center gap-1.5 text-xs opacity-70 hover:opacity-100 transition-opacity"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset Sandbox</span>
      </button>
      <div className="flex items-center gap-1.5">
        <Settings className="w-3.5 h-3.5" />
        <SettingsButton />
      </div>
    </div>
  )
}
