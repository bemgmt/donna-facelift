"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Globe } from "lucide-react"

function AutoJoinLogic() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")

  useEffect(() => {
    const userId = searchParams.get("user_id")
    const email = searchParams.get("email")
    const name = searchParams.get("name")
    const company = searchParams.get("company") || ""

    if (!userId || !email || !name) {
      setError("Missing required registration details. Please try again.")
      setTimeout(() => router.push("/drive/register"), 3000)
      return
    }

    const registerUser = async () => {
      try {
        const res = await fetch("/api/demo/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            email,
            name,
            company,
            phone: "",
            industry: "Real Estate"
          })
        })

        const data = await res.json()

        if (data.success) {
          localStorage.setItem("donna_drive_member_id", data.member_id)
          localStorage.setItem("donna_drive_user_name", name)
          localStorage.setItem("donna_drive_industry", "Real Estate")
          
          router.push("/drive/waiting-room")
        } else {
          setError(data.message || "Registration failed")
          setTimeout(() => router.push("/drive/register"), 3000)
        }
      } catch (err) {
        console.error(err)
        setError("Network error. Please try again.")
        setTimeout(() => router.push("/drive/register"), 3000)
      }
    }

    // Small delay to ensure the animation is visible for a moment
    const timer = setTimeout(() => {
      registerUser()
    }, 800)
    
    return () => clearTimeout(timer)
  }, [searchParams, router])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-400/20">
          <Globe className="w-10 h-10 text-cyan-400 animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-ping" />
      </div>
      
      {error ? (
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <p className="text-sm text-white/50">Redirecting to manual registration...</p>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-light tracking-tight text-white mb-2">Connecting to DONNA Drive</h2>
          <p className="text-sm text-white/50">Securing your session and staging the environment...</p>
        </div>
      )}
    </div>
  )
}

export default function AutoJoinPage() {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-cyan-600/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
      </div>
      
      <div className="glass p-12 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md">
        <Suspense fallback={<div className="text-white/50">Loading...</div>}>
          <AutoJoinLogic />
        </Suspense>
      </div>
    </div>
  )
}
