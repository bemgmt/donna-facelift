import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import '@/styles/donna-theme.css'
import ChatWidget from '@/components/chat/ChatWidget'
import { VoiceProvider } from '@/components/voice/VoiceProvider'
import dynamic from 'next/dynamic'
import { ClerkProvider } from '@clerk/nextjs'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

// load nav mic button client-side only
const VoiceNavButton = dynamic(() => import('@/components/voice/VoiceNavButton'), { ssr: false })

// Load web vitals tracking client-side only with error handling
const WebVitalsTracker = dynamic(() => import('./web-vitals').then(mod => ({
  default: () => {
    try {
      mod.initWebVitals()
    } catch (error) {
      console.warn('Web vitals initialization failed:', error)
    }
    return null
  }
})).catch(() => ({
  default: () => null
})), { ssr: false })

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <html lang="en">
        <head>
          <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
          `}</style>
        </head>
        <body className="min-h-screen bg-black text-white">
          <VoiceProvider>
            <div className="donna-bg min-h-screen text-white">
              <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/50 backdrop-blur">
              <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                <div className="text-sm opacity-70">🧠 DONNA</div>
                <div className="flex items-center gap-3">
                  <SignedIn>
                    <UserButton appearance={{ elements: { userButtonPopoverCard: 'bg-neutral-900 text-white' } }} />
                  </SignedIn>
                  <SignedOut>
                    <a className="text-xs opacity-75 hover:opacity-100" href="/sign-in">Sign in</a>
                  </SignedOut>
                  <VoiceNavButton />
                </div>
              </div>
            </header>
              <main className="relative z-10">{children}</main>
              {/* Floating DONNA chat widget (client component) */}
              <ChatWidget />
              {/* Web vitals tracking */}
              <WebVitalsTracker />
            </div>
          </VoiceProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
