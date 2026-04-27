'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAdminSessionValue } from '@/lib/auth'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/admin'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        document.cookie = `admin_session=${getAdminSessionValue()}; path=/; max-age=86400; SameSite=Lax`
        router.push(from)
        router.refresh()
      } else {
        setError('密码错误')
      }
    } catch {
      setError('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl text-white font-serif tracking-widest mb-2">烧师富</h1>
          <p className="text-white/40 font-serif text-sm">管理后台登录</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入管理员密码"
              className="w-full bg-transparent border-b border-white/20 focus:border-white px-0 py-3 text-white outline-none placeholder:text-white/30 font-serif text-center"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-[#c41e3a] text-sm text-center font-serif">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black font-serif tracking-widest hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? '登录中...' : '进入'}
          </button>
        </form>
      </div>
    </div>
  )
}
