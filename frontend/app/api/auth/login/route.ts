import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  const validUser = process.env.ADMIN_USERNAME ?? 'admin'
  const validPass = process.env.ADMIN_PASSWORD ?? ''
  const secret = process.env.AUTH_SECRET ?? ''

  if (username !== validUser || password !== validPass) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const sessionValue = Buffer.from(secret).toString('base64')
  cookies().set('session', sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8
  })

  return NextResponse.json({ success: true })
}
