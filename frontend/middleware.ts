import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { readSession } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith('/api/')

  // Public booking routes need no key on the backend, so none is added here
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/public/')) return NextResponse.next()

  const session = await readSession(request.cookies.get('session')?.value)
  if (!session) {
    if (isApi) return NextResponse.json({ detail: 'Please log in again' }, { status: 401 })
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname.startsWith('/staff') && session.role !== 'Boss') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!isApi) return NextResponse.next()

  // The backend only answers requests carrying this key, so it never reaches the browser
  const headers = new Headers(request.headers)
  headers.set('x-api-key', process.env.API_KEY ?? '')
  headers.set('x-staff-id', String(session.id))
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/dashboard/:path*', '/crm/:path*', '/hotel/:path*', '/clinic/:path*', '/staff/:path*', '/api/:path*']
}
