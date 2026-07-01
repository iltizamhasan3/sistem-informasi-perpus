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
      <div className="bg-[#c8e6cd] rounded-[24px] px-6 py-5 mb-8">
        <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40">Transaksi</p>
        <h2 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-black mt-1">Pengembalian Buku</h2>
      </div>

      {error && (
        <div className="bg-[#f3c9b6]/30 text-black p-4 rounded-[12px] text-[15px] font-light border border-block-coral mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-[24px] border border-[#e6e6e6] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#c8e6cd]/15">
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Anggota</th>
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Buku</th>
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Tgl Pinjam</th>
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Jatuh Tempo</th>
              <th className="text-right px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageLoading ? (
              <tr><td colSpan={5}><LoadingSpinner /></td></tr>
            ) : transactions.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 text-[15px] font-light text-black border-b border-[#f1f1f1]">
                  <div className="text-[15px] font-light text-black">{t.user.name}</div>
                  <div className="text-[13px] font-light text-black/40">{t.user.email}</div>
                </td>
                <td className="px-4 py-3 text-[15px] font-light text-black border-b border-[#f1f1f1]">
                  <div className="text-[15px] font-light text-black">{t.book.title}</div>
                  <div className="text-[13px] font-light text-black/40">{t.book.author}</div>
                </td>
                <td className="px-4 py-3 text-[15px] font-light text-black border-b border-[#f1f1f1]">{formatDate(t.borrowDate)}</td>
                <td className="px-4 py-3 text-[15px] font-light text-black border-b border-[#f1f1f1]">{formatDate(t.dueDate)}</td>
                <td className="px-4 py-3 text-right border-b border-[#f1f1f1]">
                  <button onClick={() => setReturnId(t.id)} disabled={loading}
                    className="px-5 py-[10px] bg-white text-black rounded-[50px] text-[14px] font-light border border-[#e6e6e6] hover:bg-[#f7f7f5] transition disabled:opacity-40">
                    {loading && returnId === t.id ? 'Memproses...' : 'Kembalikan'}
                  </button>
                </td>
              </tr>
            ))}
            {!pageLoading && transactions.length === 0 && (
              <tr><td colSpan={5} className="text-[15px] font-light text-black/40 text-center py-8">Tidak ada peminjaman aktif</td></tr>
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
