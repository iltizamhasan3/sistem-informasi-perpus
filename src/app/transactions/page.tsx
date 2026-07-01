'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Pagination } from '@/components/pagination'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Toast } from '@/components/toast'
import { ConfirmModal } from '@/components/confirm-modal'

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
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [returningId, setReturningId] = useState<number | null>(null)

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

  async function handleReturn(transactionId: number) {
    try {
      const res = await fetch('/api/transactions/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengembalikan buku')
      const msg = data.transaction.fine > 0
        ? `Buku berhasil dikembalikan. Denda: Rp ${data.transaction.fine.toLocaleString()}`
        : 'Buku berhasil dikembalikan!'
      setToast({ type: 'success', message: msg })
      fetchTransactions(filter || undefined, page)
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Gagal' })
    }
    setReturningId(null)
  }

  async function exportCSV() {
    try {
      const res = await fetch(`/api/transactions?limit=all`)
      const data = await res.json()
      const list = data.transactions || data
      const rows = [['Anggota', 'Email', 'Buku', 'Tgl Pinjam', 'Jatuh Tempo', 'Tgl Kembali', 'Denda', 'Status'].join(',')]
      for (const t of list) {
        const status = t.status === 'borrowed' ? 'Dipinjam' : t.status === 'returned' ? 'Kembali' : 'Terlambat'
        rows.push([`"${t.user.name}"`, `"${t.user.email}"`, `"${t.book.title}"`, t.borrowDate.slice(0, 10), t.dueDate.slice(0, 10), t.returnDate ? t.returnDate.slice(0, 10) : '', t.fine, status].join(','))
      }
      const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'transaksi.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch {
      setToast({ type: 'error', message: 'Gagal mengekspor data' })
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('id-ID')
  }

  return (
    <div>
      <div className="bg-[#d4d1f0] rounded-[24px] p-8 md:p-12 mb-8">
        <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40 mb-3">Transaksi</p>
        <h1 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-black">Transaksi</h1>
        <p className="text-[18px] font-light leading-relaxed text-black/50 mt-3 max-w-xl">Kelola peminjaman dan pengembalian buku</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {['', 'borrowed', 'returned', 'overdue'].map((s) => (
            <button key={s} onClick={() => handleFilter(s)}
              className={`px-5 py-[10px] rounded-[50px] text-[14px] font-light transition ${
                filter === s
                  ? 'bg-[#c5b0f4] text-black border border-[#c5b0f4]'
                  : 'bg-white text-black border border-[#e6e6e6] hover:bg-[#c5b0f4]/10'
              }`}>
              {s === '' ? 'Semua' : s === 'borrowed' ? 'Dipinjam' : s === 'returned' ? 'Dikembalikan' : 'Terlambat'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV}
            className="px-5 py-[10px] bg-white text-black rounded-[50px] text-[14px] font-light border border-[#e6e6e6] hover:bg-[#f7f7f5] transition">Export CSV</button>
          <Link href="/transactions/borrow"
            className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition">+ Pinjam Buku</Link>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 text-[15px] font-light text-black bg-[#f3c9b6] rounded-[8px] mb-6">{error}</div>
      )}

      <div className="bg-white rounded-[24px] border border-[#e6e6e6] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-[#d4d1f0]/15">
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Anggota</th>
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Buku</th>
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Tgl Pinjam</th>
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Jatuh Tempo</th>
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Tgl Kembali</th>
              <th className="text-center px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Denda</th>
              <th className="text-center px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Status</th>
              <th className="text-center px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageLoading ? (
              <tr><td colSpan={8}><LoadingSpinner /></td></tr>
            ) : transactions.map((t) => (
              <tr key={t.id} className="border-b border-[#f1f1f1] hover:bg-[#c5b0f4]/8 transition">
                <td className="px-4 py-3">
                  <div className="text-[15px] font-light text-black">{t.user.name}</div>
                  <div className="text-[13px] font-light text-black/40">{t.user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-[15px] font-light text-black">{t.book.title}</div>
                  <div className="text-[13px] font-light text-black/40">{t.book.author}</div>
                </td>
                <td className="px-4 py-3 text-[15px] font-light text-black/50">{formatDate(t.borrowDate)}</td>
                <td className="px-4 py-3 text-[15px] font-light text-black/50">{formatDate(t.dueDate)}</td>
                <td className="px-4 py-3 text-[15px] font-light text-black/50">{t.returnDate ? formatDate(t.returnDate) : '-'}</td>
                <td className="px-4 py-3 text-center text-[15px] font-light text-black">Rp {t.fine.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-3 py-1 rounded-[50px] text-[13px] font-light ${
                    t.status === 'borrowed' ? 'bg-[#c5b0f4] text-black' :
                    t.status === 'returned' ? 'bg-[#c8e6cd] text-black' : 'bg-[#f3c9b6] text-black'
                  }`}>
                    {t.status === 'borrowed' ? 'Dipinjam' : t.status === 'returned' ? 'Kembali' : 'Terlambat'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {(t.status === 'borrowed' || t.status === 'overdue') && (
                    <button onClick={() => setReturningId(t.id)}
                      className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition">
                      Kembalikan
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!pageLoading && transactions.length === 0 && (
              <tr><td colSpan={8} className="text-[15px] font-light text-black/40 text-center py-8">Belum ada transaksi</td></tr>
            )}
          </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={onPageChange} />

      <ConfirmModal
        open={returningId !== null}
        title="Kembalikan Buku"
        message="Yakin ingin mengembalikan buku ini?"
        onConfirm={() => handleReturn(returningId!)}
        onCancel={() => setReturningId(null)}
      />
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  )
}
