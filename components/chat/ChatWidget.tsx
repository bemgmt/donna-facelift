"use client"

import { useEffect, useState } from "react"
import { MessageCircle, X, Mic, MicOff, Send, Bot } from "lucide-react"
import { useOpenAIRealtime } from "@/hooks/use-openai-realtime"

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
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-blue-600 hover:bg-blue-700 text-white p-4 shadow-lg"
        aria-label="Open DONNA Chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Popup panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[70vh] bg-zinc-900/95 backdrop-blur border border-white/10 rounded-xl shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/80">DONNA Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-white/10 rounded" onClick={() => setOpen(false)}>
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
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/90'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMic}
                className={`p-2 rounded-lg border ${isMicOn ? 'bg-red-500/10 border-red-500/40 text-red-300' : 'bg-white/5 border-white/10 text-white/70'}`}
                title={isMicOn ? 'Stop listening' : 'Start listening'}
              >
                {isMicOn ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendText()}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/20 text-white placeholder-white/40"
              />
              <button
                onClick={sendText}
                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-[10px] text-white/40">
              {state.isConnected ? 'Connected' : state.isConnecting ? 'Connecting…' : 'Disconnected'}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

