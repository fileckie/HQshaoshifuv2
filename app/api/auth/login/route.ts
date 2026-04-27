import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const secret = process.env.ADMIN_SECRET

    if (!secret) {
      return NextResponse.json({ error: 'ADMIN_SECRET not configured' }, { status: 500 })
    }

    if (password === secret) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
