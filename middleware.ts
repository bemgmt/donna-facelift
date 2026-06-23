import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()

  // Redirect root to /investor
  if (url.pathname === '/') {
    url.pathname = '/investor'
    return NextResponse.redirect(url)
  }

  // Basic mode protection based on pathname
  // This can be expanded to check cookies/sessions for specific UserMode
  const isDriveRoute = url.pathname.startsWith('/drive')
  const isInvestorRoute = url.pathname.startsWith('/investor')

  // Example: If we had a userMode cookie, we could check it here:
  // const userMode = request.cookies.get('user_mode')?.value
  // if (isDriveRoute && userMode === 'investor') return NextResponse.redirect('/investor')
  // if (isInvestorRoute && userMode === 'drive') return NextResponse.redirect('/drive')

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}