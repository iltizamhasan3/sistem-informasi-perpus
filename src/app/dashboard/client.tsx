'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin-layout'
import { CardSkeleton, Skeleton } from '@/components/skeleton'

interface DashboardData {
  stats: { totalBooks: number; totalMembers: number; activeBorrows: number; todayTransactions: number }
  lowStockBooks: { id: number; title: string; stock: number }[]
  popularBooks: ({ id: number; title: string; author: string } & { borrowCount: number })[]
  recentTransactions: { id: number; status: string; borrowDate: string; user: { name: string }; book: { title: string } }[]
}

export function DashboardClient({ user }: { user: { name: string; role: string } }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState('')

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => { if (!r.ok) throw new Error('Gagal memuat dashboard'); return r.json() })
      .then((d) => { setData(d); setDashboardLoading(false) })
      .catch((e) => { setDashboardError(e.message); setDashboardLoading(false) })
  }, [])

  const cards = [
    { label: 'Total Buku', value: data?.stats?.totalBooks ?? '-', href: '/books', color: 'bg-[var(--color-lifted-cream)] text-[var(--color-ink)]' },
    { label: 'Anggota Aktif', value: data?.stats?.totalMembers ?? '-', href: '/members', color: 'bg-[var(--color-ink)] text-white' },
    { label: 'Buku Dipinjam', value: data?.stats?.activeBorrows ?? '-', href: '/transactions', color: 'bg-[var(--color-lifted-cream)] text-[var(--color-ink)]' },
    { label: 'Transaksi Hari Ini', value: data?.stats?.todayTransactions ?? '-', href: '/transactions', color: 'bg-[var(--color-signal)] text-white' },
  ]

  const statusBadge = (status: string) => {
    if (status === 'borrowed') return <span className="inline-flex px-4 py-1.5 rounded-full text-[13px] font-[500] border border-[var(--color-ink)]/20 text-[var(--color-ink)]">Dipinjam</span>
    if (status === 'returned') return <span className="inline-flex px-4 py-1.5 rounded-full text-[13px] font-[500] border border-[var(--color-ink)] bg-[var(--color-ink)] text-white">Kembali</span>
    return <span className="inline-flex px-4 py-1.5 rounded-full text-[13px] font-[500] border border-[var(--color-signal)] text-[var(--color-signal)]">Terlambat</span>
  }

  return (
    <AdminLayout>
      {dashboardError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-[12px] text-[15px] mb-6">{dashboardError}</div>
      )}

      {dashboardLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-32 w-full rounded-[40px]" />
          <CardSkeleton count={4} />
          <div className="grid md:grid-cols-2 gap-5">
            <Skeleton className="h-48 rounded-[40px]" />
            <Skeleton className="h-48 rounded-[40px]" />
          </div>
          <Skeleton className="h-64 rounded-[40px]" />
        </div>
      ) :
      <div className="space-y-12">
        {/* Header Widget */}
        <div className="mc-card-stadium p-6 md:p-12 relative overflow-hidden flex items-end min-h-[250px] md:min-h-[300px]">
          {/* Decorative watermark inside the widget */}
          <div className="absolute -top-10 -right-10 opacity-10 md:opacity-5 pointer-events-none">
            <h1 className="text-[100px] md:text-[200px] font-bold tracking-tighter leading-none" style={{ fontFamily: 'var(--font-display)' }}>DASH</h1>
          </div>
          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between md:items-end gap-6">
             <div className="w-full md:max-w-[50%] lg:max-w-[60%] overflow-hidden">
                <p className="mc-eyebrow text-[var(--color-slate)] mb-4">Ringkasan Hari Ini</p>
                <h1 className="mc-heading-1 text-[var(--color-ink)]">Selamat datang,<br/><span className="block truncate w-full" title={user.name}>{user.name}</span></h1>
             </div>
             <p className="text-[18px] font-[450] text-[var(--color-slate)] max-w-sm text-right pb-2">
               Pantau aktivitas koleksi, transaksi, dan pergerakan literatur secara real-time.
             </p>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <Link key={card.label} href={card.href}
              className={`${card.color} rounded-[40px] p-6 md:p-8 transition-transform hover:scale-[1.02] shadow-[0_12px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between h-[160px] md:h-[200px]`}>
              <p className="mc-eyebrow opacity-60 mb-1">{card.label}</p>
              <p className="text-[48px] md:text-[64px] font-[500] tracking-tighter leading-none">{card.value}</p>
            </Link>
          ))}
        </div>

        {/* 2 Cols Lists */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Low Stock Books */}
          <div className="bg-transparent">
            <div className="flex items-center justify-between mb-6 px-4">
              <h3 className="mc-heading-3 text-[var(--color-ink)]">Buku Stok Menipis</h3>
              <Link href="/books" className="text-[14px] font-[500] text-[var(--color-slate)] hover:text-[var(--color-ink)]">Lihat semua ↗</Link>
            </div>
            
            <div className="space-y-3">
               {data && data.lowStockBooks.length > 0 ? data.lowStockBooks.map((b) => (
                  <div key={b.id} className="flex items-center justify-between px-6 py-5 bg-[var(--color-lifted-cream)] rounded-[24px] shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[16px] font-[500] text-[var(--color-ink)] line-clamp-1 pr-4">{b.title}</span>
                    <span className="shrink-0 mc-btn-secondary py-1.5 px-4 text-[13px] border-none shadow-sm text-[var(--color-signal)] font-bold">
                       {b.stock} tersisa
                    </span>
                  </div>
               )) : (
                  <div className="px-6 py-8 text-center bg-[var(--color-lifted-cream)] rounded-[24px] text-[var(--color-slate)]">Semua stok buku aman</div>
               )}
            </div>
          </div>

          {/* Popular Books */}
          <div className="bg-transparent">
            <div className="flex items-center justify-between mb-6 px-4">
              <h3 className="mc-heading-3 text-[var(--color-ink)]">Buku Paling Populer</h3>
            </div>
            
            <div className="space-y-3">
               {data && data.popularBooks.length > 0 ? data.popularBooks.map((b, i) => (
                  <div key={b.id} className="flex items-center gap-4 px-6 py-5 bg-[var(--color-lifted-cream)] rounded-[24px] shadow-sm hover:shadow-md transition-shadow">
                    <span className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-[500] ${
                       i === 0 ? 'bg-[var(--color-signal)] text-white shadow-lg' : 'bg-white text-[var(--color-ink)] shadow-sm'
                    }`}>{i + 1}</span>
                    <span className="text-[16px] font-[500] text-[var(--color-ink)] line-clamp-1">{b.title}</span>
                    <span className="ml-auto shrink-0 text-[14px] font-[450] text-[var(--color-slate)]">{b.borrowCount}x dipinjam</span>
                  </div>
               )) : (
                  <div className="px-6 py-8 text-center bg-[var(--color-lifted-cream)] rounded-[24px] text-[var(--color-slate)]">Belum ada data peminjaman</div>
               )}
            </div>
          </div>

        </div>

        {/* Transactions List */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6 px-4">
            <h3 className="mc-heading-3 text-[var(--color-ink)]">Transaksi Terbaru</h3>
          </div>
          
          <div className="space-y-3">
             {data && data.recentTransactions.length > 0 ? data.recentTransactions.map((t) => (
                <div key={t.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 md:px-8 py-5 md:py-6 bg-[var(--color-lifted-cream)] rounded-[24px] shadow-sm hover:shadow-md transition-shadow">
                   
                   <div className="flex items-center gap-6 w-full md:w-2/5">
                      <div className="w-12 h-12 shrink-0 rounded-full bg-[var(--color-ink)] text-white flex items-center justify-center font-bold text-lg">
                         {t.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                         <span className="mc-eyebrow text-[var(--color-slate)] mb-1">Peminjam</span>
                         <span className="text-[16px] font-[500] text-[var(--color-ink)]">{t.user.name}</span>
                      </div>
                   </div>

                   <div className="flex flex-col w-full md:w-2/5">
                      <span className="mc-eyebrow text-[var(--color-slate)] mb-1">Buku</span>
                      <span className="text-[16px] font-[500] text-[var(--color-ink)] line-clamp-1">{t.book.title}</span>
                   </div>

                   <div className="flex items-center justify-between w-full md:w-1/5 gap-4">
                      <div className="flex flex-col">
                         <span className="mc-eyebrow text-[var(--color-slate)] mb-1">Tanggal</span>
                         <span className="text-[15px] font-[450] text-[var(--color-slate)]">{new Date(t.borrowDate).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div>{statusBadge(t.status)}</div>
                   </div>
                   
                </div>
             )) : (
                <div className="px-8 py-16 text-center bg-[var(--color-lifted-cream)] rounded-[40px] text-[var(--color-slate)]">Belum ada transaksi</div>
             )}
          </div>
        </div>

      </div>
      }
    </AdminLayout>
  )
}
