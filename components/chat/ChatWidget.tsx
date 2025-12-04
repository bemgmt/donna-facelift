"use client"

import { useEffect, useState } from "react"
import { MessageCircle, X, Mic, MicOff, Send, Bot } from "lucide-react"
import { useOpenAIRealtime } from "@/hooks/use-openai-realtime"
import { ChatBubble } from "@/components/ui/chat-bubble"
import { NeonButton } from "@/components/ui/neon-button"
import { FuturisticInput } from "@/components/ui/futuristic-input"
import { GlassCard } from "@/components/ui/glass-card"

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [isMicOn, setIsMicOn] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const [state, actions] = useOpenAIRealtime({
    websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
    voice: 'alloy',
    temperature: 0.7,
    onMessage: (msg) => {
      console.log('[CHAT] ChatWidget received message:', msg)
      if (msg.type === 'assistant' && msg.content) {
        console.log('[CHAT] Adding assistant message to ChatWidget UI')
        setMessages((prev) => [...prev, { id: msg.id, role: 'assistant', text: msg.content }])
      } else {
        console.log('[CHAT] Message not added - type:', msg.type, 'content:', msg.content)
      }
    },
    onConnect: () => console.log('ChatWidget connected'),
    onDisconnect: () => console.log('ChatWidget disconnected'),
    onError: (err) => console.error('ChatWidget error:', err)
  })

  useEffect(() => {
    if (open && !state.isConnected && !state.isConnecting) {
      actions.connect()
    }
    if (!open && state.isConnected) {
      actions.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- actions object is stable from context
  }, [open, state.isConnected, state.isConnecting])

  const sendText = () => {
    const text = input.trim()
    if (!text) return
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text }])
    actions.sendText(text)
    setInput("")
  }

  const toggleMic = async () => {
    if (!state.isConnected) await actions.connect()
    if (!isMicOn) {
      setIsMicOn(true)
      actions.startListening()
    } else {
      setIsMicOn(false)
      actions.stopListening()
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only effect; registers window event handlers for widget open/close
  useEffect(() => {
    const openHandler = () => setOpen(true)
    const closeHandler = () => setOpen(false)
    window.addEventListener('donna:open', openHandler, { passive: true })
    window.addEventListener('donna:close', closeHandler, { passive: true })
    return () => {
      window.removeEventListener('donna:open', openHandler)
      window.removeEventListener('donna:close', closeHandler)
    }
  }, [])

  return (
    <>
      {/* Floating button */}
      <NeonButton
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 rounded-full p-4 glow-soft"
        aria-label="Open DONNA Chat"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </NeonButton>

      {/* Popup panel */}
      {open && (
        <GlassCard className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[70vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 bg-black/20">
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
              <div className={`w-1.5 h-1.5 rounded-full ${
                state.isConnected ? 'bg-donna-cyan glow-cyan' : 
                state.isConnecting ? 'bg-donna-purple animate-pulse' : 
                'bg-white/30'
              }`} />
              <span>{state.isConnected ? 'Connected' : state.isConnecting ? 'Connecting…' : 'Disconnected'}</span>
            </div>
          </div>
        </GlassCard>
      )}
    </>
  )
}

