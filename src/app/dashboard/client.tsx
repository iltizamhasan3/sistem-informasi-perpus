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
    { label: 'Total Buku', value: data?.stats?.totalBooks ?? '-', href: '/books', bg: 'bg-[#f4ecd6]' },
    { label: 'Anggota Aktif', value: data?.stats?.totalMembers ?? '-', href: '/members', bg: 'bg-[#c5b0f4]/20' },
    { label: 'Buku Dipinjam', value: data?.stats?.activeBorrows ?? '-', href: '/transactions', bg: 'bg-[#c8e6cd]/20' },
    { label: 'Transaksi Hari Ini', value: data?.stats?.todayTransactions ?? '-', href: '/transactions', bg: 'bg-[#f3c9b6]/20' },
  ]

  const statusBadge = (status: string) => {
    if (status === 'borrowed') return <span className="inline-flex px-3 py-1 rounded-[50px] text-[13px] font-light bg-[#c5b0f4] text-black">Dipinjam</span>
    if (status === 'returned') return <span className="inline-flex px-3 py-1 rounded-[50px] text-[13px] font-light bg-[#c8e6cd] text-black">Kembali</span>
    return <span className="inline-flex px-3 py-1 rounded-[50px] text-[13px] font-light bg-[#f3c9b6] text-black">Terlambat</span>
  }

  return (
    <AdminLayout>
      {dashboardError && (
        <div className="bg-[#f3c9b6]/30 text-black p-4 rounded-[12px] text-[15px] font-light border border-[#f3c9b6] mb-6">{dashboardError}</div>
      )}

      {dashboardLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-32 w-full rounded-[24px]" />
          <CardSkeleton count={4} />
          <div className="grid md:grid-cols-2 gap-5">
            <Skeleton className="h-48 rounded-[24px]" />
            <Skeleton className="h-48 rounded-[24px]" />
          </div>
          <Skeleton className="h-64 rounded-[24px]" />
        </div>
      ) :
      <div className="space-y-8">
        <div className="bg-[#f4ecd6] rounded-[24px] p-12">
          <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40 mb-3">Dashboard</p>
          <h1 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-black">Selamat datang, {user.name}</h1>
          <p className="text-[18px] font-light leading-relaxed text-black/50 mt-3 max-w-xl">
            Ringkasan aktivitas perpustakaan hari ini.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Link key={card.label} href={card.href}
              className={`${card.bg} rounded-[24px] border border-[#e6e6e6] p-6 transition hover:brightness-[0.97]`}>
              <p className="text-[14px] font-light text-black/50 mb-1">{card.label}</p>
              <p className="text-[36px] font-bold tracking-[-0.03em] text-black">{card.value}</p>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-[24px] border border-[#e6e6e6] p-6">
            <h3 className="text-[17px] font-bold text-black mb-4">Buku Stok Menipis</h3>
            {data && data.lowStockBooks.length > 0 ? (
              <div className="space-y-2">
                {data.lowStockBooks.map((b) => (
                  <div key={b.id} className="flex items-center justify-between px-3 py-2.5 bg-[#f3c9b6]/15 rounded-[8px]">
                    <span className="text-[15px] font-light text-black">{b.title}</span>
                    <span className="inline-flex px-2.5 py-0.5 rounded-[50px] text-[12px] font-light bg-[#f3c9b6] text-black">{b.stock} tersisa</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[15px] font-light text-black/40">Semua stok buku aman</p>
            )}
            <Link href="/books" className="inline-block mt-4 text-[14px] font-light text-black/50 hover:text-black transition">Lihat semua buku</Link>
          </div>

          <div className="bg-white rounded-[24px] border border-[#e6e6e6] p-6">
            <h3 className="text-[17px] font-bold text-black mb-4">Buku Paling Populer</h3>
            {data && data.popularBooks.length > 0 ? (
              <div className="space-y-2">
                {data.popularBooks.map((b, i) => (
                  <div key={b.id} className="flex items-center gap-3 px-3 py-2.5 bg-[#f4ecd6]/20 rounded-[8px]">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-light ${
                      i === 0 ? 'bg-[#f4ecd6] text-black' :
                      i === 1 ? 'bg-[#e8e8e8] text-black' :
                      i === 2 ? 'bg-[#f3c9b6] text-black' :
                      'bg-black text-white'
                    }`}>{i + 1}</span>
                    <span className="text-[15px] font-light text-black">{b.title}</span>
                    <span className="ml-auto text-[13px] font-light text-black/40">{b.borrowCount}x dipinjam</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[15px] font-light text-black/40">Belum ada data peminjaman</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-[#e6e6e6] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f1f1f1]">
            <h3 className="text-[17px] font-bold text-black">Transaksi Terbaru</h3>
          </div>
          {data && data.recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#c5b0f4]/15">
                    <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Anggota</th>
                    <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Buku</th>
                    <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Tanggal</th>
                    <th className="text-center px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentTransactions.map((t) => (
                    <tr key={t.id} className="border-b border-[#f1f1f1] hover:bg-[#c5b0f4]/8 transition">
                      <td className="px-4 py-3 text-[15px] font-light text-black">{t.user.name}</td>
                      <td className="px-4 py-3 text-[15px] font-light text-black">{t.book.title}</td>
                      <td className="px-4 py-3 text-[15px] font-light text-black/40">{new Date(t.borrowDate).toLocaleDateString('id-ID')}</td>
                      <td className="px-4 py-3 text-center">{statusBadge(t.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
          <p className="p-6 text-[15px] font-light text-black/40 text-center">Belum ada transaksi</p>
            )}
          </div>
      </div>
      }
    </AdminLayout>
  )
}
