import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Zap } from "lucide-react"
import { DinPageHeader } from "@/components/din/layout/din-page-header"
import { GlowCard } from "@/components/din/ui/glow-card"
import { TagPill } from "@/components/din/ui/tag-pill"
import type { MatchProfile } from "@/lib/din/types"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

const suggestedMatches: MatchProfile[] = [
  {
    id: "m1",
    companyName: "Northstar Ops Collective",
    industry: "Workflow Automation",
    matchedSkills: ["Process Design", "Zapier", "CRM", "Automation"],
    fitScore: 94,
    responseSpeed: "18 min avg",
    verified: true,
    whyMatch: "Strong category overlap with your recent requests and preferred skill set",
    tags: ["Verified DONNA Node", "Fast Responder"],
  },
  {
    id: "m2",
    companyName: "Blue Harbor Automation",
    industry: "Software Development",
    matchedSkills: ["API Integration", "Automation", "Testing", "Node.js"],
    fitScore: 88,
    responseSpeed: "22 min avg",
    verified: true,
    whyMatch: "Matched based on recent network demand signals and your activity",
    tags: ["Verified DONNA Node", "Strong Category Match"],
  },
  {
    id: "m3",
    companyName: "Meridian Research Group",
    industry: "Market Research",
    matchedSkills: ["Data Analysis", "Strategy", "Competitive Intel"],
    fitScore: 82,
    responseSpeed: "35 min avg",
    verified: true,
    whyMatch: "Specializes in tech sector research matching your open requests",
    tags: ["Verified DONNA Node"],
  },
  {
    id: "m4",
    companyName: "Crestline Real Estate Support",
    industry: "Real Estate Ops",
    matchedSkills: ["Lead Routing", "CRM", "Real Estate", "Scheduling"],
    fitScore: 79,
    responseSpeed: "28 min avg",
    verified: false,
    whyMatch: "Regional match with high demand overlap in real estate operations",
    tags: ["Strong Category Match"],
  },
]

const liveDemoMatches = [
  {
    id: "linda",
    companyName: "Linda Tran, MAI (Appraisal)",
    industry: "Real Estate Appraisal",
    matchedSkills: ["MAI Certified", "Industrial Valuation", "Flex Properties"],
    fitScore: 96,
    responseSpeed: "10 min avg",
    verified: true,
    whyMatch: "Top recommended appraiser for Vernon Commerce Center. Match criteria: commercial lender request.",
    tags: ["Verified Partner", "Fast Responder"],
    taskKeywords: ["appraisal", "order appraisal"]
  },
  {
    id: "greenfield",
    companyName: "Greenfield Environmental",
    industry: "Environmental Engineering",
    matchedSkills: ["Phase I ESA", "Phase II ESA", "Soil Borings", "Remediation"],
    fitScore: 94,
    responseSpeed: "15 min avg",
    verified: true,
    whyMatch: "Recommended engineering firm for soil borings and ESA near loading dock area.",
    tags: ["Verified Partner"],
    taskKeywords: ["phase", "environmental", "remediation", "esa"]
  },
  {
    id: "apex",
    companyName: "Apex Land Surveying",
    industry: "Civil Surveying",
    matchedSkills: ["ALTA Survey", "Easement Boundary", "Boundary Mapping"],
    fitScore: 89,
    responseSpeed: "20 min avg",
    verified: true,
    whyMatch: "Recommended surveyor to map the unrecorded utility easement strip in south parking.",
    tags: ["Verified Partner"],
    taskKeywords: ["survey", "easement", "boundary"]
  },
  {
    id: "clear_title",
    companyName: "Clear Title Group",
    industry: "Title & Escrow Services",
    matchedSkills: ["Title Insurance", "Escrow Coordination", "Easement Settlement"],
    fitScore: 91,
    responseSpeed: "12 min avg",
    verified: true,
    whyMatch: "Title company recommended to draft CC&R updates or exceptions for the utility easement.",
    tags: ["Verified Partner"],
    taskKeywords: ["title", "escrow", "easement"]
  }
]

export default function SuggestedMatchesPage() {
  const [isLiveDemo, setIsLiveDemo] = useState(false)
  const [roleSlug, setRoleSlug] = useState("")
  const [hiredIds, setHiredIds] = useState<Set<string>>(new Set())
  const [hiringId, setHiringId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const live = localStorage.getItem("donna_demo_session") === "true" && !!localStorage.getItem("donna_drive_member_id")
      const rSlug = localStorage.getItem("donna_drive_role") || ""
      setIsLiveDemo(live)
      setRoleSlug(rSlug)
    }
  }, [])

  const handleHire = async (match: any) => {
    setHiringId(match.id)
    
    try {
      if (isLiveDemo) {
        const res = await fetch(`/api/demo/data?role=${roleSlug}`)
        const data = await res.json()
        
        if (data.success && data.tasks) {
          const taskToComplete = data.tasks.find((t: any) => {
            if (t.status === 'completed') return false
            const titleLower = t.title.toLowerCase()
            const descLower = t.description.toLowerCase()
            return match.taskKeywords.some((keyword: string) => 
              titleLower.includes(keyword) || descLower.includes(keyword)
            )
          })

          if (taskToComplete) {
            if (isSupabaseConfigured) {
              await supabase
                .from('donna_drive_tasks')
                .update({ status: 'completed' })
                .eq('id', taskToComplete.id)
            }
            toast({
              title: "Affiliate Hired",
              description: `Hired ${match.companyName} successfully! The task "${taskToComplete.title}" has been completed.`,
            })
          } else {
            toast({
              title: "Affiliate Hired",
              description: `Hired ${match.companyName} successfully! No pending tasks matched this affiliate.`,
            })
          }
        } else {
          toast({
            title: "Affiliate Hired",
            description: `Hired ${match.companyName} successfully!`,
          })
        }
      } else {
        toast({
          title: "Affiliate Hired (Preview)",
          description: `Successfully simulated hiring ${match.companyName}.`,
        })
      }

      setHiredIds(prev => {
        const next = new Set(prev)
        next.add(match.id)
        return next
      })
    } catch (err) {
      console.error("Hiring error:", err)
      toast({
        title: "Error",
        description: "Failed to hire affiliate. Please try again.",
        variant: "destructive"
      })
    } finally {
      setHiringId(null)
    }
  }

  const matchesToRender = isLiveDemo ? liveDemoMatches : suggestedMatches

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <DinPageHeader
        title="Suggested Matches"
        subtitle="DIN-recommended providers based on your profile and network activity"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matchesToRender.map((match) => (
          <GlowCard key={match.id} glowColor="violet" className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-medium text-white">{match.companyName}</h3>
                    {match.verified && (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-white/40">{match.industry}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-light text-white">{match.fitScore}%</p>
                  <p className="text-[10px] text-white/35">fit score</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {match.matchedSkills.map((skill) => (
                  <TagPill key={skill} variant="cyan">{skill}</TagPill>
                ))}
              </div>

              <p className="text-xs text-white/40 mb-4">{match.whyMatch}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-4">
              <div className="flex flex-wrap gap-1.5 max-w-[50%]">
                {match.tags.map((tag) => (
                  <TagPill key={tag} variant="emerald">{tag}</TagPill>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[10px] text-amber-400/70 shrink-0">
                  <Zap className="w-3 h-3" />
                  <span>{match.responseSpeed}</span>
                </div>
                <button
                  disabled={hiringId !== null || hiredIds.has(match.id)}
                  onClick={() => handleHire(match)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                    hiredIds.has(match.id)
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default"
                      : "bg-cyan-500 hover:bg-cyan-600 text-black shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
                  }`}
                >
                  {hiredIds.has(match.id) ? "Hired" : (hiringId === match.id ? "Hiring..." : "Hire Provider")}
                </button>
              </div>
            </div>
          </GlowCard>
        ))}
      </div>
    </motion.div>
  )
}
