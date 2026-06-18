"use client"

import { useState, useEffect, useRef } from "react"
import { MessageSquare, X, Send, RefreshCw } from "lucide-react"

export default function FacilitatorSupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [memberId, setMemberId] = useState("")
  const [orgId, setOrgId] = useState("dd-org-001")
  const [messages, setMessages] = useState<any[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load member details on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mId = localStorage.getItem("donna_drive_member_id") || ""
      setMemberId(mId)
    }
  }, [])

  // Poll chats periodically
  useEffect(() => {
    if (!memberId) return

    const loadChats = async () => {
      try {
        const res = await fetch(`/api/demo/chat?member_id=${memberId}`)
        const data = await res.json()
        if (data.success) {
          const newMessages = data.chats || []
          
          // Count unread (messages from facilitator that are new)
          if (!isOpen && newMessages.length > messages.length) {
            const added = newMessages.slice(messages.length)
            const facilitatorMsgs = added.filter((m: any) => m.sender === 'facilitator')
            setUnreadCount(prev => prev + facilitatorMsgs.length)
          }

          setMessages(newMessages)
        }
      } catch (err) {
        console.error("Failed to load support chats:", err)
      }
    }

    loadChats()
    const interval = setInterval(loadChats, 4000)
    return () => clearInterval(interval)
  }, [memberId, messages.length, isOpen])

  // Scroll to bottom on updates
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setUnreadCount(0)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || !memberId) return

    setSending(true)
    const msgText = inputMessage
    setInputMessage("")
    
    try {
      const res = await fetch("/api/demo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: orgId,
          member_id: memberId,
          sender: "attendee",
          message: msgText
        })
      })
      const data = await res.json()
      if (data.success) {
        setMessages(prev => [...prev, data.chat])
      }
    } catch (err) {
      console.error("Error sending message:", err)
    } finally {
      setSending(false)
    }
  }

  if (!memberId) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-xl hover:scale-105 transition-all"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-[#0C0F16] flex items-center justify-center text-[10px] font-bold text-white animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Floating Chat Box */}
      {isOpen && (
        <div className="w-80 h-[380px] rounded-2xl glass border border-white/15 bg-black/60 shadow-2xl backdrop-blur-md flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/15 flex justify-between items-center bg-white/5">
            <div>
              <div className="text-xs font-semibold text-white/90">Event Help Desk</div>
              <div className="text-[10px] text-cyan-400">Ask the facilitator a question</div>
            </div>
            <button
              onClick={handleToggle}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar text-xs">
            {messages.length === 0 ? (
              <div className="text-center text-white/30 py-12">
                Need help or have questions about the deal transaction? Message the facilitator here.
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender === 'attendee'
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="text-[9px] text-white/40 mb-0.5">
                      {isMe ? 'You' : 'Facilitator'}
                    </div>
                    <div className={`p-2 rounded-xl max-w-[85%] leading-relaxed ${
                      isMe 
                        ? 'bg-cyan-500/15 border border-cyan-500/20 text-cyan-100' 
                        : 'bg-white/5 border border-white/10 text-white/95'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-white/[0.02] flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50"
            />
            <button
              type="submit"
              disabled={sending || !inputMessage.trim()}
              className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-black transition-colors"
            >
              {sending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
