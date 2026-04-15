import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlowCard } from "@/components/din/ui/glow-card"
import { TagPill } from "@/components/din/ui/tag-pill"
import type { TrendItem } from "@/lib/din/types"

interface TrendCardProps {
  trend: TrendItem
}

const demandColors = {
  high: "emerald",
  medium: "cyan",
  low: "default",
} as const

export function TrendCard({ trend }: TrendCardProps) {
  return (
    <GlowCard glowColor={demandColors[trend.demandSignal]} className="p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-medium text-white">{trend.title}</h3>
          <p className="text-xs text-white/40 mt-0.5">{trend.category}</p>
        </div>
        <div className="flex items-center gap-1">
          {trend.trendDirection === "up" && <TrendingUp className="w-4 h-4 text-emerald-400" />}
          {trend.trendDirection === "down" && <TrendingDown className="w-4 h-4 text-red-400" />}
          {trend.trendDirection === "stable" && <Minus className="w-4 h-4 text-white/40" />}
          <span
            className={cn(
              "text-sm font-medium",
              trend.trendDirection === "up" && "text-emerald-400",
              trend.trendDirection === "down" && "text-red-400",
              (!trend.trendDirection || trend.trendDirection === "stable") && "text-white/50"
            )}
          >
            {trend.growthIndicator}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <TagPill variant={demandColors[trend.demandSignal] === "emerald" ? "emerald" : demandColors[trend.demandSignal]}>
          {trend.demandSignal} demand
        </TagPill>
        <span className="text-xs text-white/35">{trend.relatedRequests} requests</span>
      </div>
      {trend.lastUpdated && (
        <p className="text-[10px] text-white/25 mt-3">Updated {trend.lastUpdated}</p>
      )}
      {trend.relatedCategories && trend.relatedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {trend.relatedCategories.map((cat) => (
            <TagPill key={cat}>{cat}</TagPill>
          ))}
        </div>
      )}
    </GlowCard>
  )
}
