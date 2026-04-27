import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkAdminCookie } from '@/lib/auth'

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/banquet/:path*',
    '/api/banquets',
    '/api/customers',
    '/api/customers/:path*',
    '/api/products',
    '/api/products/:path*',
    '/api/service/:path*',
    '/api/reminders',
  ],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. 公开 API 放行
  if (
    pathname.startsWith('/api/og') ||
    pathname.startsWith('/api/init') ||
    pathname.startsWith('/api/version') ||
    pathname.startsWith('/api/dashboard') ||
    pathname.startsWith('/api/reminders')
  ) {
    return NextResponse.next()
  }

  // 2. RSVP 公开接口放行（客人提交）
  if (/^\/api\/banquet\/[^/]+\/rsvp/.test(pathname)) {
    return NextResponse.next()
  }

  // 3. API 写操作鉴权
  if (pathname.startsWith('/api/')) {
    const method = request.method
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const authHeader = request.headers.get('authorization')
      const secret = process.env.ADMIN_SECRET
      if (!secret) {
        return NextResponse.json(
          { error: 'ADMIN_SECRET not set' },
          { status: 500 }
        )
      }
      if (!authHeader || authHeader.replace('Bearer ', '').trim() !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    return NextResponse.next()
  }

  // 4. Admin 页面密码保护
  if (pathname.startsWith('/admin')) {
    const secret = process.env.ADMIN_SECRET
    if (!secret) {
      return NextResponse.next()
    }

    if (checkAdminCookie(request)) {
      return NextResponse.next()
    }

    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
