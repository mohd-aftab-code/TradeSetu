import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected)
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || path.startsWith('/auth')

  // Get the token and user data from cookies
  const token = request.cookies.get('userToken')?.value || ''
  const userDataCookie = request.cookies.get('userData')?.value || ''

  // Parse user data to get role
  let userRole = 'USER'
  if (userDataCookie) {
    try {
      const userData = JSON.parse(userDataCookie)
      userRole = userData.role || 'USER'
    } catch (error) {
      console.error('Error parsing user data from cookie:', error)
    }
  }

  // Redirect to login if accessing protected route without token
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Role-based access control for dashboards
  if (token && userDataCookie) {
    // Admin dashboard access control
    if (path.startsWith('/admin') && userRole !== 'ADMIN') {
      // Redirect non-admin users to their appropriate dashboard
      if (userRole === 'SALES_EXECUTIVE') {
        return NextResponse.redirect(new URL('/sales-dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Sales executive dashboard access control
    if (path.startsWith('/sales-dashboard') && userRole !== 'SALES_EXECUTIVE') {
      // Redirect non-sales users to their appropriate dashboard
      if (userRole === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Regular user dashboard access control
    if (path === '/dashboard' && userRole !== 'USER') {
      // Redirect non-regular users to their appropriate dashboard
      if (userRole === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else if (userRole === 'SALES_EXECUTIVE') {
        return NextResponse.redirect(new URL('/sales-dashboard', request.url))
      }
    }
  }

  // Redirect to appropriate dashboard if accessing auth pages with token
  if (isPublicPath && token && path !== '/') {
    // Redirect based on user role
    if (userRole === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url))
    } else if (userRole === 'SALES_EXECUTIVE') {
      return NextResponse.redirect(new URL('/sales-dashboard', request.url))
    } else {
    return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 