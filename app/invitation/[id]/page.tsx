import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { RESTAURANT } from '@/lib/config'
import InvitationCard from './InvitationCard'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const banquet = await prisma.banquet.findUnique({
    where: { id: params.id },
    select: { title: true, hostName: true, date: true },
  })

  if (!banquet) {
    return { title: '邀请函不存在 · 烧师富' }
  }

  const title = banquet.title || '诚挚邀请'
  const host = banquet.hostName || ''
  const date = banquet.date || ''
  const ogImage = `/api/og?title=${encodeURIComponent(title)}&host=${encodeURIComponent(host)}&date=${encodeURIComponent(date)}`

  return {
    title: `${title} · ${RESTAURANT.name}预约`,
    description: `您有一张${RESTAURANT.name}预约邀请函，日期：${date}，组局人：${host}`,
    openGraph: {
      title: `${title} · ${RESTAURANT.name}`,
      description: `日期：${date} · 组局人：${host}`,
      images: [ogImage],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · ${RESTAURANT.name}`,
      description: `日期：${date} · 组局人：${host}`,
      images: [ogImage],
    },
  }
}

export default async function InvitationPage({ params }: Props) {
  const data = await prisma.banquet.findUnique({
    where: { id: params.id },
    include: {
      restaurant: true,
    },
  })

  if (!data) {
    notFound()
  }

  return <InvitationCard data={data} />
}
