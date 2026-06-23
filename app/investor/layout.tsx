import dynamic from 'next/dynamic'
import { InvestorPreviewProvider } from '@/contexts/InvestorPreviewContext'
import { InvestorHeaderToolbar } from '@/features/investor/components/investor-header-toolbar'
import { InvestorWelcomeRestartControl } from '@/features/investor/components/investor-welcome-restart-control'
import InvestorChatbot from '@/features/investor/components/InvestorChatbot'

// Load components client-side only with error handling
const InvestorWelcomeHost = dynamic(
  () =>
    import('@/features/investor/components/investor-welcome-host').then((m) => ({
      default: m.InvestorWelcomeHost,
    })),
  { ssr: false }
)

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <InvestorPreviewProvider>
      <header className="sticky top-0 z-40 w-full shrink-0 border-b border-white/10 glass-dark backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="text-sm opacity-70 shrink-0">🧠 DONNA Investor Mode</div>
            <InvestorWelcomeRestartControl />
          </div>
          <InvestorHeaderToolbar />
        </div>
      </header>
      
      <div className="flex-1 flex flex-col relative">
        {children}
      </div>

      <InvestorWelcomeHost />
      
      {/* Floating DONNA chat widget (investor specific) */}
      <InvestorChatbot />
    </InvestorPreviewProvider>
  )
}
