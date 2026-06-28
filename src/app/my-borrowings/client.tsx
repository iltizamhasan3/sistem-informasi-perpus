'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { LoadingSpinner } from '@/components/loading-spinner'

interface Transaction {
  id: number
  userId: number
  bookId: number
  borrowDate: string
  dueDate: string
  returnDate: string | null
  fine: number
  status: string
  user: { id: number; name: string; email: string }
  book: { id: number; title: string; author: string }
}

export function MyBorrowingsClient({ user }: { user: { name: string; role: string } }) {
  const [active, setActive] = useState<Transaction[]>([])
  const [history, setHistory] = useState<Transaction[]>([])
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/transactions?status=borrowed').then((r) => r.json()),
      fetch('/api/transactions').then((r) => r.json()),
    ])
      .then(([a, h]) => {
        setActive(a.transactions ?? [])
        setHistory(h.transactions ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalFine = history.reduce((sum, t) => sum + (t.status === 'overdue' ? t.fine : 0), 0)

  return (
    <AdminLayout initialUser={user}>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Peminjaman Saya</h2>

        {totalFine > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            Total denda belum dibayar: <strong>Rp {totalFine.toLocaleString('id-ID')}</strong>
          </div>
        )}

        {loading ? <LoadingSpinner /> : (
        <>
        <div className="flex gap-2 border-b">
          <button onClick={() => setTab('active')} className={`px-4 py-2 text-sm font-medium border-b-2 transition ${tab === 'active' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>
            Sedang Dipinjam ({active.length})
          </button>
          <button onClick={() => setTab('history')} className={`px-4 py-2 text-sm font-medium border-b-2 transition ${tab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>
            Riwayat ({history.length})
          </button>
        </div>

        {tab === 'active' && (
          <div className="space-y-3">
            {active.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">Tidak ada peminjaman aktif</p>
            ) : (
              active.map((t) => {
                const now = new Date()
                const due = new Date(t.dueDate)
                const overdue = now > due
                const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                return (
                  <div key={t.id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t.book.title}</p>
                      <p className="text-sm text-gray-500">{t.book.author}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Dipinjam {new Date(t.borrowDate).toLocaleDateString('id-ID')}
                        {' — '}Jatuh tempo {due.toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      {overdue ? (
                        <span className="text-red-600 font-medium">Terlambat {Math.abs(diffDays)} hari</span>
                      ) : (
                        <span className="text-green-600">{diffDays === 0 ? 'Hari ini jatuh tempo' : `${diffDays} hari lagi`}</span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="bg-white border rounded-xl overflow-x-auto">
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">Belum ada riwayat peminjaman</p>
            ) : (
              <table className="w-full">
                <thead className="bg-primary-light">
                  <tr>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Buku</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Pinjam</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Kembali</th>
                    <th className="text-right px-4 py-2 text-sm font-medium text-gray-500">Denda</th>
                    <th className="text-center px-4 py-2 text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((t) => (
                    <tr key={t.id} className="border-t">
                      <td className="px-4 py-2 text-sm">{t.book.title}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{new Date(t.borrowDate).toLocaleDateString('id-ID')}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {t.returnDate ? new Date(t.returnDate).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        {t.fine > 0 ? `Rp ${t.fine.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          t.status === 'returned' ? 'bg-green-100 text-green-700' : 'bg-danger-light text-danger'
                        }`}>
                          {t.status === 'returned' ? 'Kembali' : 'Terlambat'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        </>
        )}
      </div>
    </AdminLayout>
  )
}
