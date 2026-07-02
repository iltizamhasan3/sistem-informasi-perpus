'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useUser } from '@/lib/auth-context'

interface Notification {
  id: number
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

const adminNavItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/books', label: 'Buku' },
  { href: '/members', label: 'Anggota' },
  { href: '/transactions', label: 'Transaksi' },
  { href: '/categories', label: 'Kategori' },
]

const memberNavItems = [
  { href: '/catalog', label: 'Katalog' },
  { href: '/my-borrowings', label: 'Peminjaman' },
  { href: '/my-ebooks', label: 'E-book' },
  { href: '/my-bookings', label: 'Riwayat' },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotif, setShowNotif] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  async function fetchNotifications() {
    try { const res = await fetch('/api/notifications'); const data = await res.json(); setNotifications(data.notifications || []) } catch {}
  }

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    setTimeout(() => { fetchNotifications() }, 0)
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function markAsRead() {
    await fetch('/api/notifications/read', { method: 'PUT' })
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="min-h-screen bg-[#fafaf8] flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        w-64 bg-[#f5f0eb] border-r border-[#e6e6e6] flex-shrink-0
        max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50
        max-md:transition-transform max-md:duration-300 max-md:ease-in-out
        ${sidebarOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}
      `}>
        <div className="h-1 bg-[#c5b0f4]" />
        <div className="px-5 py-4 border-b border-[#e6e6e6] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6v13" /><path d="M12 6a4 4 0 0 0-4-4H2v16h6a4 4 0 0 1 4 4" /><path d="M12 6a4 4 0 0 1 4-4h6v16h-6a4 4 0 0 0-4 4" />
              </svg>
            </div>
            <span className="text-[15px] font-medium text-black tracking-tight">SiPustaka</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 rounded hover:bg-[#c5b0f4]/10 transition">
            <svg className="w-5 h-5 text-black/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="p-3 space-y-0.5 mt-2">
          {(user?.role === 'admin' ? adminNavItems : memberNavItems).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3.5 py-2.5 rounded-[8px] text-[14px] font-light transition ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-black/60 hover:text-black hover:bg-[#c5b0f4]/10'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-[#e6e6e6] px-4 md:px-6 py-2.5 flex items-center justify-between gap-2 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 rounded hover:bg-[#c5b0f4]/10 transition">
              <svg className="w-5 h-5 text-black/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="relative" ref={notifRef}>
                  <button onClick={() => { setShowNotif(!showNotif); if (!showNotif) markAsRead() }}
                    className="relative p-1.5 rounded hover:bg-[#c5b0f4]/10 transition">
                    <svg className="w-5 h-5 text-black/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotif && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-[#e6e6e6] rounded-[12px] shadow-sm z-50 max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 border-b border-[#e6e6e6] flex items-center justify-between">
                        <span className="text-[13px] font-light text-black">Notifikasi</span>
                        {unreadCount > 0 && (
                          <button onClick={markAsRead} className="text-[12px] text-black/50 hover:text-black transition">Tandai dibaca</button>
                        )}
                      </div>
                      {notifications.length > 0 ? notifications.slice(0, 10).map((n) => (
                        <div key={n.id} className={`px-4 py-3 border-b border-[#e6e6e6] text-[14px] ${!n.isRead ? 'bg-[#c5b0f4]/8' : ''}`}>
                          <p className="font-light text-black">{n.title}</p>
                          <p className="text-black/50 text-[13px] mt-0.5">{n.message}</p>
                          <p className="text-black/30 text-[12px] mt-1">{new Date(n.createdAt).toLocaleDateString('id-ID')}</p>
                        </div>
                      )) : (
                        <p className="p-5 text-[14px] text-black/40 text-center font-light">Tidak ada notifikasi</p>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-[14px] font-light text-black/70">{user.name}</span>
                <span className="text-[12px] font-light text-black/40 bg-[#c5b0f4]/15 px-2.5 py-0.5 rounded-[50px]">
                  {user.role}
                </span>
                <button onClick={handleLogout} className="text-[13px] text-black/40 hover:text-black transition">
                  Keluar
                </button>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 bg-[#fafaf8]">{children}</main>
      </div>
    </div>
  )
}
