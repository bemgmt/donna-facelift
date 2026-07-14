export const DRIVE_INDUSTRIES = [
  { slug: "real_estate", label: "Real Estate" },
  { slug: "hospitality", label: "Hospitality" },
  { slug: "professional_services", label: "Professional Services" },
] as const

export type DriveIndustrySlug = (typeof DRIVE_INDUSTRIES)[number]["slug"]

export function normalizeDriveIndustry(value: unknown): DriveIndustrySlug | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_")
  return DRIVE_INDUSTRIES.some((industry) => industry.slug === normalized)
    ? normalized as DriveIndustrySlug
    : null
}
