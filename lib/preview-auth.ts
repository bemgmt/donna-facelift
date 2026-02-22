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
  const clerkDisabled = process.env.AUTH_DISABLE_CLERK?.toLowerCase() === 'true'
  if (isFaceliftPreview) {
    // Check for demo session cookie
    const cookieStore = await cookies()
    const demoSession = cookieStore.get('donna_demo_session')
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/0a1b9e1f-6daf-4456-a763-89705411c976',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'19edd3'},body:JSON.stringify({sessionId:'19edd3',runId:'post-fix',hypothesisId:'H5',location:'lib/preview-auth.ts:37',message:'auth running in facelift preview mode',data:{isFaceliftPreview:true,hasDemoCookie:demoSession?.value==='true'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (demoSession?.value === 'true') {
      return demoAuthResult
    }
    return previewAuthResult
  }
  if (clerkDisabled) {
    const cookieStore = await cookies()
    const demoSession = cookieStore.get('donna_demo_session')
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/0a1b9e1f-6daf-4456-a763-89705411c976',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'19edd3'},body:JSON.stringify({sessionId:'19edd3',runId:'post-fix',hypothesisId:'H5',location:'lib/preview-auth.ts:48',message:'auth running with clerk disabled',data:{clerkDisabled:true,hasDemoCookie:demoSession?.value==='true'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
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

