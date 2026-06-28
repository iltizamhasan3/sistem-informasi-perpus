'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Pagination } from '@/components/pagination'
import { LoadingSpinner } from '@/components/loading-spinner'

interface Transaction {
  id: number
  borrowDate: string
  dueDate: string
  returnDate: string | null
  fine: number
  status: string
  user: { id: number; name: string; email: string }
  book: { id: number; title: string; author: string }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchTransactions().finally(() => setPageLoading(false)) }, [])

  async function fetchTransactions(status?: string, p?: number) {
    try {
      const params = new URLSearchParams()
      if (status || filter) params.set('status', status || filter)
      params.set('page', String(p || page))
      const res = await fetch(`/api/transactions?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memuat transaksi')
      setTransactions(data.transactions)
      if (data.meta) {
        setTotal(data.meta.total)
        setTotalPages(data.meta.totalPages)
        setPage(data.meta.page)
      }
    } catch {
      setError('Gagal memuat data transaksi')
    }
  }

  function handleFilter(val: string) {
    setFilter(val)
    setPage(1)
    fetchTransactions(val || undefined, 1)
  }

  function onPageChange(p: number) {
    fetchTransactions(filter || undefined, p)
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('id-ID')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Transaksi</h2>
        <div className="space-x-2">
          <Link href="/transactions/borrow"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm">
            + Pinjam Buku
          </Link>
          <Link href="/transactions/return"
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition text-sm">
            Kembalikan Buku
          </Link>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {['', 'borrowed', 'returned', 'overdue'].map((s) => (
          <button key={s} onClick={() => handleFilter(s)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition ${
              filter === s ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-gray-50'
            }`}>
            {s === '' ? 'Semua' : s === 'borrowed' ? 'Dipinjam' : s === 'returned' ? 'Dikembalikan' : 'Terlambat'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary-light">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Anggota</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Buku</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Tgl Pinjam</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Jatuh Tempo</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Tgl Kembali</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Denda</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageLoading ? (
              <tr><td colSpan={7}><LoadingSpinner /></td></tr>
            ) : transactions.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium text-sm">{t.user.name}</div>
                  <div className="text-xs text-gray-500">{t.user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-sm">{t.book.title}</div>
                  <div className="text-xs text-gray-500">{t.book.author}</div>
                </td>
                <td className="px-4 py-3 text-sm">{formatDate(t.borrowDate)}</td>
                <td className="px-4 py-3 text-sm">{formatDate(t.dueDate)}</td>
                <td className="px-4 py-3 text-sm">{t.returnDate ? formatDate(t.returnDate) : '-'}</td>
                <td className="px-4 py-3 text-center text-sm">Rp {t.fine.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    t.status === 'borrowed' ? 'bg-primary-light text-primary-dark' :
                    t.status === 'returned' ? 'bg-green-100 text-green-700' : 'bg-danger-light text-danger'
                  }`}>
                    {t.status === 'borrowed' ? 'Dipinjam' : t.status === 'returned' ? 'Kembali' : 'Terlambat'}
                  </span>
                </td>
              </tr>
            ))}
            {!pageLoading && transactions.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Belum ada transaksi</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={onPageChange} />
    </div>
  )
}
