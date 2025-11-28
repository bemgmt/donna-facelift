import { currentUser } from '@clerk/nextjs/server'

export default async function ProtectedPage() {
  const user = await currentUser()
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">Protected</h1>
      <pre className="text-xs opacity-80 bg-neutral-900 p-4 rounded">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  )
}

