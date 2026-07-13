import { NextRequest, NextResponse } from "next/server"
import {
  FACILITATOR_COOKIE,
  createFacilitatorSessionToken,
  hasValidFacilitatorSession,
  verifyFacilitatorSecret,
} from "@/lib/donna-drive/facilitator-auth"

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: hasValidFacilitatorSession(request) })
}

export async function POST(request: NextRequest) {
  const { secret = "" } = await request.json().catch(() => ({}))
  if (!verifyFacilitatorSecret(secret)) {
    return NextResponse.json({ success: false, message: "Invalid Drive secret" }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(FACILITATOR_COOKIE, createFacilitatorSessionToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(FACILITATOR_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 })
  return response
}
