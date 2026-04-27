// 简单的管理员鉴权 —— 基于环境变量密码
// 生产环境建议接入 NextAuth / Auth.js 或 Vercel 的 Basic Auth

export function isAdmin(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  const token = authHeader.replace('Bearer ', '').trim()
  return token === process.env.ADMIN_SECRET
}

export function requireAdmin(request: Request): Response | null {
  if (!isAdmin(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return null
}

// 用于 Middleware 的简易匹配
export function checkAdminCookie(req: { cookies: { get: (name: string) => { value?: string } | undefined } }): boolean {
  const cookie = req.cookies.get('admin_session')
  if (!cookie?.value) return false
  return cookie.value === hashSecret(process.env.ADMIN_SECRET || '')
}

function hashSecret(secret: string): string {
  // 极简单的 hash，仅用于避免明文传输密码
  let hash = 0
  for (let i = 0; i < secret.length; i++) {
    const char = secret.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return 'ssf_' + Math.abs(hash).toString(16)
}

export function getAdminSessionValue(): string {
  return hashSecret(process.env.ADMIN_SECRET || '')
}
