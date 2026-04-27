import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: '烧师富 · 板前创作烧鸟',
  description: '烧师富板前创作烧鸟 · 席位预约 · 双塔街道竹辉路168号环宇荟',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://h-qshaoshifuv1.vercel.app'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </body>
    </html>
  )
}
