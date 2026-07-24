// Prefix for root-relative URLs when the app is served under a base path
// (e.g. aidonna.co/demo). Matches next.config.mjs: Vercel production
// defaults to /demo; previews and local dev stay empty unless overridden.
export const BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH ||
  (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? '/demo' : '')

export function withBasePath(path: string): string {
  if (!BASE_PATH) return path
  return `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`
}
