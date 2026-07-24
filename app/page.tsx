import { redirect } from 'next/navigation'

// middleware.ts redirects / to /investor, but under a basePath (e.g. /demo)
// the bare basePath URL never reaches middleware, so the root page performs
// the same redirect as a fallback. redirect() prepends the basePath.
export default function Home() {
  redirect('/investor')
}
