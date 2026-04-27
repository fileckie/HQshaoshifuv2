'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Users, Clock, TrendingUp, Bell, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

interface Banquet {
  id: string
  title: string
  time: string
  hostName: string
  roomName: string
  guestCount: number
  customer?: {
    totalVisits: number
  } | null
}

interface TodayData {
  today: {
    date: string
    totalBanquets: number
    totalGuests: number
    occupancyRate: number
  }
  banquets: Banquet[]
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] animate-pulse">
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="h-6 bg-white/10 rounded w-32 mb-2" />
          <div className="h-4 bg-white/5 rounded w-20" />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-lg border border-white/10 p-4">
              <div className="h-4 bg-white/10 rounded w-16 mb-2" />
              <div className="h-8 bg-white/10 rounded w-12" />
            </div>
          ))}
        </div>
        <div className="bg-white/5 rounded-lg border border-white/10 p-6">
          <div className="h-6 bg-white/10 rounded w-40 mb-6" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded mb-4" />
          ))}
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<TodayData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard/today')
        const result = await res.json()
        if (!cancelled && result.success) {
          setData(result.data)
        }
      } catch (error) {
        console.error('Fetch error:', error)
        toast.error('数据加载失败')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [])

  if (loading) return <DashboardSkeleton />
  if (!data) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-serif">
      加载失败，请刷新页面
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium text-white font-serif">今日运营看板</h1>
              <p className="text-sm text-white/40 font-serif">{data.today.date}</p>
            </div>
            <Link href="/admin/list" className="text-sm text-red hover:text-red-light font-serif">
              查看全部 →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* 数据卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-lg border border-white/10 p-4">
            <div className="flex items-center gap-2 text-white/40 mb-2">
              <Calendar className="w-4 h-4 text-red" />
              <span className="text-sm font-serif">今日预订</span>
            </div>
            <div className="text-2xl font-medium text-white font-serif">
              {data.today.totalBanquets} <span className="text-sm text-white/40">场</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg border border-white/10 p-4">
            <div className="flex items-center gap-2 text-white/40 mb-2">
              <Users className="w-4 h-4 text-red" />
              <span className="text-sm font-serif">预计宾客</span>
            </div>
            <div className="text-2xl font-medium text-white font-serif">
              {data.today.totalGuests} <span className="text-sm text-white/40">人</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg border border-white/10 p-4">
            <div className="flex items-center gap-2 text-white/40 mb-2">
              <TrendingUp className="w-4 h-4 text-red" />
              <span className="text-sm font-serif">上座率</span>
            </div>
            <div className="text-2xl font-medium text-white font-serif">
              {data.today.occupancyRate}%
            </div>
          </div>

          <div className="bg-white/5 rounded-lg border border-white/10 p-4">
            <div className="flex items-center gap-2 text-white/40 mb-2">
              <Bell className="w-4 h-4 text-red" />
              <span className="text-sm font-serif">待办提醒</span>
            </div>
            <div className="text-2xl font-medium text-white font-serif">
              0 <span className="text-sm text-white/40">条</span>
            </div>
          </div>
        </div>

        {/* 今日预订时间轴 */}
        <div className="bg-white/5 rounded-lg border border-white/10 p-6">
          <h2 className="font-medium mb-6 flex items-center gap-2 text-white font-serif">
            <Clock className="w-5 h-5 text-red" />
            今日预订时间轴
          </h2>

          {data.banquets.length === 0 ? (
            <div className="text-center py-12 text-white/40 font-serif">
              今日暂无预订
            </div>
          ) : (
            <div className="space-y-4">
              {data.banquets.map((banquet) => (
                <Link
                  key={banquet.id}
                  href={`/admin/list?highlight=${banquet.id}`}
                  className="flex items-center gap-4 p-4 border border-white/10 rounded-lg hover:border-red/50 transition-colors"
                >
                  <div className="w-16 text-center">
                    <div className="text-lg font-medium text-white font-serif">{banquet.time}</div>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white font-serif truncate">{banquet.title}</span>
                      {banquet.customer && banquet.customer.totalVisits >= 2 && (
                        <span className="px-2 py-0.5 bg-red text-white text-xs rounded font-serif shrink-0">
                          回头客
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-white/40 font-serif">
                      {banquet.hostName} · {banquet.roomName} · {banquet.guestCount}人
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
