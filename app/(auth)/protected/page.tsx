import { currentUser } from '@/lib/preview-auth'

export default async function ProtectedPage() {
  const user = await currentUser()
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Protected Area Preview</h1>
      <p className="text-white/70">
        Authentication is disabled in this facelift build, so no user context is available. When the
        full backend is connected this page will show the signed-in user object. For now you can
        still review the styles and layout.
      </p>
      <pre className="text-xs opacity-80 bg-neutral-900 p-4 rounded">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  )
}

