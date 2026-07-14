import "server-only"

import { createHmac, timingSafeEqual } from "crypto"
import type { NextRequest } from "next/server"
import { FACILITATOR_SECRET } from "./constants"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const FACILITATOR_COOKIE = "donna_drive_facilitator"
const SESSION_PAYLOAD = "facilitator-v1"

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function sessionSignature() {
  return createHmac("sha256", FACILITATOR_SECRET).update(SESSION_PAYLOAD).digest("hex")
}

export function verifyFacilitatorSecret(secret: string) {
  return Boolean(secret) && safeEqual(secret, FACILITATOR_SECRET)
}

export function createFacilitatorSessionToken() {
  return `${SESSION_PAYLOAD}.${sessionSignature()}`
}

export function hasValidFacilitatorSession(request: NextRequest) {
  const token = request.cookies.get(FACILITATOR_COOKIE)?.value || ""
  return safeEqual(token, createFacilitatorSessionToken())
}

export async function isFacilitatorRequestAuthorized(request: NextRequest) {
  if (hasValidFacilitatorSession(request)) return true

  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return false

  const supabase = getSupabaseAdmin()
  if (!supabase) return false

  const { data: { user }, error } = await supabase.auth.getUser(authHeader.slice(7))
  if (error || !user?.email) return false

  let { data: userData } = await supabase
    .from("users")
    .select("profile")
    .eq("email", user.email)
    .maybeSingle()

  if (!userData) {
    const { data: provisionedUser } = await supabase
      .from("users")
      .insert({
        email: user.email,
        name: user.email.split("@")[0] || "Facilitator",
        profile: { role: "facilitator" },
      })
      .select("profile")
      .maybeSingle()
    userData = provisionedUser
  }
  const role = userData?.profile?.role
  return role === "admin" || role === "facilitator"
}
