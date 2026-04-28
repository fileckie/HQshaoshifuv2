'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, Loader2, MapPin, LayoutGrid, ArrowLeft, User, Star } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  RESTAURANT,
  TIME_OPTIONS,
  ROOM_OPTIONS,
  BOOKING_CHANNELS,
  generateDates,
} from '@/lib/config'

interface FormData {
  title: string
  hostName: string
  hostPhone: string
  date: string
  time: string
  roomName: string
  guestCount: number
  menu: { name: string; desc: string }[]
  note: string
  bookingChannel: string
  paymentStatus: string
  dietaryRestrictions: string
  prepReminder: string
  handoverNotes: string
}

const DRAFT_KEY = 'shaoshifu_admin_draft'

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'guest' | 'booking' | 'internal'>('guest')

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      bookingChannel: 'wechat',
      paymentStatus: 'pay_on_arrival',
      menu: [
        { name: '', desc: '主厨限定串' },
        { name: '', desc: '当季时令烧鸟' },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'menu' })
  const selectedTime = watch('time')
  const selectedDate = watch('date')
  const selectedRoom = watch('roomName')
  const selectedChannel = watch('bookingChannel')
  const selectedPayment = watch('paymentStatus')
  const guestCount = watch('guestCount')
  const hostPhoneValue = watch('hostPhone')
  const dates = generateDates(90)

  // 客户自动识别
  const [customerInfo, setCustomerInfo] = useState<{
    exists: boolean
    isReturnCustomer?: boolean
    name?: string
    totalVisits?: number
    tags?: string[]
    preferences?: { type: string; content: string }[]
  } | null>(null)
  const [checkingCustomer, setCheckingCustomer] = useState(false)

  const checkCustomer = useCallback(async (phone: string) => {
    if (!phone || phone.length < 7) {
      setCustomerInfo(null)
      return
    }
    setCheckingCustomer(true)
    try {
      const res = await fetch(`/api/customers/by-phone?phone=${encodeURIComponent(phone)}`)
      const result = await res.json()
      if (result.success && result.exists) {
        setCustomerInfo({
          exists: true,
          isReturnCustomer: result.isReturnCustomer,
          name: result.customer.name,
          totalVisits: result.customer.totalVisits,
          tags: result.customer.tags || [],
          preferences: result.customer.preferences || [],
        })
      } else {
        setCustomerInfo({ exists: false })
      }
    } catch {
      setCustomerInfo(null)
    } finally {
      setCheckingCustomer(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hostPhoneValue) checkCustomer(hostPhoneValue)
    }, 500)
    return () => clearTimeout(timer)
  }, [hostPhoneValue, checkCustomer])

  // 加载草稿
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY)
      if (draft) {
        const parsed = JSON.parse(draft)
        Object.keys(parsed).forEach((key) => {
          setValue(key as keyof FormData, parsed[key])
        })
        toast.info('已恢复上次未提交的草稿')
      }
    } catch {
      // ignore
    }
  }, [setValue])

  // 自动保存草稿
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(value))
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')

    try {
      const processedMenu = data.menu.map((item, index) => ({
        ...item,
        name:
          item.name ||
          (index === 0 ? '主厨限定串' : index === 1 ? '当季时令烧鸟' : ''),
        desc: item.desc || '',
      }))

      const res = await fetch('/api/banquet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET || ''}`,
        },
        body: JSON.stringify({
          ...data,
          menu: processedMenu,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '创建失败')
      }

      const result = await res.json()
      localStorage.removeItem(DRAFT_KEY)
      toast.success('邀约卡创建成功')
      router.push(`/invitation/${result.id}`)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    reset()
    localStorage.removeItem(DRAFT_KEY)
    setActiveTab('guest')
    toast.info('表单已重置')
  }

  const quickSetGuestCount = (count: number) => {
    setValue('guestCount', count)
  }

  return (
    <div className="min-h-screen bg-black py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 返回首页 */}
        <div className="mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-serif">返回首页</span>
          </Link>
        </div>

        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl text-white mb-2 tracking-wider font-serif">
            预约管理
          </h1>
          <p className="text-white/50 font-serif">
            {RESTAURANT.name} · {RESTAURANT.tagline}
          </p>
        </div>

        {/* 顶部操作栏 */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/admin/map"
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm"
          >
            <LayoutGrid className="w-4 h-4" />
            座位平面图
          </Link>
          <button
            onClick={handleReset}
            className="text-white/40 hover:text-white/60 text-sm"
          >
            重置表单
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red/30 bg-red/5 text-red font-serif">
            {error}
          </div>
        )}

        {/* 标签导航 */}
        <div className="flex border-b border-white/10 mb-6">
          {[
            { key: 'guest', label: '客人信息' },
            { key: 'booking', label: '预订详情' },
            { key: 'internal', label: '内部管理' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-3 text-sm tracking-wider font-serif ${
                activeTab === tab.key
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* 客人信息 */}
          {activeTab === 'guest' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-white/60 text-sm mb-2 font-serif">
                  主题（选填）
                </label>
                <input
                  type="text"
                  {...register('title')}
                  placeholder="如：朋友聚餐、商务宴请..."
                  className="w-full bg-transparent border-b border-white/20 focus:border-white px-0 py-3 text-white outline-none placeholder:text-white/30 font-serif"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2 font-serif">
                  组局人姓名 <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  {...register('hostName', { required: '请输入组局人姓名' })}
                  className="w-full bg-transparent border-b border-white/20 focus:border-white px-0 py-3 text-white outline-none font-serif"
                />
                {errors.hostName && (
                  <p className="mt-2 text-red text-sm">{errors.hostName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2 font-serif">
                  联系电话
                </label>
                <input
                  type="tel"
                  {...register('hostPhone')}
                  placeholder={RESTAURANT.phone}
                  className="w-full bg-transparent border-b border-white/20 focus:border-white px-0 py-3 text-white outline-none placeholder:text-white/30 font-serif"
                />
                {checkingCustomer && (
                  <p className="mt-2 text-white/30 text-xs font-serif">查询客户档案中...</p>
                )}
                {customerInfo && (
                  <div className={`mt-3 p-3 border rounded text-sm font-serif ${
                    customerInfo.exists
                      ? 'border-red/20 bg-red/5 text-red'
                      : 'border-white/10 bg-white/5 text-white/50'
                  }`}>
                    {customerInfo.exists ? (
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{customerInfo.name}</span>
                            {customerInfo.isReturnCustomer && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red text-white text-xs rounded">
                                <Star className="w-3 h-3" />
                                回头客
                              </span>
                            )}
                          </div>
                          <div className="text-white/60 text-xs mt-1">
                            第 {customerInfo.totalVisits} 次到店
                            {customerInfo.preferences && customerInfo.preferences.length > 0 && (
                              <span> · 偏好：{customerInfo.preferences.map(p => p.content).join('、')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span>新客户，提交后将自动创建客户档案</span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('booking')}
                  className="w-full py-4 bg-white text-black text-lg tracking-widest hover:bg-white/90 font-serif"
                >
                  下一步：预订详情
                </button>
              </div>
            </div>
          )}

          {/* 预订详情 */}
          {activeTab === 'booking' && (
            <div className="space-y-6 animate-fadeIn">
              {/* 日期 */}
              <div>
                <label className="block text-white/60 text-sm mb-3 font-serif">
                  日期 <span className="text-red">*</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
                  {dates.map((date) => (
                    <button
                      key={date.value}
                      type="button"
                      onClick={() => setValue('date', date.value)}
                      className={`py-2 sm:py-3 border text-center ${
                        selectedDate === date.value
                          ? 'bg-white border-white text-black'
                          : 'border-white/20 text-white/60 hover:border-white/40'
                      } ${date.isToday ? 'ring-1 ring-red/50' : ''}`}
                    >
                      <div className="text-xs sm:text-sm font-serif">{date.label}</div>
                      <div className="text-[10px] sm:text-xs mt-1 opacity-70 font-serif">
                        {date.week}
                        {date.isToday ? '·今天' : ''}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.date && (
                  <p className="mt-2 text-red text-sm">{errors.date.message}</p>
                )}
              </div>

              {/* 时间 */}
              <div>
                <label className="block text-white/60 text-sm mb-3 font-serif">
                  时间 <span className="text-red">*</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {TIME_OPTIONS.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setValue('time', time)}
                      className={`px-4 py-3 border font-serif ${
                        selectedTime === time
                          ? 'bg-white border-white text-black'
                          : 'border-white/20 text-white/60 hover:border-white/40'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                {errors.time && (
                  <p className="mt-2 text-red text-sm">{errors.time.message}</p>
                )}
              </div>

              {/* 席位类型 */}
              <div>
                <label className="block text-white/60 text-sm mb-3 font-serif">
                  席位类型 <span className="text-red">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ROOM_OPTIONS.map((room) => (
                    <button
                      key={room.value}
                      type="button"
                      onClick={() => setValue('roomName', room.value)}
                      className={`p-4 border text-left ${
                        selectedRoom === room.value
                          ? 'bg-white border-white text-black'
                          : 'border-white/20 text-white/60 hover:border-white/40'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-base font-serif">{room.label}</span>
                        <span
                          className={`text-xs ${
                            selectedRoom === room.value
                              ? 'text-black/50'
                              : 'text-white/40'
                          }`}
                        >
                          {room.capacity}
                        </span>
                      </div>
                      <div
                        className={`text-xs ${
                          selectedRoom === room.value
                            ? 'text-black/40'
                            : 'text-white/30'
                        }`}
                      >
                        {room.desc}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.roomName && (
                  <p className="mt-2 text-red text-sm">{errors.roomName.message}</p>
                )}
              </div>

              {/* 人数 */}
              <div>
                <label className="block text-white/60 text-sm mb-3 font-serif">
                  人数 <span className="text-red">*</span>
                </label>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {[1, 2, 4, 6, 8, 12].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => quickSetGuestCount(count)}
                      className={`px-4 py-2 border font-serif ${
                        Number(guestCount) === count
                          ? 'bg-white border-white text-black'
                          : 'border-white/20 text-white/60 hover:border-white/40'
                      }`}
                    >
                      {count}人
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  {...register('guestCount', {
                    required: '请输入人数',
                    valueAsNumber: true,
                    min: { value: 1, message: '至少1人' },
                  })}
                  className="w-full bg-transparent border-b border-white/20 focus:border-white px-0 py-3 text-white outline-none font-serif"
                />
                {errors.guestCount && (
                  <p className="mt-2 text-red text-sm">
                    {errors.guestCount.message}
                  </p>
                )}
              </div>

              {/* 今日炭火料理推荐 */}
              <div className="pt-6 border-t border-white/10">
                <label className="block text-white/60 text-sm mb-4 font-serif">
                  今日炭火料理推荐
                </label>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-4 border border-white/10 bg-white/5"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/40 text-xs">
                          {index === 0
                            ? '主厨限定串'
                            : index === 1
                            ? '当季时令烧鸟'
                            : `菜品 ${index + 1}`}
                        </span>
                        {index >= 2 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-white/30 hover:text-red"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <input
                          {...register(`menu.${index}.name` as const)}
                          placeholder={
                            index === 0
                              ? '请输入主厨限定串名称'
                              : index === 1
                              ? '请输入当季时令烧鸟名称'
                              : '菜品名称'
                          }
                          className="flex-1 bg-transparent border-b border-white/20 focus:border-white px-0 py-2 text-white text-sm outline-none placeholder:text-white/20 font-serif"
                        />
                        <span className="text-white/20 text-sm pt-2">_____</span>
                      </div>
                      <p className="text-white/30 text-xs mt-2">店长填写栏位</p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => append({ name: '', desc: '' })}
                  className="mt-4 flex items-center gap-2 text-white/50 text-sm hover:text-white font-serif"
                >
                  <Plus className="w-4 h-4" />
                  添加菜品
                </button>
              </div>

              {/* 按钮 */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('guest')}
                  className="flex-1 py-4 border border-white/40 text-white text-lg tracking-widest hover:bg-white/5 font-serif"
                >
                  上一步
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('internal')}
                  className="flex-1 py-4 bg-white text-black text-lg tracking-widest hover:bg-white/90 font-serif"
                >
                  下一步：内部管理
                </button>
              </div>
            </div>
          )}

          {/* 内部管理 */}
          {activeTab === 'internal' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 border border-red/20 bg-red/5 mb-6">
                <p className="text-red text-sm font-serif">
                  以下内容仅在员工版显示，客人不可见
                </p>
              </div>

              {/* 预订渠道 */}
              <div>
                <label className="block text-white/60 text-sm mb-3 font-serif">
                  预订渠道
                </label>
                <div className="flex gap-2 flex-wrap">
                  {BOOKING_CHANNELS.map((channel) => (
                    <button
                      key={channel.value}
                      type="button"
                      onClick={() => setValue('bookingChannel', channel.value)}
                      className={`flex-1 py-3 border font-serif min-w-[60px] ${
                        selectedChannel === channel.value
                          ? 'bg-white border-white text-black'
                          : 'border-white/20 text-white/60 hover:border-white/40'
                      }`}
                    >
                      {channel.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 付款状态 */}
              <div>
                <label className="block text-white/60 text-sm mb-3 font-serif">
                  付款状态
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'prepaid', label: '已预付' },
                    { value: 'pay_on_arrival', label: '到店付款' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('paymentStatus', opt.value)}
                      className={`flex-1 py-3 border font-serif ${
                        selectedPayment === opt.value
                          ? 'bg-white border-white text-black'
                          : 'border-white/20 text-white/60 hover:border-white/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 饮食禁忌 */}
              <div>
                <label className="block text-white/60 text-sm mb-2 font-serif">
                  饮食禁忌 / 过敏信息
                </label>
                <textarea
                  {...register('dietaryRestrictions')}
                  rows={2}
                  placeholder="如：海鲜过敏、不吃香菜等"
                  className="w-full bg-transparent border border-white/20 focus:border-white p-3 text-white outline-none text-sm resize-none font-serif"
                />
              </div>

              {/* 备餐提醒 */}
              <div>
                <label className="block text-white/60 text-sm mb-2 font-serif">
                  备餐提醒
                </label>
                <textarea
                  {...register('prepReminder')}
                  rows={2}
                  placeholder="需要提前准备的特殊要求..."
                  className="w-full bg-transparent border border-white/20 focus:border-white p-3 text-white outline-none text-sm resize-none font-serif"
                />
              </div>

              {/* 交接备注 */}
              <div>
                <label className="block text-white/60 text-sm mb-2 font-serif">
                  服务员交接备注
                </label>
                <textarea
                  {...register('handoverNotes')}
                  rows={2}
                  placeholder="班次交接需要注意的事项..."
                  className="w-full bg-transparent border border-white/20 focus:border-white p-3 text-white outline-none text-sm resize-none font-serif"
                />
              </div>

              {/* 客人可见备注 */}
              <div className="pt-6 border-t border-white/10">
                <label className="block text-white/60 text-sm mb-2 font-serif">
                  客人可见备注（会显示在邀请函上）
                </label>
                <textarea
                  {...register('note')}
                  rows={2}
                  placeholder="会显示在邀请函上的备注..."
                  className="w-full bg-transparent border border-white/20 focus:border-white p-3 text-white outline-none text-sm resize-none font-serif"
                />
              </div>

              {/* 门店信息 */}
              <div className="py-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/40 text-sm mb-2 font-serif">
                  <MapPin className="w-4 h-4" />
                  门店信息
                </div>
                <p className="text-white/40 text-sm leading-relaxed font-serif">
                  {RESTAURANT.address}
                </p>
                <p className="text-white/30 text-xs mt-2 leading-relaxed font-serif">
                  {RESTAURANT.addressGuide}
                </p>
                <p className="text-white/50 text-base mt-3 font-serif">
                  {RESTAURANT.phone}
                </p>
              </div>

              {/* 按钮 */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('booking')}
                  className="flex-1 py-4 border border-white/40 text-white text-lg tracking-widest hover:bg-white/5 font-serif"
                >
                  上一步
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-white text-black text-lg tracking-widest hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-serif"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    '创建邀约卡'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* 底部链接 */}
        <div className="mt-12 text-center space-y-4">
          <Link
            href="/admin/products"
            className="block text-white/50 hover:text-white text-sm font-serif"
          >
            管理今日推荐产品 →
          </Link>
          <Link
            href="/admin/map"
            className="block text-white/50 hover:text-white text-sm font-serif"
          >
            查看座位平面图 →
          </Link>
          <Link
            href="/"
            className="block text-white/30 hover:text-white/50 text-sm font-serif"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
