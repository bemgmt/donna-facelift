"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Send, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX, Settings } from "lucide-react"
import { useVoiceChat } from "@/hooks/use-voice-chat"

// Backend API base comes from env in Vercel; fallback to empty (relative)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || ''

export default function ChatbotInterface() {
  const [input, setInput] = useState("")
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Local realtime messages for text-only mode
  const [rtMessages, setRtMessages] = useState<{ id: string; type: 'user' | 'assistant'; text: string }[]>([])
  const assistantBufferRef = useRef<string>("")
  const rafRef = useRef<number | null>(null)
  const [, setTick] = useState(0)

  // Voice chat hook - using batch processing for chatbot
  const [voiceState, voiceActions] = useVoiceChat({
    apiBaseUrl: API_BASE_URL,
    userId: 'chatbot-user',
    defaultVoiceId: 'XcXEQzuLXRU9RcfWzEJt', // Your custom ElevenLabs voice
    mode: 'batch', // Batch processing: Whisper -> GPT -> ElevenLabs
    onError: (error) => console.error('Voice chat error:', error)
  })

  // Initialize voice system
  const { testConnection, loadVoices } = voiceActions
  useEffect(() => {
    testConnection()
    loadVoices()
  }, [testConnection, loadVoices])

  // Handle text message send
  const handleSend = async () => {
    const userMessage = input.trim()
    if (!userMessage || voiceState.isProcessing) return
    setInput("")

    if (isVoiceMode) {
      // Use existing batch voice flow for voice mode
      await voiceActions.sendTextMessage(userMessage)
    } else {
      // Realtime over WebSocket using the same semantics as the Realtime API
      try {
        // Create a WS connection if not connected
        const windowWithWS = window as Window & { __DONNA_WS__?: WebSocket }
        if (!windowWithWS.__DONNA_WS__ || windowWithWS.__DONNA_WS__.readyState !== WebSocket.OPEN) {
          const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || ''
          if (!wsUrl) throw new Error('Realtime disabled: NEXT_PUBLIC_WEBSOCKET_URL not set')
          windowWithWS.__DONNA_WS__ = new WebSocket(wsUrl)
          await new Promise<void>((resolve, reject) => {
            const wsTmp = windowWithWS.__DONNA_WS__!
            wsTmp.onopen = () => {
              // Notify backend proxy to connect to OpenAI
              wsTmp.send(JSON.stringify({ type: 'connect_realtime' }))
              resolve()
            }
            wsTmp.onerror = () => reject(new Error('WebSocket error'))
          })

          // Attach message handler (once)
          windowWithWS.__DONNA_WS__!.onmessage = (evt: MessageEvent) => {
            try {
              const data = JSON.parse(evt.data)
              switch (data.type) {
                case 'session.created':
                case 'session.updated':
                  // connected
                  break
                case 'response.output_text.delta':
                  assistantBufferRef.current += data.delta || ''
                  if (rafRef.current == null) {
                    rafRef.current = requestAnimationFrame(() => {
                      setTick((n) => n + 1)
                      rafRef.current = null
                    })
                  }
                  break
                case 'response.completed':
                case 'response.done':
                  if (assistantBufferRef.current) {
                    setRtMessages(prev => ([...prev, { id: `rt_${Date.now()}`, type: 'assistant', text: assistantBufferRef.current }]))
                    assistantBufferRef.current = ''
                  }
                  break
                default:
                  // ignore other events for now
                  break
              }
            } catch {
              // ignore bad frames
            }
          }
        }

        const ws = windowWithWS.__DONNA_WS__!

        // Append user message locally
        setRtMessages(prev => ([...prev, { id: `rt_${Date.now()}`, type: 'user', text: userMessage }]))

        // 1) Add user message to the conversation
        ws.send(JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [ { type: 'input_text', text: userMessage } ]
          }
        }))

        // 2) Ask the model to respond
        ws.send(JSON.stringify({
          type: 'response.create',
          response: {
            conversation: 'default',
            modalities: ['text', 'audio'],
            instructions: 'Respond as Donna normally would.'
          }
        }))
      } catch (err) {
        console.error('Realtime send failed:', err)
      }
    }
  }

  // Cleanup WS on unmount to avoid leaks and stale handlers
  useEffect(() => {
    return () => {
      const w = window as Window & { __DONNA_WS__?: WebSocket }
      if (w.__DONNA_WS__ && (w.__DONNA_WS__.readyState === WebSocket.OPEN || w.__DONNA_WS__.readyState === WebSocket.CONNECTING)) {
        try { w.__DONNA_WS__.close(1000, 'unmount') } catch {}
      }
      w.__DONNA_WS__ = undefined
    }
  }, [])

  // Traditional text-only message (no voice response) - currently unused but may be needed for future text-only mode
  // const sendTextOnlyMessage = async (userMessage: string) => {
  //   try {
  //     // Call the live backend
  //     const response = await fetch(`${API_BASE_URL}/api/donna_logic.php`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         message: userMessage,
  //         user_id: 'chatbot-user'
  //       })
  //     })

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`)
  //     }

  //     const result = await response.json()

  //     if (result.success) {
  //       // Add messages manually for text-only mode
  //       voiceActions.clearMessages()
  //       // This is a workaround - in a real implementation you'd want separate state
  //     } else {
  //       throw new Error(result.error || 'Failed to get response')
  //     }
  //   } catch (error) {
  //     console.error('Chat error:', error)
  //   }
  // }

  // Handle voice recording
  const handleVoiceToggle = async () => {
    if (voiceState.recorder.isRecording) {
      const audioBlob = await voiceActions.recorder.stopRecording()
      if (audioBlob) {
        await voiceActions.sendVoiceMessage(audioBlob)
      }
    } else {
      await voiceActions.recorder.startRecording()
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen flex flex-col pt-20">
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-light">DONNA - AI Assistant</h2>
            <p className="text-sm text-white/60 mt-1">
              {isVoiceMode ? 'Voice mode enabled - Batch processing (Whisper -> GPT -> ElevenLabs)' : 'Text mode - Type your message'}
              {voiceState.connectionStatus === 'connected' && ' — Custom ElevenLabs voice ready'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={`p-2 rounded-full border transition-colors ${
                isVoiceMode
                  ? 'border-green-500 bg-green-500/20 text-green-400'
                  : 'border-white/40 bg-white/10 text-white/60'
              }`}
              title={isVoiceMode ? 'Disable voice mode' : 'Enable voice mode'}
            >
              {isVoiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full border border-white/40 bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
              title="Voice settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Voice Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-white/20 p-4 bg-white/5"
        >
          <h3 className="text-sm font-medium mb-3">Voice Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Connection Status</label>
              <div className={`text-xs px-2 py-1 rounded ${
                voiceState.connectionStatus === 'connected'
                  ? 'bg-green-500/20 text-green-400'
                  : voiceState.connectionStatus === 'error'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {voiceState.connectionStatus}
              </div>
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Voice</label>
              <div className="text-xs bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full">
                Custom Voice (XcXEQzuLXRU9RcfWzEJt)
              </div>
              <div className="text-xs text-white/60 mt-1">
                Batch: Whisper {'->'} GPT-4 {'->'} ElevenLabs
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Render messages based on mode */}
        {(isVoiceMode ? voiceState.messages : rtMessages).map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.type === "assistant" && (
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-md p-3 rounded-lg ${
                message.type === "user" ? "bg-white text-black" : "bg-white/10 text-white"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              {message.type === "assistant" && isVoiceMode && voiceState.player.isPlaying && (
                <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
                  <Volume2 className="w-3 h-3" />
                  <span>Playing...</span>
                </div>
              )}
            </div>
            {message.type === "user" && (
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            )}
          </motion.div>
        ))}

        {/* Loading indicator - show for voice mode processing or when assistant is typing in realtime */}
        {(isVoiceMode && voiceState.isProcessing) || (!isVoiceMode && !!assistantBufferRef.current) ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="max-w-md p-3 rounded-lg bg-white/10 text-white flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {isVoiceMode
                ? (voiceState.recorder.isRecording ? 'Listening...' : 'DONNA is thinking...')
                : 'DONNA is typing...'
              }
            </div>
          </motion.div>
        ) : null}

        {/* Voice recording indicator */}
        {voiceState.recorder.isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-3 h-3 bg-red-500 rounded-full"
              />
              <span className="text-sm text-red-400">Recording... Speak now</span>
              <div className="text-xs text-white/60">
                Level: {Math.round(voiceState.recorder.audioLevel * 100)}%
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-6 border-t border-white/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isVoiceMode ? "Type or speak your message..." : "Type your message..."}
            disabled={voiceState.isProcessing}
            className="flex-1 bg-white/10 border border-white/20 rounded px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:border-white/40 disabled:opacity-50"
          />

          {/* Voice recording button */}
          {isVoiceMode && (
            <button
              onClick={handleVoiceToggle}
              disabled={voiceState.isProcessing && !voiceState.recorder.isRecording}
              className={`p-2 rounded border transition-colors ${
                voiceState.recorder.isRecording
                  ? 'border-red-500 bg-red-500/20 text-red-400'
                  : 'border-white/40 bg-white/10 text-white/60 hover:bg-white/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={voiceState.recorder.isRecording ? 'Stop recording' : 'Start recording'}
            >
              {voiceState.recorder.isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={handleSend}
            disabled={voiceState.isProcessing || !input.trim()}
            className="bg-white text-black px-4 py-2 rounded hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {voiceState.isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        {/* Error display */}
        {voiceState.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-2 bg-red-500/20 border border-red-500/40 rounded text-red-400 text-sm"
          >
            {voiceState.error}
            <button
              onClick={voiceActions.clearError}
              className="ml-2 text-red-300 hover:text-red-200"
            >
×
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
