import { isFaceliftPreview } from './facelift-preview'

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

export async function auth(): Promise<AuthResult> {
  if (isFaceliftPreview) {
    return previewAuthResult
  }
  const { auth } = await loadClerkServerModule()
  return auth()
}

export async function currentUser() {
  if (isFaceliftPreview) {
    return null
  }
  const { currentUser } = await loadClerkServerModule()
  return currentUser()
}

