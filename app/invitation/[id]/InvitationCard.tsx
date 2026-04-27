'use client'

import { useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Download, MapPin, Phone, Printer, ArrowLeft, Share2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { RESTAURANT, BRAND_STORY } from '@/lib/config'

interface BanquetData {
  id: string
  title: string
  date: string
  time: string
  guestCount: number
  roomName: string
  hostName: string
  hostPhone: string
  note?: string
  menu: string | { name: string; desc: string }[]
  restaurant: {
    name: string
    address: string
    phone: string
  }
}

export default function InvitationCard({ data }: { data: BanquetData }) {
  const params = useParams()
  const router = useRouter()
  const [exporting, setExporting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // 解析菜单
  const menuItems =
    typeof data.menu === 'string'
      ? (JSON.parse(data.menu || '[]') as { name: string; desc: string }[])
      : data.menu || []

  // 导出图片
  const exportCard = useCallback(async () => {
    if (!cardRef.current) {
      toast.error('卡片未加载完成，请稍后再试')
      return
    }

    setExporting(true)

    try {
      const domtoimage = await import('dom-to-image-more')
      const element = cardRef.current
      const originalBg = element.style.backgroundColor
      element.style.backgroundColor = '#0a0a0a'
      await document.fonts.ready

      const dataUrl = await domtoimage.toJpeg(element, {
        quality: 0.95,
        pixelRatio: 2,
        bgcolor: '#0a0a0a',
        style: { backgroundColor: '#0a0a0a' },
        filter: (node: Node) => {
          const el = node as HTMLElement
          if (el.classList?.contains('no-print')) return false
          return true
        },
      })

      element.style.backgroundColor = originalBg
      const link = document.createElement('a')
      link.download = `烧师富_${data.hostName || '邀约'}_${Date.now()}.jpg`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      setTimeout(() => document.body.removeChild(link), 100)
      toast.success('图片已保存')
    } catch (error) {
      console.error('导出失败:', error)
      toast.error('导出失败，请尝试浏览器截图')
    } finally {
      setExporting(false)
    }
  }, [data.hostName])

  // 打印
  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') window.print()
  }, [])

  // 分享
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `烧师富预约 - ${data.hostName}`,
          text: `您有一张烧师富预约邀请函，日期：${data.date} ${data.time}`,
          url: window.location.href,
        })
      } catch {
        // 用户取消
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('链接已复制到剪贴板')
    }
  }, [data])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return { month: '--', day: '--' }
    try {
      const [_, month, day] = dateStr.split('-').map(Number)
      return { month, day }
    } catch {
      return { month: '--', day: '--' }
    }
  }

  const dateInfo = formatDate(data.date)

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      {/* 顶部导航栏 */}
      <div className="max-w-sm mx-auto mb-6 flex items-center justify-between no-print">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-serif">返回</span>
        </button>
        <h1 className="text-white/80 text-lg font-serif">邀约卡</h1>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* 操作按钮 */}
      <div className="max-w-sm mx-auto mb-8 flex flex-wrap gap-2 no-print">
        <Link
          href={`/print/${params.id}?type=table`}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-black text-sm hover:bg-white/90 min-w-[80px]"
        >
          <Printer className="w-4 h-4" />
          桌上版
        </Link>
        <Link
          href={`/print/${params.id}?type=staff`}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-black text-sm hover:bg-white/90 min-w-[80px]"
        >
          <Printer className="w-4 h-4" />
          员工版
        </Link>
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-white/40 text-white text-sm hover:bg-white/10 min-w-[80px]"
        >
          <Printer className="w-4 h-4" />
          打印
        </button>
        <button
          onClick={exportCard}
          disabled={exporting}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-white/40 text-white text-sm hover:bg-white/10 disabled:opacity-50 min-w-[80px]"
        >
          <Download className="w-4 h-4" />
          {exporting ? '导出中...' : '保存JPG'}
        </button>
      </div>

      {/* 邀约卡 */}
      <div
        ref={cardRef}
        id="invitation-card"
        className="max-w-sm mx-auto bg-black"
        style={{
          backgroundColor: '#0a0a0a',
          border: '2px solid rgba(255,255,255,0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="h-2 bg-red" />

        <div className="p-8" style={{ backgroundColor: '#0a0a0a' }}>
          {/* Logo */}
          <div className="text-center mb-8" style={{ backgroundColor: '#0a0a0a' }}>
            <h1 className="text-5xl sm:text-6xl text-white mb-4 tracking-widest font-serif font-bold">
              {RESTAURANT.name}
            </h1>

            <div className="flex items-center justify-center gap-2 mb-4">
              {RESTAURANT.tagline.split('').map((char, i) => (
                <div
                  key={i}
                  className="w-7 h-7 sm:w-8 sm:h-8 border border-red rounded-full flex items-center justify-center"
                >
                  <span className="text-red text-xs font-serif">{char}</span>
                </div>
              ))}
            </div>

            <p className="text-lg sm:text-xl text-white/60 tracking-[0.2em] font-serif">
              {RESTAURANT.subTagline}
            </p>
          </div>

          {/* 品牌关键词 */}
          <div className="flex justify-center gap-3 sm:gap-4 mb-8 py-4 border-y border-white/10">
            {RESTAURANT.brandKeywords.map((keyword, i) => (
              <div key={i} className="text-center">
                <div className="text-white/80 text-xs tracking-widest font-serif">
                  {keyword.text}
                </div>
                <div className="text-white/30 text-[8px] mt-1 tracking-wider">
                  {keyword.desc}
                </div>
              </div>
            ))}
          </div>

          {/* 日期 */}
          <div className="text-center mb-8 py-6 border-y border-white/20">
            <div className="text-4xl sm:text-5xl text-white mb-2 tracking-wider font-serif font-bold">
              {dateInfo.month}月{dateInfo.day}日
            </div>
            <div className="text-lg text-white/50 tracking-widest font-serif">
              {data.time} · {data.roomName}
            </div>
          </div>

          {/* 信息 */}
          <div className="space-y-3 mb-8 text-base font-serif">
            <div className="flex justify-between text-white">
              <span className="text-white/50">人数</span>
              <span>{data.guestCount}位</span>
            </div>
            <div className="flex justify-between text-white">
              <span className="text-white/50">组局</span>
              <span>{data.hostName}</span>
            </div>
            {data.title && data.title !== '邀请函' && (
              <div className="flex justify-between text-white">
                <span className="text-white/50">主题</span>
                <span>{data.title}</span>
              </div>
            )}
          </div>

          {/* 今日推荐 */}
          <div className="mb-8">
            <h2 className="text-lg text-white mb-6 text-center tracking-[0.15em] font-serif">
              今日推荐
            </h2>
            <div className="space-y-6 font-serif">
              <div className="text-center">
                <div className="text-white text-base mb-1">
                  {menuItems[0]?.name || '主厨限定串'}
                </div>
                <div className="text-white/40 text-xs">
                  {menuItems[0]?.desc || '主厨当日精选部位创作'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-white text-base mb-1">
                  {menuItems[1]?.name || '当季时令烧鸟'}
                </div>
                <div className="text-white/40 text-xs">
                  {menuItems[1]?.desc || '根据当日食材新鲜度呈现'}
                </div>
              </div>
            </div>
          </div>

          {/* 地址 */}
          <div className="pt-6 border-t border-white/20 mb-6">
            <div className="flex items-start gap-2 text-xs text-white/50 mb-3 font-serif">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="mb-1">{data.restaurant?.address || RESTAURANT.address}</p>
                <p className="text-white/30 leading-relaxed">{RESTAURANT.addressGuide}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-base text-white/60 font-serif">
              <Phone className="w-4 h-4" />
              <span>{data.restaurant?.phone || RESTAURANT.phone}</span>
            </div>
          </div>

          {/* 品牌故事 */}
          <div className="pt-6 border-t border-white/10">
            <h2 className="text-lg text-white mb-4 text-center tracking-[0.2em] font-serif">
              关于烧师富
            </h2>
            <div className="text-sm text-white/50 leading-relaxed text-center space-y-3 font-serif">
              {BRAND_STORY.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* 氛围文案 */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/60 text-sm leading-relaxed font-serif">
              不只是一家烧鸟店
            </p>
            <p className="text-white/40 text-xs mt-2 italic font-serif">
              更是&quot;烧鸟料理的创作道场&quot;
            </p>
          </div>
        </div>

        <div className="h-2 bg-red" />
      </div>

      <p className="text-center text-xs text-white/20 mt-8 no-print font-serif">
        长按保存图片或点击上方按钮
      </p>
    </div>
  )
}
