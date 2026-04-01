'use client'

import { usePathname, useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { path: '/explore', icon: '🔍', label: 'Explore' },
  { path: '/online', icon: '🟢', label: 'Online' },
  { path: '/matches', icon: '💬', label: 'Matches' },
  { path: '/messages', icon: '💌', label: 'Messages' },
  { path: '/profile', icon: '👤', label: 'Profile' },
]

const HIDDEN_ON = ['/login', '/register']

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const shouldHide = HIDDEN_ON.some((p) => pathname.startsWith(p))
  if (shouldHide) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#12121A] border-t border-white/5">
      <div className="flex items-center justify-around max-w-sm mx-auto px-1 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.path)
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all"
            >
              <span className="text-lg">{item.icon}</span>
              <span
                className="text-[9px] font-medium transition-colors"
                style={{ color: isActive ? '#FF4D6D' : '#8884A8' }}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-[#FF4D6D]" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}