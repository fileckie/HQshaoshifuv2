// 烧师富全局配置 —— 一处修改，全局生效
export const RESTAURANT = {
  name: '烧师富',
  tagline: '板前创作烧鸟',
  subTagline: '烧鸟料理的创作道场',
  slogan: '让烧鸟重新变成一种可以创作的料理',
  address: '双塔街道竹辉路168号环宇荟·L133',
  addressGuide:
    '环宇荟Manner旁下地库，到底右转到底再右转，橙色B区停车，客梯到一楼左手边即达',
  phone: '177 1554 9313',
  brandKeywords: [
    { text: '板前创作', desc: "Chef's Counter Creation" },
    { text: '风土食材', desc: 'Terroir Ingredients' },
    { text: '小聚酒场', desc: 'Intimate Gathering' },
  ] as const,
} as const

export const TIME_OPTIONS = [
  '18:00',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
] as const

export const ROOM_OPTIONS = [
  {
    value: '板前',
    label: '板前',
    capacity: '10席',
    desc: '近距离观看炭火料理',
  },
  {
    value: '卡座',
    label: '卡座',
    capacity: '4桌',
    desc: '适合2-4人小聚',
  },
  {
    value: '小包厢',
    label: '小包厢',
    capacity: '1间',
    desc: '私密空间，可容纳6人',
  },
  {
    value: '大包厢',
    label: '大包厢',
    capacity: '1间',
    desc: '宽敞舒适，可容纳12人',
  },
] as const

export const BOOKING_CHANNELS = [
  { value: 'wechat', label: '微信' },
  { value: 'phone', label: '电话' },
  { value: 'dianping', label: '大众点评' },
  { value: 'other', label: '其他' },
] as const

// 生成未来 N 天的日期选项
export function generateDates(days = 90) {
  const dates = []
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const today = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    dates.push({
      value: `${year}-${month}-${day}`,
      label: `${date.getMonth() + 1}月${date.getDate()}日`,
      week: weeks[date.getDay()],
      isToday: i === 0,
    })
  }
  return dates
}

// 品牌故事文案
export const BRAND_STORY = [
  '在很多城市里，烧鸟一直是一种很日常的存在。',
  '下班以后，找一家店，坐在吧台前，点几串鸡腿、鸡皮、鸡心，配点酒，聊几句天。',
  '它不复杂，也不需要被解释。这种简单的快乐，一直都在。',
  '但我们慢慢发现——大多数烧鸟店的菜单，十几年几乎没有变化。',
  '好像烧鸟这件事，早就被定义好了。',
  '烧师富想做的，是一件更"多此一举"的事情。',
  '我们不把烧鸟当成"已经完成的答案"，而是把它当成一种还可以继续被创作的料理。',
  '所以在这里，烧鸟不只是鸡肉的不同部位，也不只是调味和火候的变化。',
  '它可以和水果发生关系——青提卷进五花肉，黄油去烤杨桃，火腿和鸡腿重新组合。',
  '有些组合很好吃，有些还在尝试。',
  '但"变化"本身，就是这件事的意义。',
  '我们保留了板前。',
  '炭火、竹签、油脂滴落的声音都在现场发生。每一串烧鸟，都不是从厨房端出来的成品，而是在你面前完成的一次创作。',
  '有时候主厨不太爱说话，但前厅的伙伴会把每一串的想法讲给你听。',
  '烧师富不太像一家传统的烧鸟店。',
  '更像一个还在生长的、小小的料理现场。',
  '我们不确定每一道都会成为经典，但我们确定——烧鸟这件事，还没有被做完。',
] as const
