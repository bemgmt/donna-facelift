"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import SettingsInterface from "./interfaces/settings-interface"

export default function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('donna:open-settings', handleOpen)
    return () => window.removeEventListener('donna:open-settings', handleOpen)
  }, [])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl glass-dark border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-50 p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
          <div className="overflow-y-auto max-h-[90vh]">
            <SettingsInterface />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

