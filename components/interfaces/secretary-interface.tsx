"use client"

import React, { useEffect, useState } from "react"
import { ClipboardList, Calendar, FileText, Mail, Wand2, CheckCircle, Clock, AlertCircle, Plus, Search, Filter, Trash2, Edit, Send, Phone, Video, MapPin, User } from "lucide-react"
import { motion } from "framer-motion"

type Note = {
  id: string
  text: string
  createdAt: string
  category?: 'meeting' | 'task' | 'reminder' | 'general'
}

type Task = {
  id: string
  title: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  assignedTo?: string
}

type Meeting = {
  id: string
  title: string
  date: string
  time: string
  duration: number
  attendees: string[]
  location?: string
  type: 'in-person' | 'video' | 'phone'
  status: 'scheduled' | 'completed' | 'cancelled'
}

type NewTaskType = {
  title: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
}

type NewMeetingType = {
  title: string
  date: string
  time: string
  duration: number
  location: string
  type: 'in-person' | 'video' | 'phone'
  attendees: string
}

export default function SecretaryInterface(): JSX.Element {
  const [notes, setNotes] = useState<Note[]>([])
  const [draft, setDraft] = useState("")
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailDraft, setEmailDraft] = useState("")
  const [emailTo, setEmailTo] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [activeTab, setActiveTab] = useState<'notes' | 'tasks' | 'meetings' | 'email'>('notes')
  const [tasks, setTasks] = useState<Task[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [newTask, setNewTask] = useState<NewTaskType>({ title: '', description: '', dueDate: '', priority: 'medium' })
  const [newMeeting, setNewMeeting] = useState<NewMeetingType>({ title: '', date: '', time: '', duration: 60, location: '', type: 'video', attendees: '' })

  useEffect(() => {
    const saved = localStorage.getItem("donna_secretary_notes")
    if (saved) setNotes(JSON.parse(saved))
    
    // Load dummy data
    setTasks([
      { id: '1', title: 'Review Q4 sales report', description: 'Analyze sales performance and prepare summary', dueDate: '2024-01-25', priority: 'high', status: 'pending', assignedTo: 'John Doe' },
      { id: '2', title: 'Schedule team meeting', description: 'Coordinate with team for next week', dueDate: '2024-01-22', priority: 'medium', status: 'in_progress' },
      { id: '3', title: 'Update client database', description: 'Add new contacts from recent event', dueDate: '2024-01-20', priority: 'low', status: 'completed' },
    ])
    
    setMeetings([
      { id: '1', title: 'Client Presentation', date: '2024-01-23', time: '10:00', duration: 60, attendees: ['John Doe', 'Sarah Smith'], location: 'Conference Room A', type: 'in-person', status: 'scheduled' },
      { id: '2', title: 'Team Standup', date: '2024-01-22', time: '09:00', duration: 30, attendees: ['Team'], type: 'video', status: 'scheduled' },
      { id: '3', title: 'Vendor Call', date: '2024-01-21', time: '14:00', duration: 45, attendees: ['Vendor Rep'], type: 'phone', status: 'completed' },
    ])
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

  const addTask = () => {
    if (!newTask.title) return
    setTasks([...tasks, {
      id: `t-${Date.now()}`,
      ...newTask,
      status: 'pending',
      dueDate: newTask.dueDate || new Date().toISOString().split('T')[0]
    }])
    setNewTask({ title: '', description: '', dueDate: '', priority: 'medium' })
  }

  const addMeeting = () => {
    if (!newMeeting.title || !newMeeting.date) return
    setMeetings([...meetings, {
      id: `m-${Date.now()}`,
      ...newMeeting,
      attendees: newMeeting.attendees.split(',').map(a => a.trim()),
      status: 'scheduled'
    }])
    setNewMeeting({ title: '', date: '', time: '', duration: 60, location: '', type: 'video', attendees: '' })
  }

  return (
    <div className="min-h-screen text-white p-8 glass-dark backdrop-blur">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-light">secretary</h1>
          </div>
          <div className="flex gap-2">
            {['notes', 'tasks', 'meetings', 'email'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'notes' ? (
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
        ) : null}

        {activeTab === 'tasks' ? (
          <div className="space-y-6">
            <div className="glass border border-white/10 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-white">Task Management</h2>
                <button
                  onClick={addTask}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="glass border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40"
                />
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="glass border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="glass border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <textarea
                  placeholder="Description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="glass border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40"
                  rows={2}
                />
              </div>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-medium">{task.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${
                            task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm mb-2">{task.description}</p>
                        <div className="flex items-center gap-4 text-xs text-white/50">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          {task.assignedTo && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {task.assignedTo}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/20 rounded transition-colors">
                          <Edit className="w-4 h-4 text-white/60" />
                        </button>
                        <button className="p-2 hover:bg-white/20 rounded transition-colors">
                          <Trash2 className="w-4 h-4 text-white/60" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'meetings' ? (
          <div className="space-y-6">
            <div className="glass border border-white/10 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-white">Meeting Schedule</h2>
                <button
                  onClick={addMeeting}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Schedule Meeting
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Meeting title"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  className="glass border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40"
                />
                <input
                  type="date"
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                  className="glass border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
                <input
                  type="time"
                  value={newMeeting.time}
                  onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                  className="glass border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
                <select
                  value={newMeeting.type}
                  onChange={(e) => setNewMeeting({ ...newMeeting, type: e.target.value as 'in-person' | 'video' | 'phone' })}
                  className="glass border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="video">Video Call</option>
                  <option value="in-person">In-Person</option>
                  <option value="phone">Phone Call</option>
                </select>
                <input
                  type="text"
                  placeholder="Location (optional)"
                  value={newMeeting.location}
                  onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                  className="glass border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40"
                />
                <input
                  type="text"
                  placeholder="Attendees (comma separated)"
                  value={newMeeting.attendees}
                  onChange={(e) => setNewMeeting({ ...newMeeting, attendees: e.target.value })}
                  className="glass border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40"
                />
              </div>
              <div className="space-y-3">
                {meetings.map((meeting) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-medium">{meeting.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${
                            meeting.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            meeting.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {meeting.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/60 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {meeting.duration} min
                          </span>
                          {meeting.type === 'video' && <Video className="w-4 h-4" />}
                          {meeting.type === 'phone' && <Phone className="w-4 h-4" />}
                          {meeting.type === 'in-person' && meeting.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {meeting.location}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-white/50">
                          Attendees: {meeting.attendees.join(', ')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/20 rounded transition-colors">
                          <Edit className="w-4 h-4 text-white/60" />
                        </button>
                        <button className="p-2 hover:bg-white/20 rounded transition-colors">
                          <Trash2 className="w-4 h-4 text-white/60" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'email' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-white/60" />
                <h2 className="text-sm text-white/80">email composer</h2>
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
                rows={12}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button className="px-4 py-2 rounded-lg bg-white/10 text-sm hover:bg-white/15 transition-colors">
                  Save Draft
                </button>
                <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm flex items-center gap-2 transition-colors">
                  <Send className="w-4 h-4" />
                  Send Email
                </button>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-sm text-white/80 mb-3">Email Templates</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 bg-white/5 rounded hover:bg-white/10 text-sm text-white/80">
                  Follow-up Email
                </button>
                <button className="w-full text-left p-2 bg-white/5 rounded hover:bg-white/10 text-sm text-white/80">
                  Meeting Request
                </button>
                <button className="w-full text-left p-2 bg-white/5 rounded hover:bg-white/10 text-sm text-white/80">
                  Thank You Note
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

