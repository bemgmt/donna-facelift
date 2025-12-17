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
  const [isReady, setIsReady] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Messages state - now updatable
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', text: 'Hello! I\'m DONNA, your AI assistant. This is a design preview.' },
    { id: '2', role: 'user', text: 'Hi DONNA!' },
    { id: '3', role: 'assistant', text: 'Welcome! The full functionality will be available when the backend is connected.' }
  ])

  // Check if user is authenticated and main UI is ready
  useEffect(() => {
    const checkReady = () => {
      const demoSession = localStorage.getItem('donna_demo_session')
      const isInitialized = sessionStorage.getItem('donna_context_initialized')
      
      // Only activate chatbot after authentication and initialization
      if (demoSession === 'true' && isInitialized === 'true') {
        setIsReady(true)
      } else {
        setIsReady(false)
      }
    }

    // Check immediately
    checkReady()

    // Listen for auth ready event
    const handleAuthReady = () => {
      checkReady()
    }

    // Listen for storage changes (when user logs in from another tab)
    const handleStorageChange = () => {
      checkReady()
    }

    window.addEventListener('donna:auth-ready', handleAuthReady)
    window.addEventListener('storage', handleStorageChange)
    
    // Also check periodically in case events don't fire
    const interval = setInterval(checkReady, 500)

    return () => {
      window.removeEventListener('donna:auth-ready', handleAuthReady)
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

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
    
    // Check if user is requesting a tour
    const tourKeywords = ['tour', 'show me around', 'guide me', 'walkthrough', 'tutorial', 'help me navigate']
    const lowerText = text.toLowerCase()
    const isTourRequest = tourKeywords.some(keyword => lowerText.includes(keyword))
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text
    }
    setMessages(prev => [...prev, userMessage])
    setInput("")

    // If it's a tour request, trigger the tour
    if (isTourRequest) {
      // Trigger tour start
      window.dispatchEvent(new CustomEvent('donna:tour-control', {
        detail: {
          action: 'start',
          tourId: 'dashboard-full-tour'
        }
      }))
      
      // Add DONNA's response
      setTimeout(() => {
        const donnaMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: 'Great! Let me show you around. Starting the tour now! 🎉'
        }
        setMessages(prev => [...prev, donnaMessage])
      }, 300)
      
      return
    }

    // Simulate Donna responding for other messages
    setTimeout(() => {
      setIsDonnaSpeaking(true)
      window.dispatchEvent(new CustomEvent('donna:start-speaking', {
        detail: { intensity: 0.9 }
      }))

      setTimeout(() => {
        setIsDonnaSpeaking(false)
        window.dispatchEvent(new Event('donna:stop-speaking'))
        // Add a generic response
        const donnaMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          text: 'I understand. How can I help you further?'
        }
        setMessages(prev => [...prev, donnaMessage])
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

  // Don't render if not ready (user not authenticated or initialization not complete)
  if (!isReady) {
    return null
  }

  return (
    <>
      {/* Floating button - bottom right */}
      <NeonButton
        onClick={() => setOpen((v) => !v)}
        className="fixed z-50 rounded-full p-4 glow-soft"
        style={{ 
          bottom: '24px', 
          right: '24px',
          left: 'auto',
          top: 'auto',
          position: 'fixed'
        }}
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
            left: 'auto',
            top: 'auto',
            maxHeight: 'calc(100vh - 140px)',
            display: 'flex',
            flexDirection: 'column',
            transform: 'translateY(0)'
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

