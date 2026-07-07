'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { ConfirmModal } from '@/components/confirm-modal'
import { Toast } from '@/components/toast'
import { LoadingSpinner } from '@/components/loading-spinner'

interface BookingItem {
  id: number
  code: string
  status: string
  createdAt: string
  expiresAt: string
  book: { id: number; title: string; author: string }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MyBookingsClient({ user }: { user: { name: string; role: string } }) {
  const [items, setItems] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState<BookingItem | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function fetchBookings() {
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((data) => setItems(data.bookings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBookings() }, [])

  async function handleCancel() {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cancelTarget.id, action: 'cancel' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal membatalkan booking')
      setToast({ type: 'success', message: 'Booking berhasil dibatalkan' })
      setCancelTarget(null)
      setLoading(true)
      fetchBookings()
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Gagal' })
    } finally {
      setCancelling(false)
    }
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      setToast({ type: 'success', message: 'Kode booking disalin' })
    } catch {
      setToast({ type: 'error', message: 'Gagal menyalin kode' })
    }
  }

  async function exportCSV() {
    try {
      const res = await fetch('/api/bookings?limit=all')
      const data = await res.json()
      const list = data.bookings || data
      const rows = [['Kode', 'Anggota', 'Email', 'Buku', 'Status', 'Tgl Booking', 'Berlaku'].join(',')]
      for (const b of list) {
        const status = b.status === 'active' ? 'Aktif' : b.status === 'completed' ? 'Selesai' : b.status === 'expired' ? 'Expired' : 'Dibatalkan'
        rows.push([`"${b.code}"`, `"${b.user?.name || ''}"`, `"${b.user?.email || ''}"`, `"${b.book.title}"`, status, b.createdAt.slice(0, 10), b.expiresAt.slice(0, 10)].join(','))
      }
      const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'booking.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch {}
  }

  const activeBookings = items.filter((b) => b.status === 'active')
  const historyBookings = items.filter((b) => b.status !== 'active')

  const statusBadge = (status: string) => {
    if (status === 'completed') return <span className="inline-flex px-4 py-1.5 rounded-full text-[13px] font-[500] border border-[var(--color-ink)] bg-[var(--color-ink)] text-white">Selesai</span>
    if (status === 'expired') return <span className="inline-flex px-4 py-1.5 rounded-full text-[13px] font-[500] border border-[var(--color-signal)] text-[var(--color-signal)] bg-white">Kedaluwarsa</span>
    return <span className="inline-flex px-4 py-1.5 rounded-full text-[13px] font-[500] border border-[var(--color-slate)]/30 text-[var(--color-slate)] bg-white/50">Dibatalkan</span>
  }

  return (
    <AdminLayout>
      <div className="relative w-full z-10">
        
        {/* Ghost Watermark */}
        <div className="absolute -top-16 -left-10 md:-left-24 z-[-1] pointer-events-none overflow-hidden w-[150%] whitespace-nowrap">
           <h1 className="mc-ghost-watermark select-none text-[120px] md:text-[240px]">TICKET</h1>
        </div>

        <div className="mc-card-stadium p-6 md:p-12 mb-12 relative overflow-hidden flex items-end min-h-[250px] md:min-h-[300px]">
          <div className="absolute -top-10 -right-10 opacity-10 md:opacity-5 pointer-events-none">
            <h1 className="text-[100px] md:text-[200px] font-bold tracking-tighter leading-none" style={{ fontFamily: 'var(--font-display)' }}>RESERVED</h1>
          </div>
          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between md:items-end gap-6">
             <div>
                <p className="mc-eyebrow text-[var(--color-slate)] mb-4">Pemesanan Buku</p>
                <h1 className="mc-heading-1 text-[var(--color-ink)]">Booking<br/>& Riwayat</h1>
             </div>
             
             <div className="flex flex-col items-end">
                <p className="text-[18px] font-[450] text-[var(--color-slate)] max-w-sm text-right mb-6">
                  Kelola antrean peminjaman buku dan lihat riwayat pemesanan Anda.
                </p>
                <button onClick={exportCSV} className="mc-btn-secondary px-6 py-3">
                   Export Data CSV
                </button>
             </div>
          </div>
        </div>

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        {loading ? (
           <div className="flex justify-center py-24"><LoadingSpinner /></div>
        ) : (
          <div className="space-y-16 mb-24">
            
            {/* Active Bookings Section */}
            {activeBookings.length > 0 && (
              <div>
                <h2 className="mc-heading-3 text-[var(--color-ink)] mb-6 flex items-center gap-3">
                   <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-signal)] animate-pulse"></span>
                   Booking Aktif
                </h2>
                <div className="space-y-4">
                  {activeBookings.map((b) => (
                    <div key={b.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 md:px-8 py-5 md:py-6 bg-[var(--color-lifted-cream)] rounded-[32px] shadow-sm hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition-shadow">
                      
                      <div className="flex items-start gap-4 md:w-[45%] border-b md:border-b-0 border-black/5 pb-4 md:pb-0">
                         <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 border border-black/5 text-[var(--color-ink)]">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         </div>
                         <div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-[500] border border-[var(--color-ink)]/15 text-[var(--color-ink)] bg-white/50 mb-2 tracking-wide uppercase">
                               Menunggu Pengambilan
                            </span>
                            <h3 className="text-[18px] font-bold tracking-tight text-[var(--color-ink)] line-clamp-1">{b.book.title}</h3>
                            <p className="text-[14px] font-[450] text-[var(--color-slate)] mt-1">{b.book.author}</p>
                         </div>
                      </div>

                      <div className="flex flex-wrap md:flex-nowrap items-center justify-between md:justify-end md:w-[55%] gap-4 md:gap-6 w-full mt-2 md:mt-0">
                         <div className="flex flex-col items-start md:items-center bg-white px-4 md:px-5 py-3 rounded-[16px] shadow-sm border border-black/5 w-full md:w-auto">
                            <span className="mc-eyebrow text-[var(--color-slate)] mb-1">Kode Booking</span>
                            <div className="flex items-center justify-between md:justify-center w-full gap-3">
                               <span className="text-[18px] md:text-[20px] font-mono font-bold tracking-[0.2em] text-[var(--color-ink)]">{b.code}</span>
                               <button onClick={() => copyCode(b.code)} className="text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors p-1" title="Salin Kode">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                               </button>
                            </div>
                         </div>
                         
                         <div className="flex flex-col items-start md:items-center w-full md:w-auto border-t md:border-t-0 border-black/5 pt-3 md:pt-0">
                            <span className="mc-eyebrow text-[var(--color-slate)] mb-1 md:mb-2">Batas Pengambilan</span>
                            <span className="text-[13px] md:text-[14px] font-[500] text-[var(--color-ink)]">
                               {new Date(b.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}<br className="hidden md:block"/>
                               <span className="hidden md:inline"> </span>
                               <span className="text-[12px] font-normal text-[var(--color-slate)]">{new Date(b.expiresAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                         </div>
                         
                         <div className="flex justify-end absolute md:relative top-6 right-6 md:top-auto md:right-auto">
                            <button onClick={() => setCancelTarget(b)}
                               className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center text-[var(--color-signal)] shadow-sm hover:bg-[var(--color-signal)] hover:text-white transition-all border border-black/5" title="Batalkan Booking">
                               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                         </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History Bookings Section */}
            <div>
              <h2 className="mc-heading-3 text-[var(--color-ink)] mb-6">Riwayat Booking</h2>
              
              {historyBookings.length === 0 ? (
                <div className="px-8 py-24 text-center bg-white/60 backdrop-blur-sm rounded-[40px] text-[var(--color-slate)] text-[16px] font-[450]">Belum ada riwayat pemesanan buku.</div>
              ) : (
                <div className="space-y-4">
                  {historyBookings.map((b) => (
                    <div key={b.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 md:px-8 py-4 md:py-5 bg-white/40 backdrop-blur-sm rounded-[32px] border border-black/5 hover:bg-white/60 transition-colors">
                      
                      <div className="flex items-center gap-4 md:w-[50%]">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-black/5 ${
                            b.status === 'completed' 
                              ? 'bg-[var(--color-ink)]/5 text-[var(--color-ink)]' 
                              : 'bg-[var(--color-lifted-cream)] text-[var(--color-slate)]'
                         }`}>
                            {b.status === 'completed' ? (
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            )}
                         </div>
                         <div>
                            <h3 className="text-[16px] font-bold text-[var(--color-ink)] line-clamp-1">{b.book.title}</h3>
                            <p className="text-[13px] font-[450] text-[var(--color-slate)]">{b.book.author}</p>
                         </div>
                      </div>

                      <div className="flex items-center justify-between md:w-[50%] gap-4 w-full mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-black/5">
                         <div className="flex flex-col items-start md:items-center">
                            <span className="text-[13px] md:text-[14px] font-[450] text-[var(--color-ink)]">{new Date(b.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            {b.code && <span className="text-[11px] md:text-[12px] font-mono text-[var(--color-slate)]">{b.code}</span>}
                         </div>
                         
                         <div>
                            {statusBadge(b.status)}
                         </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      <ConfirmModal
        open={cancelTarget !== null}
        title="Batalkan Booking"
        message={`Yakin ingin membatalkan booking untuk "${cancelTarget?.book?.title}"?`}
        onConfirm={handleCancel}
        onCancel={() => { if (!cancelling) setCancelTarget(null) }}
      />
    </AdminLayout>
  )
}
