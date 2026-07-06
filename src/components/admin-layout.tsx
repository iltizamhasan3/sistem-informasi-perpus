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
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const navItems = user?.role === 'admin' ? adminNavItems : memberNavItems;

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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) setShowMobileMenu(false)
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
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas-cream)] overflow-x-hidden">
      
      {/* FLOATING NAV PILL */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="mc-nav-pill flex items-center justify-between w-full max-w-[1200px]">
          
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--color-ink)] flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
               </svg>
            </div>
            <span className="font-[500] text-xl tracking-tight text-[var(--color-ink)]">SiPustaka</span>
          </Link>
          
          {/* Main Links */}
          <div className="hidden md:flex items-center gap-12">
            {navItems.map(item => {
               const isActive = pathname.startsWith(item.href)
               return (
                 <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`text-[16px] font-[500] tracking-tight transition ${isActive ? 'text-[var(--color-ink)]' : 'text-black/50 hover:text-[var(--color-ink)]'}`}
                 >
                   {item.label}
                 </Link>
               )
            })}
          </div>

          <div className="flex items-center gap-6">
             {/* Notif */}
             {user && (
               <div className="relative flex items-center gap-6" ref={notifRef}>
                  <button onClick={() => { setShowNotif(!showNotif); if (!showNotif) markAsRead() }}
                    className="relative p-2 rounded-full hover:bg-black/5 transition flex items-center">
                    <svg className="w-5 h-5 text-black/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute 0 right-0 bg-[var(--color-signal)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Notif */}
                  {showNotif && (
                    <div className="absolute right-0 top-10 mt-2 w-80 bg-white border border-[#e6e6e6] rounded-[24px] shadow-[0_24px_48px_0_rgba(0,0,0,0.08)] z-50 overflow-hidden">
                      <div className="px-5 py-4 bg-[var(--color-lifted-cream)] border-b border-[#e6e6e6] flex items-center justify-between">
                        <span className="text-[14px] font-[500] text-[var(--color-ink)]">Notifikasi</span>
                        {unreadCount > 0 && (
                          <button onClick={markAsRead} className="text-[12px] text-black/50 hover:text-black transition">Tandai dibaca</button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? notifications.slice(0, 10).map((n) => (
                          <div key={n.id} className={`px-5 py-4 border-b border-[#e6e6e6] text-[14px] ${!n.isRead ? 'bg-[#F3F0EE]/50' : 'bg-white'}`}>
                            <p className="font-[500] text-[var(--color-ink)]">{n.title}</p>
                            <p className="text-[var(--color-slate)] text-[13px] mt-1 font-[450] leading-relaxed">{n.message}</p>
                            <p className="text-black/30 text-[12px] mt-2 font-[450]">{new Date(n.createdAt).toLocaleDateString('id-ID')}</p>
                          </div>
                        )) : (
                          <p className="p-8 text-[14px] text-black/40 text-center font-[450]">Tidak ada notifikasi</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* User Profile */}
                  <div className="hidden lg:flex items-center gap-3">
                    <span className="text-[15px] font-[500] text-[var(--color-ink)] max-w-[120px] xl:max-w-[200px] truncate" title={user.name}>{user.name}</span>
                    <button onClick={handleLogout} className="mc-btn-secondary text-sm px-4 py-1.5">
                      Keluar
                    </button>
                  </div>

                  {/* Mobile Menu Toggle */}
                  <div className="md:hidden relative" ref={mobileMenuRef}>
                    <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="relative p-2 rounded-full hover:bg-black/5 transition flex items-center">
                      <svg className="w-5 h-5 text-black/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                      </svg>
                    </button>
                    
                    {showMobileMenu && (
                      <div className="absolute right-0 top-10 mt-2 w-56 bg-white border border-[#e6e6e6] rounded-[24px] shadow-[0_24px_48px_0_rgba(0,0,0,0.08)] z-50 overflow-hidden py-2">
                        <div className="px-5 py-3 mb-2 border-b border-[#e6e6e6]">
                          <span className="text-[14px] font-[500] text-[var(--color-ink)] block truncate">{user.name}</span>
                          <span className="text-[12px] text-[var(--color-slate)] capitalize">{user.role}</span>
                        </div>
                        {navItems.map(item => {
                          const isActive = pathname.startsWith(item.href)
                          return (
                            <Link key={item.href} href={item.href} onClick={() => setShowMobileMenu(false)} className={`block px-5 py-3 text-[14px] font-[500] transition ${isActive ? 'bg-[var(--color-lifted-cream)] text-[var(--color-ink)]' : 'text-[var(--color-slate)] hover:bg-[var(--color-lifted-cream)] hover:text-[var(--color-ink)]'}`}>
                              {item.label}
                            </Link>
                          )
                        })}
                        <div className="border-t border-[#e6e6e6] mt-2 pt-2">
                          <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-[14px] font-[500] text-[var(--color-signal)] hover:bg-[#fff5f2] transition">
                            Keluar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
               </div>
             )}
          </div>
        </nav>
      </div>

      <main className="flex-1 w-full max-w-[1280px] px-4 md:px-6 pt-[100px] md:pt-[140px] pb-32 mx-auto relative">
        {children}
      </main>

      {/* INK BLACK FOOTER */}
      <footer className="w-full bg-[var(--color-ink)] text-white pt-16 md:pt-24 pb-24 md:pb-36 px-6 md:px-16">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="mc-heading-2 mb-16 max-w-2xl text-white">
            Kami siap membantu mengelola masa depan perpustakaan Anda.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 max-w-lg">
            <div>
              <h3 className="mc-eyebrow text-[var(--color-slate)] mb-6">Menu Utama</h3>
              <ul className="space-y-4">
                 {navItems.map(item => (
                   <li key={item.href}>
                     <Link href={item.href} className="text-[14px] font-[450] text-white/80 hover:text-white transition">
                       {item.label} <span className="ml-1 text-[10px]">↗</span>
                     </Link>
                   </li>
                 ))}
              </ul>
            </div>
            <div>
              <h3 className="mc-eyebrow text-[var(--color-slate)] mb-6">Lokasi</h3>
              <p className="text-[14px] font-[450] text-white/80 leading-relaxed max-w-[200px]">
                Jl Dharmawangsa Dalam,<br/>
                Surabaya 60286
              </p>
            </div>
          </div>

          <div className="h-[1px] w-full bg-white/20 mb-8" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[13px] font-[450] text-white/50">
             <p>© 2026 SiPustaka. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
