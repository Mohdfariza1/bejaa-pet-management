import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith('/api/')

  if (pathname.startsWith('/api/auth/')) return NextResponse.next()

  if (!pathname.startsWith('/api/public/')) {
    const session = request.cookies.get('session')?.value
    const secret = process.env.AUTH_SECRET ?? ''
    const expected = Buffer.from(secret).toString('base64')

    if (!secret || !session || session !== expected) {
      if (isApi) return NextResponse.json({ detail: 'Please log in again' }, { status: 401 })
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (!isApi) return NextResponse.next()

  // The backend only answers requests carrying this key, so it never reaches the browser
  const headers = new Headers(request.headers)
  headers.set('x-api-key', process.env.API_KEY ?? '')
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/dashboard/:path*', '/crm/:path*', '/hotel/:path*', '/clinic/:path*', '/api/:path*']
}
