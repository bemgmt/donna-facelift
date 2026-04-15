"use client"

import { motion } from "framer-motion"
import { DinPageHeader } from "@/components/din/layout/din-page-header"
import { TrendCard } from "@/components/din/intelligence/trend-card"
import { updatedSkills } from "@/lib/din/mock-data/intelligence"

export default function UpdatedSkillsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <DinPageHeader
        title="Updated Skills"
        subtitle="Skills with shifting demand and recent movement"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {updatedSkills.map((skill) => (
          <TrendCard key={skill.id} trend={skill} />
        ))}
      </div>
    </motion.div>
  )
}
