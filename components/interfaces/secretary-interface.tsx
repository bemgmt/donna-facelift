"use client"

import React, { useEffect, useState } from "react"
import { ClipboardList, Calendar, FileText, Mail, Wand2 } from "lucide-react"

type Note = {
  id: string
  text: string
  createdAt: string
}

export default function SecretaryInterface() {
  const [notes, setNotes] = useState<Note[]>([])
  const [draft, setDraft] = useState("")
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailDraft, setEmailDraft] = useState("")
  const [emailTo, setEmailTo] = useState("")
  const [emailSubject, setEmailSubject] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("donna_secretary_notes")
    if (saved) setNotes(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem("donna_secretary_notes", JSON.stringify(notes))
  }, [notes])

  const addNote = () => {
    const text = draft.trim()
    if (!text) return
    setNotes((prev) => [{ id: `n-${Date.now()}`, text, createdAt: new Date().toISOString() }, ...prev])
    setDraft("")
  }

  const removeNote = (id: string) => setNotes((prev) => prev.filter(n => n.id !== id))

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || ""

  // Shell mode - visual only
  const summarizeNotes = async () => {
    if (notes.length === 0) return
    setLoading(true)
    // Shell mode - demo summary
    setTimeout(() => {
      setSummary("• Meeting discussed project timeline and deliverables\n• Action items: Review proposal by Friday (John), Schedule follow-up (Sarah)\n• Next meeting: Next week")
      setLoading(false)
    }, 500)
  }

  // Shell mode - visual only
  const draftFollowUp = async () => {
    setLoading(true)
    // Shell mode - demo draft
    setTimeout(() => {
      setEmailDraft("Thank you for the productive meeting today. As discussed, we'll proceed with the following next steps:\n\n1. Review the proposal by Friday\n2. Schedule a follow-up call next week\n\nLooking forward to continuing our collaboration.")
      setLoading(false)
    }, 500)
  }

  const openDonna = () => {
    window.dispatchEvent(new CustomEvent('donna:open'))
  }

  return (
    <div className="min-h-screen text-white p-8 glass-dark backdrop-blur">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ClipboardList className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-light">secretary</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes and capture */}
          <div className="lg:col-span-2 glass border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-white/60" />
                <h2 className="text-sm text-white/80">meeting notes</h2>
              </div>
              <button
                onClick={summarizeNotes}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                disabled={loading || notes.length === 0}
              >
                <Wand2 className="w-3 h-3 inline mr-1" /> summarize with donna
              </button>
            </div>
            <div className="flex gap-2 mb-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a quick note…"
                className="flex-1 glass border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/20 text-white placeholder-white/40"
              />
              <button onClick={addNote} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm">Add</button>
              <button onClick={openDonna} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm">Open Donna</button>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {notes.length === 0 && (
                <div className="text-white/50 text-sm py-8">No notes yet. Add notes or use the chatbot mic to capture live.</div>
              )}
              {notes.map((n) => (
                <div key={n.id} className="flex items-start justify-between glass border border-white/10 rounded-lg p-3">
                  <div className="text-sm text-white/90 whitespace-pre-wrap">{n.text}</div>
                  <button onClick={() => removeNote(n.id)} className="text-xs text-white/40 hover:text-white/70 ml-3">remove</button>
                </div>
              ))}
            </div>

            {summary && (
              <div className="mt-4">
                <div className="text-xs text-white/50 mb-1">summary</div>
                <div className="glass border border-white/10 rounded-lg p-3 text-sm whitespace-pre-wrap">{summary}</div>
              </div>
            )}
          </div>

          {/* Follow-up composer */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-white/60" />
              <h2 className="text-sm text-white/80">follow-up email</h2>
            </div>
            <input
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="To (name or email)"
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 mb-2"
            />
            <input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Subject"
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 mb-2"
            />
            <div className="flex gap-2 mb-2">
              <button onClick={draftFollowUp} disabled={loading} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm disabled:opacity-50">
                draft with donna
              </button>
              <button onClick={() => setEmailDraft("")} className="px-3 py-2 rounded-lg bg-white/10 text-sm">clear</button>
            </div>
            <textarea
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              placeholder="Email body will appear here…"
              rows={10}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40"
            />
            <div className="text-xs text-white/40 mt-2">To enable sending, configure SMTP (EMAIL_SMTP_HOST/PORT/USER/PASS) and we’ll wire a send endpoint next.</div>
          </div>
        </div>

        {/* Meet helper */}
        <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-white/60" />
            <h2 className="text-sm text-white/80">meeting assistant</h2>
          </div>
          <p className="text-sm text-white/70 mb-3">Open the <a href="/meet" className="text-blue-400 underline">Meet assistant</a> in a tab during your Google Meet. Say &quot;hey donna&quot; to open the chatbot and issue commands.</p>
          <div className="text-xs text-white/40">Next: Chrome Extension integration to run directly on meet.google.com with hotword and auto-notes.</div>
        </div>
      </div>
    </div>
  )
}

