"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Mic, MicOff, Send, Bot } from "lucide-react"
import { ChatBubble } from "@/components/ui/chat-bubble"
import { NeonButton } from "@/components/ui/neon-button"
import { FuturisticInput } from "@/components/ui/futuristic-input"
import { GlassCard } from "@/components/ui/glass-card"

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

// Shell version - visual only, no API calls
export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [isMicOn, setIsMicOn] = useState(false)
  const [isDonnaSpeaking, setIsDonnaSpeaking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Static demo messages for visual preview
  const [messages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', text: 'Hello! I\'m DONNA, your AI assistant. This is a design preview.' },
    { id: '2', role: 'user', text: 'Hi DONNA!' },
    { id: '3', role: 'assistant', text: 'Welcome! The full functionality will be available when the backend is connected.' }
  ])

  // Scroll to bottom when panel opens or messages change
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open, messages])

  // Simulate Donna speaking when messages appear
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant') {
        setIsDonnaSpeaking(true)
        window.dispatchEvent(new CustomEvent('donna:start-speaking', {
          detail: { intensity: 0.9 }
        }))

        // Simulate speaking duration based on message length
        const duration = Math.min(lastMessage.text.length * 50, 3000)
        const timer = setTimeout(() => {
          setIsDonnaSpeaking(false)
          window.dispatchEvent(new Event('donna:stop-speaking'))
        }, duration)

        return () => clearTimeout(timer)
      }
    }
  }, [messages])

  const sendText = () => {
    const text = input.trim()
    if (!text) return
    // In shell mode, just clear the input - no actual sending
    setInput("")

    // Simulate Donna responding
    setTimeout(() => {
      setIsDonnaSpeaking(true)
      window.dispatchEvent(new CustomEvent('donna:start-speaking', {
        detail: { intensity: 0.9 }
      }))

      setTimeout(() => {
        setIsDonnaSpeaking(false)
        window.dispatchEvent(new Event('donna:stop-speaking'))
      }, 2000)
    }, 500)
  }

  const toggleMic = () => {
    const newMicState = !isMicOn
    setIsMicOn(newMicState)

    // Simulate Donna listening/responding when mic is on
    if (newMicState) {
      window.dispatchEvent(new CustomEvent('donna:start-speaking', {
        detail: { intensity: 0.6 }
      }))
    } else {
      window.dispatchEvent(new Event('donna:stop-speaking'))
    }
  }

  return (
    <>
      {/* Floating button - bottom right */}
      <NeonButton
        onClick={() => setOpen((v) => !v)}
        className="fixed z-50 rounded-full p-4 glow-soft"
        style={{ bottom: '24px', right: '24px' }}
        aria-label="Open DONNA Chat"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </NeonButton>

      {/* Popup panel - opens upward from bottom right */}
      {open && (
        <GlassCard 
          className="fixed z-50 w-[380px] rounded-xl shadow-2xl flex flex-col overflow-hidden" 
          style={{ 
            bottom: '100px', 
            right: '24px', 
            maxHeight: 'calc(100vh - 120px)',
            left: 'auto'
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-donna-cyan glow-cyan" />
              <span className="text-sm text-white/90 font-medium">DONNA Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="p-1.5 hover:bg-white/10 rounded transition-colors" 
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>

          {/* Messages - scrolls from bottom */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 relative donna-glow flex flex-col">
            {messages.length === 0 && (
              <div className="text-center text-white/50 text-sm py-8">
                Talk to DONNA. Type or hold the mic to speak.
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <ChatBubble variant={m.role === 'user' ? 'user' : 'donna'}>
                  <span className="text-sm leading-relaxed">{m.text}</span>
                </ChatBubble>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 glass-dark">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMic}
                className={`p-2 rounded-lg border transition-all ${
                  isMicOn 
                    ? 'bg-red-500/10 border-red-500/40 text-red-300 glow-soft' 
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
                title={isMicOn ? 'Stop listening' : 'Start listening'}
              >
                {isMicOn ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <FuturisticInput
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendText()}
                placeholder="Type a message..."
                className="flex-1 text-sm"
              />
              <NeonButton
                onClick={sendText}
                size="icon"
                className="p-2"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </NeonButton>
            </div>
            <div className="mt-2 text-[10px] text-white/40 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
              <span>Design Preview Mode</span>
            </div>
          </div>
        </GlassCard>
      )}
    </>
  )
}

