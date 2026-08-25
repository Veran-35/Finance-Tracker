import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/app/lib/supabase/proxy'

// Routes that require authentication
const protectedRoutes = ['/dashboard']

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login']

export async function proxy(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request)

  const path = request.nextUrl.pathname

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(route + '/')
  )

  // Check if the current path is an auth route (login/register)
  const isAuthRoute = authRoutes.some(
    (route) => path === route || path.startsWith(route + '/')
  )

  // If user is NOT authenticated and trying to access protected route → redirect to login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user IS authenticated and trying to access auth routes → redirect to dashboard
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

// Only run proxy on relevant routes, exclude static assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
