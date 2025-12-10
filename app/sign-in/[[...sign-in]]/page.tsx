export default function Page() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-3">
        <div className="text-sm uppercase tracking-[0.3em] text-white/60">Preview Only</div>
        <h1 className="text-2xl font-semibold">Authentication Disabled</h1>
        <p className="text-white/70">
          This facelift deployment focuses purely on visuals. Sign-in flows and Clerk components
          are intentionally disabled so you can explore the UI without any setup.
        </p>
      </div>
    </div>
  )
}
