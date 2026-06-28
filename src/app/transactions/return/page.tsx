'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ConfirmModal } from '@/components/confirm-modal'
import { Toast } from '@/components/toast'

interface Transaction {
  id: number
  borrowDate: string
  dueDate: string
  status: string
  user: { name: string; email: string }
  book: { title: string; author: string }
  fine: number
}

export default function ReturnPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [returnId, setReturnId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/transactions?status=borrowed')
      .then((r) => r.json())
      .then((d) => { setTransactions(d.transactions || []); setPageLoading(false) })
      .catch(() => { setError('Gagal memuat data peminjaman'); setPageLoading(false) })
  }, [])

  async function handleReturn(id: number) {
    setError('')
    setLoading(true)
    setReturnId(null)

    try {
      const res = await fetch('/api/transactions/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengembalikan buku')

      setTransactions((prev) => prev.filter((t) => t.id !== id))

      if (data.transaction.fine > 0) {
        setToast({ type: 'success', message: `Buku berhasil dikembalikan. Denda: Rp ${data.transaction.fine.toLocaleString('id-ID')}` })
      } else {
        setToast({ type: 'success', message: 'Buku berhasil dikembalikan' })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengembalikan buku')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('id-ID')
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Pengembalian Buku</h2>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary-light">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Anggota</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Buku</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Tgl Pinjam</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Jatuh Tempo</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageLoading ? (
              <tr><td colSpan={5}><LoadingSpinner /></td></tr>
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
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setReturnId(t.id)} disabled={loading}
                    className="px-3 py-1.5 bg-secondary text-white text-sm rounded-lg hover:bg-secondary-dark transition disabled:opacity-50">
                    {loading && returnId === t.id ? 'Memproses...' : 'Kembalikan'}
                  </button>
                </td>
              </tr>
            ))}
            {!pageLoading && transactions.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Tidak ada peminjaman aktif</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={returnId !== null}
        title="Konfirmasi Pengembalian"
        message="Yakin ingin mengembalikan buku ini?"
        confirmLabel="Kembalikan"
        loading={loading}
        onConfirm={() => returnId !== null && handleReturn(returnId)}
        onCancel={() => setReturnId(null)}
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  )
}
