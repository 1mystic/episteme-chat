// proxy.ts (Next.js 16+ — replaces middleware.ts)

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/session']
const AUTH_PREFIXES = ['/login']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasAuth = request.cookies.has('ep-auth')

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PREFIXES.some((p) => pathname.startsWith(p))

  if (isProtected && !hasAuth) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthPage && hasAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect authenticated users from landing page to dashboard
  if (pathname === '/' && hasAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/session/:path*', '/login', '/'],
}
