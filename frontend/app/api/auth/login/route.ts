import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { signSession, SESSION_HOURS, Session } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  let res: Response
  try {
    res = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:8000'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.API_KEY ?? '' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    })
  } catch {
    return NextResponse.json({ error: 'The system is starting up. Please try again in a minute.' }, { status: 503 })
  }

  if (res.status === 401) {
    return NextResponse.json({ error: 'Wrong username or password.' }, { status: 401 })
  }
  if (!res.ok) {
    return NextResponse.json({ error: 'The system is starting up. Please try again in a minute.' }, { status: 503 })
  }

  const staff: { id: number; name: string; role: Session['role'] } = await res.json()
  cookies().set('session', await signSession({ id: staff.id, name: staff.name, role: staff.role }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * SESSION_HOURS
  })

  return NextResponse.json({ success: true })
}
