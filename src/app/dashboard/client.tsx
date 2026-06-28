'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin-layout'

interface DashboardData {
  stats: {
    totalBooks: number
    totalMembers: number
    activeBorrows: number
    todayTransactions: number
  }
  lowStockBooks: { id: number; title: string; stock: number }[]
  popularBooks: ({ id: number; title: string; author: string } & { borrowCount: number })[]
  recentTransactions: {
    id: number
    status: string
    borrowDate: string
    user: { name: string }
    book: { title: string }
  }[]
}

export function DashboardClient({ user }: { user: { name: string; role: string } }) {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard').then((r) => r.json()).then(setData)
  }, [])

  const cards = [
    { label: 'Total Buku', value: data?.stats.totalBooks ?? '-', color: 'bg-blue-50 text-blue-700', href: '/books' },
    { label: 'Anggota Aktif', value: data?.stats.totalMembers ?? '-', color: 'bg-green-50 text-green-700', href: '/members' },
    { label: 'Buku Dipinjam', value: data?.stats.activeBorrows ?? '-', color: 'bg-orange-50 text-orange-700', href: '/transactions' },
    { label: 'Transaksi Hari Ini', value: data?.stats.todayTransactions ?? '-', color: 'bg-purple-50 text-purple-700', href: '/transactions' },
  ]

  return (
    <AdminLayout initialUser={user}>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Dashboard</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Link key={card.label} href={card.href}
              className={`${card.color} p-5 rounded-xl shadow-sm border hover:shadow-md transition`}>
              <p className="text-sm opacity-80">{card.label}</p>
              <p className="text-3xl font-bold mt-1">{card.value}</p>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="font-semibold mb-4">Buku Stok Menipis</h3>
            {data && data.lowStockBooks.length > 0 ? (
              <ul className="space-y-2">
                {data.lowStockBooks.map((b) => (
                  <li key={b.id} className="flex items-center justify-between text-sm">
                    <span>{b.title}</span>
                    <span className="text-red-600 font-medium">{b.stock} tersisa</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Semua stok buku aman</p>
            )}
            <Link href="/books" className="text-sm text-primary hover:underline mt-3 inline-block">Lihat semua buku</Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="font-semibold mb-4">Buku Paling Populer</h3>
            {data && data.popularBooks.length > 0 ? (
              <ol className="space-y-2 list-decimal list-inside">
                {data.popularBooks.map((b, i) => (
                  <li key={b.id} className="text-sm">
                    <span className="font-medium">{b.title}</span>
                    <span className="text-gray-500"> - {b.borrowCount}x dipinjam</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-gray-500">Belum ada data peminjaman</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="font-semibold">Transaksi Terbaru</h3>
          </div>
          {data && data.recentTransactions.length > 0 ? (
            <table className="w-full">
              <thead className="bg-primary-light">
                <tr>
                  <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Anggota</th>
                  <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Buku</th>
                  <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Tanggal</th>
                  <th className="text-center px-4 py-2 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="px-4 py-2 text-sm">{t.user.name}</td>
                    <td className="px-4 py-2 text-sm">{t.book.title}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date(t.borrowDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        t.status === 'borrowed' ? 'bg-blue-100 text-blue-700' :
                        t.status === 'returned' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {t.status === 'borrowed' ? 'Dipinjam' : t.status === 'returned' ? 'Kembali' : 'Terlambat'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-5 text-sm text-gray-500 text-center">Belum ada transaksi</p>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
