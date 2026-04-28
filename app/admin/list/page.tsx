'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus, Search, Calendar, Users, ChevronRight,
  Trash2, Edit2, Eye, QrCode, Printer,
  TrendingUp, Clock, CheckCircle, XCircle,
  ChevronLeft, Filter, X, Download
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'

interface Banquet {
  id: string
  title: string
  date: string
  time: string
  guestCount: number
  roomName: string
  hostName: string
  status: string
  createdAt: string
  _count: {
    rsvps: number
  }
  rsvps: {
    status: string
    attendeeCount: number
  }[]
  restaurant: {
    name: string
  }
}

interface Stats {
  total: number
  thisMonth: number
  pending: number
  confirmed: number
}

export default function AdminListPage() {
  const [banquets, setBanquets] = useState<Banquet[]>([])
  const [filteredBanquets, setFilteredBanquets] = useState<Banquet[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({ total: 0, thisMonth: 0, pending: 0, confirmed: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // QR Code Modal
  const [showQR, setShowQR] = useState(false)
  const [selectedBanquet, setSelectedBanquet] = useState<Banquet | null>(null)

  // Delete Modal
  const [showDelete, setShowDelete] = useState(false)
  const [deleteId, setDeleteId] = useState('')

  useEffect(() => {
    fetchBanquets()
  }, [])

  useEffect(() => {
    filterBanquets()
  }, [banquets, searchQuery, statusFilter])

  const fetchBanquets = async () => {
    try {
      const response = await fetch('/api/banquets')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setBanquets(data.banquets)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching banquets:', error)
      toast.error('加载宴请列表失败')
    } finally {
      setLoading(false)
    }
  }

  const filterBanquets = () => {
    let filtered = [...banquets]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((b) =>
        b.title.toLowerCase().includes(query) ||
        b.hostName.toLowerCase().includes(query) ||
        b.restaurant.name.toLowerCase().includes(query) ||
        b.roomName.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter)
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setFilteredBanquets(filtered)
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/banquet/${deleteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET || ''}`,
        },
      })
      if (!response.ok) throw new Error('Failed to delete')

      setBanquets(banquets.filter((b) => b.id !== deleteId))
      setShowDelete(false)
      setDeleteId('')
      toast.success('删除成功')
    } catch (error) {
      toast.error('删除失败，请重试')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  const getRSVPCount = (banquet: Banquet) => {
    return (
      banquet.rsvps?.filter((r) => r.status === 'confirmed').reduce((sum, r) => sum + r.attendeeCount, 0) || 0
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 bg-red/20 text-red rounded-full text-xs font-medium font-serif">进行中</span>
      case 'completed':
        return <span className="px-2.5 py-1 bg-white/10 text-white/60 rounded-full text-xs font-medium font-serif">已结束</span>
      case 'cancelled':
        return <span className="px-2.5 py-1 bg-white/5 text-white/40 rounded-full text-xs font-medium font-serif">已取消</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 font-serif">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white/40 hover:text-white">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                <Calendar className="w-4 h-4 text-red" />
              </div>
              <h1 className="text-lg font-bold text-white font-serif">宴请管理</h1>
            </div>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors text-sm font-medium font-serif"
          >
            <Plus className="w-4 h-4" />
            新建宴请
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-red/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-red" />
              </div>
              <span className="text-sm text-white/40 font-serif">总宴请数</span>
            </div>
            <div className="text-2xl font-bold text-white font-serif">{stats.total}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                <TrendingUp className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-sm text-white/40 font-serif">本月</span>
            </div>
            <div className="text-2xl font-bold text-white font-serif">{stats.thisMonth}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                <Clock className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-sm text-white/40 font-serif">待确认</span>
            </div>
            <div className="text-2xl font-bold text-white font-serif">{stats.pending}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                <CheckCircle className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-sm text-white/40 font-serif">已确认</span>
            </div>
            <div className="text-2xl font-bold text-white font-serif">{stats.confirmed}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="搜索宴请主题、主人姓名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-red text-white placeholder:text-white/30 font-serif"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/40" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-red text-white font-serif"
            >
              <option value="all">全部状态</option>
              <option value="active">进行中</option>
              <option value="completed">已结束</option>
              <option value="cancelled">已取消</option>
            </select>
            <button
              onClick={() => {
                const headers = ['主题', '日期', '时间', '主人', '电话', '人数', '席位', '状态']
                const rows = filteredBanquets.map((b) => [
                  b.title,
                  b.date,
                  b.time,
                  b.hostName,
                  '',
                  String(b.guestCount),
                  b.roomName,
                  b.status === 'active' ? '进行中' : b.status === 'completed' ? '已结束' : '已取消',
                ])
                const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
                const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `宴请列表_${new Date().toISOString().split('T')[0]}.csv`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                toast.success('导出成功')
              }}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:border-white/30 transition-colors"
              title="导出 CSV"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Banquet List */}
        {filteredBanquets.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Calendar className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="font-medium text-white mb-2 font-serif">
              {searchQuery || statusFilter !== 'all' ? '没有匹配的宴请' : '还没有宴请记录'}
            </h3>
            <p className="text-sm text-white/40 mb-4 font-serif">
              {searchQuery || statusFilter !== 'all' ? '试试其他搜索条件' : '创建您的第一个宴请邀请函'}
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg hover:bg-white/90 transition-colors text-sm font-serif"
            >
              <Plus className="w-4 h-4" />
              创建宴请
            </Link>
          </div>
        ) : (
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            {filteredBanquets.map((banquet, index) => (
              <div
                key={banquet.id}
                className={`p-6 ${index !== filteredBanquets.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/5 transition-colors`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white font-serif">{banquet.title}</h3>
                      {getStatusBadge(banquet.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/40">
                      <span className="flex items-center gap-1.5 font-serif">
                        <Calendar className="w-4 h-4 text-red" />
                        {formatDate(banquet.date)} {banquet.time}
                      </span>
                      <span className="flex items-center gap-1.5 font-serif">
                        <Users className="w-4 h-4 text-red" />
                        {banquet.guestCount}人 · {banquet.roomName}
                      </span>
                      <span className="font-serif">主人：{banquet.hostName}</span>
                    </div>
                    {banquet.rsvps && banquet.rsvps.length > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-white/40 font-serif">已确认出席：</span>
                        <span className="text-sm font-medium text-red font-serif">
                          {getRSVPCount(banquet)} 人
                        </span>
                        <span className="text-xs text-white/40 font-serif">
                          ({banquet.rsvps.length} 人回复)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedBanquet(banquet)
                        setShowQR(true)
                      }}
                      className="p-2.5 text-white/40 hover:text-red hover:bg-red/10 rounded-lg transition-all"
                      title="查看二维码"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                    <Link
                      href={`/print/${banquet.id}`}
                      target="_blank"
                      className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      title="打印菜单"
                    >
                      <Printer className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/invitation/${banquet.id}`}
                      target="_blank"
                      className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      title="预览"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/admin/edit/${banquet.id}`}
                      className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      title="编辑"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => {
                        setDeleteId(banquet.id)
                        setShowDelete(true)
                      }}
                      className="p-2.5 text-white/40 hover:text-red hover:bg-red/10 rounded-lg transition-all"
                      title="删除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <Link
                      href={`/admin/edit/${banquet.id}`}
                      className="ml-2 px-4 py-2 text-sm font-medium text-white border border-white/10 rounded-lg hover:border-red hover:text-red transition-all font-serif"
                    >
                      管理
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* QR Code Modal */}
      {showQR && selectedBanquet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white font-serif">{selectedBanquet.title}</h3>
              <button onClick={() => setShowQR(false)}>
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white rounded-xl">
                <QRCodeSVG
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/invitation/${selectedBanquet.id}`}
                  size={200}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#0a0a0a"
                />
              </div>
            </div>
            <p className="text-center text-sm text-white/40 mb-4 font-serif">
              微信扫一扫查看邀请函
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/invitation/${selectedBanquet.id}`
                  )
                  toast.success('链接已复制')
                }}
                className="flex-1 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 font-serif"
              >
                复制链接
              </button>
              <Link
                href={`/invitation/${selectedBanquet.id}`}
                target="_blank"
                className="flex-1 py-2.5 border border-white/10 text-white rounded-lg text-sm font-medium text-center hover:border-red font-serif"
              >
                预览
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm border border-white/10">
            <div className="w-12 h-12 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red" />
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2 font-serif">
              确认删除？
            </h3>
            <p className="text-sm text-white/40 text-center mb-6 font-serif">
              删除后将无法恢复，请谨慎操作
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 py-2.5 border border-white/10 text-white/60 rounded-lg text-sm font-medium hover:bg-white/5 font-serif"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red text-white rounded-lg text-sm font-medium hover:bg-red-dark font-serif"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
