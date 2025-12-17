import { isFaceliftPreview } from './facelift-preview'
import { cookies } from 'next/headers'

type ClerkServerModule = typeof import('@clerk/nextjs/server')

let serverModulePromise: Promise<ClerkServerModule> | null = null

async function loadClerkServerModule() {
  if (!serverModulePromise) {
    serverModulePromise = import('@clerk/nextjs/server')
  }
  return serverModulePromise
}

type AuthResult = Awaited<ReturnType<ClerkServerModule['auth']>>

const previewAuthResult = {
  userId: null,
  sessionId: null,
  getToken: async () => null,
  claims: null,
} as AuthResult

const demoAuthResult = {
  userId: 'demo-user-donna',
  sessionId: 'demo-session',
  getToken: async () => 'demo-token',
  claims: { sub: 'demo-user-donna' },
} as AuthResult

export async function auth(): Promise<AuthResult> {
  if (isFaceliftPreview) {
    // Check for demo session cookie
    const cookieStore = await cookies()
    const demoSession = cookieStore.get('donna_demo_session')
    if (demoSession?.value === 'true') {
      return demoAuthResult
    }
    return previewAuthResult
  }
  const { auth } = await loadClerkServerModule()
  return auth()
}

export async function currentUser() {
  if (isFaceliftPreview) {
    // Check for demo session cookie
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
  const { currentUser } = await loadClerkServerModule()
  return currentUser()
}

