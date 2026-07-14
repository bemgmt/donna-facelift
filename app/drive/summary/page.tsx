"use client"

import { useEffect, useState } from "react"
import { Award, CheckCircle2, Mail } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function SummaryPage() {
  const [userName, setUserName] = useState("Attendee")
  const [registrationEmail, setRegistrationEmail] = useState("")
  const [emailRequested, setEmailRequested] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    setUserName(localStorage.getItem("donna_drive_user_name") || "Attendee")
    setRegistrationEmail(localStorage.getItem("donna_demo_user") || "")
  }, [])

  const finish = async () => {
    if (!emailRequested) {
      setFinished(true)
      return
    }

    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error("Sign in again to request your event breakdown.")
      const response = await fetch("/api/donna-drive/summary", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message || "The email could not be sent.")
      toast.success("Your event breakdown was sent to your registration email.")
      setFinished(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The email could not be sent.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0C0F16] to-[#10121A] p-6 text-white">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl" />
      <div className="glass z-10 w-full max-w-2xl rounded-2xl border border-white/10 p-8 md:p-12">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20">
            {finished ? <CheckCircle2 className="h-10 w-10 text-emerald-400" /> : <Award className="h-10 w-10 text-emerald-400" />}
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">Thanks for joining, {userName}</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/60">
            The facilitator has concluded the DONNA Drive event. Your work, task progress, and event interactions have been recorded.
          </p>
        </div>

        {!finished ? <>
          <label className="mt-8 flex cursor-pointer items-start gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-5 text-left">
            <input type="checkbox" checked={emailRequested} onChange={(event) => setEmailRequested(event.target.checked)} className="mt-1 h-4 w-4 accent-cyan-400" />
            <span>
              <span className="flex items-center gap-2 font-medium"><Mail className="h-4 w-4 text-cyan-300" />Email me a breakdown of this event</span>
              <span className="mt-1 block text-sm text-white/45">We will use your registration email{registrationEmail ? ` (${registrationEmail})` : ""}.</span>
            </span>
          </label>
          <button onClick={finish} disabled={submitting} className="mt-5 w-full rounded-xl bg-cyan-400 px-6 py-4 font-semibold text-black transition-colors hover:bg-cyan-300 disabled:opacity-50">
            {submitting ? "Sending your breakdown..." : emailRequested ? "Send breakdown and finish" : "Finish"}
          </button>
        </> : <div className="mt-8 text-center">
          <p className="text-white/60">{emailRequested ? "Your breakdown is on its way. " : ""}We hope to see you at another DONNA Drive event.</p>
          <Link href="/" className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/5 px-8 py-3 font-medium hover:bg-white/10">Return home</Link>
        </div>}
      </div>
    </div>
  )
}
