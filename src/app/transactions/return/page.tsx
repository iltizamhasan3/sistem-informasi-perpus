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
    <div className="relative w-full z-10">
      
      {/* Ghost Watermark */}
      <div className="absolute -top-16 -left-10 md:-left-24 z-[-1] pointer-events-none overflow-hidden w-[150%] whitespace-nowrap">
         <h1 className="mc-ghost-watermark select-none text-[120px] md:text-[240px]">RETURN</h1>
      </div>

      <div className="mc-card-stadium p-6 md:p-12 mb-16 relative overflow-hidden flex items-end min-h-[250px] md:min-h-[300px]">
        <div className="absolute -top-10 -right-10 opacity-10 md:opacity-5 pointer-events-none">
          <h1 className="text-[100px] md:text-[200px] font-bold tracking-tighter leading-none" style={{ fontFamily: 'var(--font-display)' }}>RETURN</h1>
        </div>
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between md:items-end gap-6">
           <div>
              <p className="mc-eyebrow text-[var(--color-slate)] mb-4">Transaksi</p>
              <h1 className="mc-heading-1 text-[var(--color-ink)]">Pengembalian<br/>Buku</h1>
           </div>
           <p className="text-[18px] font-[450] text-[var(--color-slate)] max-w-sm text-right pb-2">
             Kembalikan buku yang sedang dipinjam dan perbarui status ketersediaan literatur.
           </p>
        </div>
      </div>

      {error && (
        <div className="px-6 py-4 text-[15px] font-[500] text-[var(--color-signal)] bg-white rounded-[24px] mb-8 shadow-sm border border-[var(--color-signal)]/20">{error}</div>
      )}

      {/* Pill Rows List */}
      <div className="space-y-4 mb-16">
         {pageLoading ? (
            <div className="flex justify-center py-24"><LoadingSpinner /></div>
         ) : transactions.length === 0 ? (
            <div className="px-8 py-24 text-center bg-white/60 backdrop-blur-sm rounded-[40px] text-[var(--color-slate)] text-[16px] font-[450]">Tidak ada peminjaman aktif</div>
         ) : (
            transactions.map((t) => {
               const now = new Date()
               const due = new Date(t.dueDate)
               const overdue = now > due
               const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

               return (
                  <div key={t.id} className={`flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-6 md:px-8 py-5 md:py-6 rounded-[32px] shadow-sm hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition-shadow border ${overdue ? 'bg-[#fff5f2] border-[var(--color-signal)]/10' : 'bg-[var(--color-lifted-cream)] border-transparent'}`}>
                     
                     {/* User & Book Info */}
                     <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:w-[40%]">
                        <div className="flex items-center gap-4 sm:w-1/2 border-b sm:border-b-0 sm:border-r border-black/5 pb-4 sm:pb-0 pr-4">
                           <div className="w-12 h-12 shrink-0 rounded-full bg-[var(--color-ink)] text-white flex items-center justify-center font-bold text-lg">
                              {t.user.name.charAt(0).toUpperCase()}
                           </div>
                           <div className="flex flex-col overflow-hidden">
                              <span className="mc-eyebrow text-[var(--color-slate)] mb-1">Peminjam</span>
                              <span className="text-[16px] font-[500] text-[var(--color-ink)] truncate">{t.user.name}</span>
                           </div>
                        </div>
                        <div className="flex flex-col overflow-hidden sm:w-1/2">
                           <span className="mc-eyebrow text-[var(--color-slate)] mb-1">Buku</span>
                           <span className="text-[16px] font-[500] text-[var(--color-ink)] line-clamp-1">{t.book.title}</span>
                        </div>
                     </div>

                     {/* Dates & Status */}
                     <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:w-[45%] gap-4">
                        <div className="flex flex-col items-center text-center">
                           <span className="mc-eyebrow text-[var(--color-slate)] mb-1">Tgl Pinjam</span>
                           <span className="text-[15px] font-[450] text-[var(--color-ink)]">{formatDate(t.borrowDate)}</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                           <span className="mc-eyebrow text-[var(--color-slate)] mb-1">Jatuh Tempo</span>
                           <span className={`text-[15px] font-[500] ${overdue ? 'text-[var(--color-signal)]' : 'text-[var(--color-ink)]'}`}>
                              {formatDate(t.dueDate)}
                           </span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                           <span className="mc-eyebrow text-[var(--color-slate)] mb-2">Status</span>
                           <span className={`inline-flex px-4 py-1.5 rounded-full text-[13px] font-[500] border ${
                              overdue 
                                 ? 'border-[var(--color-signal)] text-white bg-[var(--color-signal)] shadow-sm' 
                                 : 'border-[var(--color-ink)]/20 text-[var(--color-ink)] bg-white'
                           }`}>
                              {overdue ? `Terlambat ${Math.abs(diffDays)} Hari` : diffDays === 0 ? 'Tempo Hari Ini' : `${diffDays} Hari Lagi`}
                           </span>
                        </div>
                     </div>

                     {/* Action */}
                     <div className="flex items-center justify-end lg:w-[15%]">
                        <button onClick={() => setReturnId(t.id)} disabled={loading} className="mc-btn-primary px-6 py-2 w-full text-center">
                           {loading && returnId === t.id ? '...' : 'Kembalikan'}
                        </button>
                     </div>
                  </div>
               )
            })
         )}
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
