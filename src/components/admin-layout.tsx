'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

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
  { href: '/my-borrowings', label: 'Peminjaman Saya' },
  { href: '/my-bookings', label: 'Booking Saya' },
  { href: '/catalog', label: 'Katalog' },
]

export function AdminLayout({ children, initialUser }: { children: React.ReactNode; initialUser?: { name: string; role: string } }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; role: string } | null>(initialUser ?? null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotif, setShowNotif] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!initialUser) {
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.user) setUser(data.user)
          else router.push('/login')
        })
        .catch(() => {})
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [router, initialUser])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch {}
  }

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
    <div className="min-h-screen bg-page flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-white border-r flex-shrink-0
        max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50
        max-md:transition-transform max-md:duration-300 max-md:ease-in-out
        ${sidebarOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}
      `}>
        <div className="p-4 border-b flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-primary" onClick={() => setSidebarOpen(false)}>
            SiPustaka
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 rounded hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-2 space-y-1">
          {(user?.role === 'admin' ? adminNavItems : memberNavItems).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm ${
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-primary-light text-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-4 md:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="md:hidden font-bold text-primary">SiPustaka</div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {user && (
              <>
                <div className="relative" ref={notifRef}>
                  <button onClick={() => { setShowNotif(!showNotif); if (!showNotif) markAsRead() }}
                    className="relative p-1.5 rounded-lg hover:bg-primary-light transition">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotif && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                      <div className="p-3 border-b flex items-center justify-between">
                        <span className="font-medium text-sm">Notifikasi</span>
                        {unreadCount > 0 && (
                          <button onClick={markAsRead} className="text-xs text-primary hover:underline">Tandai dibaca</button>
                        )}
                      </div>
                      {notifications.length > 0 ? notifications.slice(0, 10).map((n) => (
                        <div key={n.id} className={`p-3 border-b last:border-0 text-sm ${!n.isRead ? 'bg-blue-50' : ''}`}>
                          <p className="font-medium">{n.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{n.message}</p>
                          <p className="text-gray-400 text-xs mt-1">{new Date(n.createdAt).toLocaleDateString('id-ID')}</p>
                        </div>
                      )) : (
                        <p className="p-4 text-sm text-gray-500 text-center">Tidak ada notifikasi</p>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-sm text-gray-600">{user.name}</span>
                <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded capitalize">
                  {user.role}
                </span>
                <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
                  Keluar
                </button>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
