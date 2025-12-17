import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import '@/styles/donna-theme.css'
import ChatWidget from '@/components/chat/ChatWidget'
import SettingsModal from '@/components/SettingsModal'
import DonnaLightBar from '@/components/DonnaLightBar'
import { VoiceProvider } from '@/components/voice/VoiceProvider'
import { OnboardingProvider } from '@/contexts/OnboardingContext'
import { TourProvider } from '@/contexts/TourContext'
import SettingsButton from '@/components/SettingsButton'
import { AuthStatus } from '@/components/AuthStatus'
import { TourOverlay } from '@/components/tour/TourOverlay'
import { TourTrigger } from '@/components/tour/TourTrigger'
import dynamic from 'next/dynamic'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

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
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${inter.style.fontFamily}, system-ui, sans-serif;
  --font-mono: ${GeistMono.variable};
  background: transparent;
}
        `}</style>
      </head>
      <body className={`${inter.variable} min-h-screen text-white`} style={{ background: 'transparent' }}>
        <OnboardingProvider>
          <TourProvider>
            <VoiceProvider>
              <div className="donna-bg min-h-screen text-white relative">
                <DonnaLightBar />
                <header className="sticky top-0 z-40 w-full border-b border-white/10 glass-dark backdrop-blur">
                  <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                    <div className="text-sm opacity-70">🧠 DONNA</div>
                    <div className="flex items-center gap-3 text-xs opacity-70">
                      <AuthStatus />
                      <VoiceNavButton />
                      <SettingsButton />
                    </div>
                  </div>
                </header>
                <main className="relative z-10">{children}</main>
                {/* Floating DONNA chat widget (client component) */}
                <ChatWidget />
                {/* Settings modal */}
                <SettingsModal />
                {/* Tour system */}
                <TourTrigger />
                <TourOverlay />
                {/* Web vitals tracking */}
                <WebVitalsTracker />
              </div>
            </VoiceProvider>
          </TourProvider>
        </OnboardingProvider>
      </body>
    </html>
  )
}
