import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import '@/styles/donna-theme.css'
import SettingsModal from '@/components/SettingsModal'
import DonnaLightBar from '@/components/DonnaLightBar'
import { VoiceProvider } from '@/components/voice/VoiceProvider'
import { OnboardingProvider } from '@/contexts/OnboardingContext'
import { TourProvider } from '@/contexts/TourContext'
import { DashboardConfigProvider } from '@/contexts/DashboardConfigContext'
import { Toaster } from '@/components/ui/toaster'
import dynamic from 'next/dynamic'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Load tour system client-side only (they use hooks that require client context)
const TourSystem = dynamic(() => import('@/components/tour/TourSystem'), { ssr: false })

const WebVitalsTracker = dynamic(() => import('./web-vitals').then(mod => {
  // Only call initWebVitals if it exists and we're in browser
  if (typeof window !== 'undefined' && typeof mod.initWebVitals === 'function') {
    try {
      mod.initWebVitals()
    } catch (error) {
      console.warn('Web vitals initialization failed:', error)
    }
  }
  return { default: () => null }
}).catch(() => ({
  default: () => null
})), { ssr: false })

export const metadata: Metadata = {
  title: 'DONNA - AI Assistant Platform',
  description: 'AI-powered business tools for sales, marketing, and productivity',
  generator: 'DONNA',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.svg" />
        <style dangerouslySetInnerHTML={{
          __html: `html {
  font-family: ${inter.style.fontFamily}, system-ui, sans-serif;
  --font-mono: ${GeistMono.variable};
  background: transparent;
}`
        }} />
      </head>
      <body className={`${inter.variable} min-h-screen text-white`} style={{ background: 'transparent' }}>
        <OnboardingProvider>
          <TourProvider>
            <DashboardConfigProvider>
              <VoiceProvider>
                <div className="donna-bg min-h-screen text-white relative">
                  {/* Single direct child so .donna-bg > * does not force position:relative on fixed overlays */}
                  <div className="relative z-[1] flex min-h-screen flex-col">
                    <DonnaLightBar />
                    <main className="relative z-10 flex min-h-0 flex-1 flex-col">
                      {children}
                    </main>
                    {/* Settings modal */}
                    <SettingsModal />
                    {/* Tour system */}
                    <TourSystem />
                    {/* Web vitals tracking */}
                    <WebVitalsTracker />
                    {/* Toast notifications */}
                    <Toaster />
                  </div>
                </div>
              </VoiceProvider>
            </DashboardConfigProvider>
          </TourProvider>
        </OnboardingProvider>
      </body>
    </html>
  )
}
