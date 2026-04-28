import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0]

    const todayBanquets = await prisma.banquet.findMany({
      where: {
        date: today,
        status: { not: 'cancelled' },
      },
      include: {
        restaurant: true,
        customer: true,
        _count: { select: { rsvps: true } },
      },
      orderBy: { time: 'asc' },
    })

    // 计算总座位容量（所有可用桌位）
    const tables = await prisma.table.findMany({
      select: { capacity: true },
    })
    const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0) || 16 // 兜底

    const totalGuests = todayBanquets.reduce((sum, b) => sum + b.guestCount, 0)
    const occupancyRate = Math.min(100, Math.round((totalGuests / totalCapacity) * 100))

    return NextResponse.json({
      success: true,
      data: {
        today: {
          date: today,
          totalBanquets: todayBanquets.length,
          totalGuests,
          occupancyRate,
        },
        banquets: todayBanquets,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 })
  }
}
