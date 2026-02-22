import { cookies } from 'next/headers'

export type AuthResult = {
  userId: string | null
  sessionId: string | null
  getToken: () => Promise<string | null>
  claims: { sub?: string } | null
}

const previewAuthResult: AuthResult = {
  userId: null,
  sessionId: null,
  getToken: async () => null,
  claims: null,
}

const demoAuthResult: AuthResult = {
  userId: 'demo-user-donna',
  sessionId: 'demo-session',
  getToken: async () => 'demo-token',
  claims: { sub: 'demo-user-donna' },
}

/**
 * Auth for demo mode (cookie-based).
 * Returns demo user when donna_demo_session cookie is set.
 */
export async function auth(): Promise<AuthResult> {
  const cookieStore = await cookies()
  const demoSession = cookieStore.get('donna_demo_session')
  if (demoSession?.value === 'true') {
    return demoAuthResult
  }
  return previewAuthResult
}

export async function currentUser() {
  const cookieStore = await cookies()
  const demoSession = cookieStore.get('donna_demo_session')
  if (demoSession?.value === 'true') {
    const demoUser = cookieStore.get('donna_demo_user')
    return {
      id: 'demo-user-donna',
      username: demoUser?.value || 'DONNA',
      emailAddresses: [],
      firstName: 'DONNA',
      lastName: 'Demo',
    } as any
  }
  return null
}
