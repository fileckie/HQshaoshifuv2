'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white px-4">
      <h2 className="text-2xl font-serif mb-4 tracking-wider">出错了</h2>
      <p className="text-white/50 mb-8 text-sm font-serif text-center max-w-md">
        {error.message || '页面加载异常，请稍后重试'}
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-2 bg-white text-black font-serif hover:bg-white/90 transition-colors"
        >
          重试
        </button>
        <Link
          href="/"
          className="px-6 py-2 border border-white/40 text-white font-serif hover:bg-white/10 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  )
}
