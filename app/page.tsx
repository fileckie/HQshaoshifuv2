import Link from 'next/link'
import { RESTAURANT } from '@/lib/config'

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      {/* 顶部细红线 */}
      <div className="h-1 bg-red" />

      {/* 主内容 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-20">
        {/* Logo区域 */}
        <div className="text-center mb-16">
          {/* 书法Logo */}
          <h1 className="text-6xl sm:text-8xl md:text-9xl text-white mb-8 tracking-widest font-serif font-bold">
            {RESTAURANT.name}
          </h1>

          {/* 红圈圈修饰 */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {RESTAURANT.tagline.split('').map((char) => (
              <div
                key={char}
                className="w-8 h-8 sm:w-10 sm:h-10 border border-red rounded-full flex items-center justify-center"
              >
                <span className="text-red text-xs font-serif">{char}</span>
              </div>
            ))}
          </div>

          {/* 品类表达 */}
          <div className="mb-6">
            <p className="text-xl sm:text-2xl md:text-3xl text-white tracking-[0.2em] font-serif font-medium">
              {RESTAURANT.tagline}
            </p>
          </div>

          {/* 氛围文字 */}
          <p className="text-white/50 text-base tracking-wider font-serif">
            &ldquo;{RESTAURANT.slogan}&rdquo;
          </p>
        </div>

        {/* CTA按钮 */}
        <Link
          href="/admin"
          className="px-12 sm:px-16 py-4 sm:py-5 border border-white/40 text-white text-base tracking-[0.2em] hover:bg-white hover:text-black transition-colors mb-16 font-serif"
        >
          预约席位
        </Link>

        {/* 地址信息 */}
        <div className="text-center space-y-3 text-sm text-white/40 tracking-wider font-serif">
          <p>{RESTAURANT.address}</p>
          <p className="text-white/60">{RESTAURANT.phone}</p>
        </div>
      </div>

      {/* 底部 */}
      <div className="py-6 text-center border-t border-white/5">
        <p className="text-sm text-white/20 tracking-[0.2em] font-serif">
          厨师站在炭火前，根据食材的状态进行组合
        </p>
      </div>
    </main>
  )
}
