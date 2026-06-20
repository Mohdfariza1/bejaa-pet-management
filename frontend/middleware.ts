import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  const secret = process.env.AUTH_SECRET ?? ''
  const expected = Buffer.from(secret).toString('base64')

  if (!session || session !== expected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/crm/:path*', '/hotel/:path*', '/clinic/:path*']
}
