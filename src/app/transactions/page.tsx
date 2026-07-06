'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Pagination } from '@/components/pagination'
import { Toast } from '@/components/toast'
import { ConfirmModal } from '@/components/confirm-modal'
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
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [returningId, setReturningId] = useState<number | null>(null)

  useEffect(() => {
    fetchTransactions().finally(() => setPageLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const statusBadge = (status: string) => {
    if (status === 'borrowed') return <span className="inline-flex px-4 py-1.5 rounded-full text-[13px] font-[500] border border-[var(--color-ink)]/20 text-[var(--color-ink)]">Dipinjam</span>
    if (status === 'returned') return <span className="inline-flex px-4 py-1.5 rounded-full text-[13px] font-[500] border border-[var(--color-ink)] bg-[var(--color-ink)] text-white">Kembali</span>
    return <span className="inline-flex px-4 py-1.5 rounded-full text-[13px] font-[500] border border-[var(--color-signal)] text-[var(--color-signal)]">Terlambat</span>
  }

  return (
    <div className="relative w-full z-10">
      
      {/* Ghost Watermark */}
      <div className="absolute -top-16 -left-10 md:-left-24 z-[-1] pointer-events-none overflow-hidden w-[150%] whitespace-nowrap">
         <h1 className="mc-ghost-watermark select-none text-[120px] md:text-[240px]">TRANSACTIONS</h1>
      </div>

      <div className="mc-card-stadium p-6 md:p-12 mb-16 relative overflow-hidden flex items-end min-h-[250px] md:min-h-[300px]">
        <div className="absolute -top-10 -right-10 opacity-10 md:opacity-5 pointer-events-none">
          <h1 className="text-[100px] md:text-[200px] font-bold tracking-tighter leading-none" style={{ fontFamily: 'var(--font-display)' }}>SYNC</h1>
        </div>
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between md:items-end gap-6">
           <div className="w-full md:w-auto min-w-0">
              <p className="mc-eyebrow text-[var(--color-slate)] mb-4">Aktivitas Peminjaman</p>
              <h1 className="mc-heading-1 text-[var(--color-ink)] break-words break-all sm:break-normal">Sirkulasi<br/>Buku</h1>
           </div>
           <p className="text-[18px] font-[450] text-[var(--color-slate)] max-w-sm text-right pb-2">
             Pantau peminjaman, batas waktu pengembalian, dan riwayat sirkulasi literatur.
           </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {['', 'borrowed', 'returned', 'overdue'].map((s) => (
            <button key={s} onClick={() => handleFilter(s)}
              className={`px-6 py-[12px] rounded-full text-[15px] font-[500] transition-colors border ${
                filter === s
                  ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                  : 'bg-white text-[var(--color-slate)] border-transparent hover:border-[var(--color-ink)]/20 shadow-sm'
              }`}>
              {s === '' ? 'Semua' : s === 'borrowed' ? 'Dipinjam' : s === 'returned' ? 'Dikembalikan' : 'Terlambat'}
            </button>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <button onClick={exportCSV} className="mc-btn-secondary px-6 py-4 w-full sm:w-auto text-center">
            Export CSV
          </button>
          <Link href="/transactions/borrow" className="mc-btn-primary px-8 py-4 whitespace-nowrap flex justify-center w-full sm:w-auto">
            Pinjam Buku
          </Link>
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
            <div className="px-8 py-24 text-center bg-white/60 backdrop-blur-sm rounded-[40px] text-[var(--color-slate)] text-[16px] font-[450]">Belum ada data transaksi</div>
         ) : (
            transactions.map((t) => (
               <div key={t.id} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-6 md:px-8 py-5 md:py-6 bg-[var(--color-lifted-cream)] rounded-[32px] shadow-sm hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition-shadow">
                  
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
                        <span className="text-[15px] font-[450] text-[var(--color-slate)]">{formatDate(t.dueDate)}</span>
                     </div>
                     <div className="flex flex-col items-center text-center">
                        <span className="mc-eyebrow text-[var(--color-slate)] mb-1">Denda</span>
                        <span className={`text-[16px] font-[500] ${t.fine > 0 ? 'text-[var(--color-signal)]' : 'text-[var(--color-ink)]'}`}>
                           Rp {t.fine.toLocaleString()}
                        </span>
                     </div>
                     <div className="flex flex-col items-center text-center">
                        <span className="mc-eyebrow text-[var(--color-slate)] mb-2">Status</span>
                        {statusBadge(t.status)}
                     </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-end lg:w-[15%]">
                     {(t.status === 'borrowed' || t.status === 'overdue') ? (
                        <button onClick={() => setReturningId(t.id)} className="mc-btn-primary px-6 py-2 w-full text-center">
                           Kembalikan
                        </button>
                     ) : (
                        <div className="w-full text-right text-[14px] font-[450] text-[var(--color-slate)]">Selesai</div>
                     )}
                  </div>
               </div>
            ))
         )}
      </div>

      <div className="flex justify-center mb-16">
        <div className="bg-white/60 backdrop-blur-md rounded-full px-4 py-2 border border-[#e6e6e6]">
           <Pagination page={page} totalPages={totalPages} total={total} onPageChange={onPageChange} />
        </div>
      </div>

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
