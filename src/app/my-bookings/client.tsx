'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ConfirmModal } from '@/components/confirm-modal'
import { Toast } from '@/components/toast'

interface BookingItem {
  id: number
  code: string
  status: string
  createdAt: string
  expiresAt: string
  book: { id: number; title: string; author: string }
}

export function MyBookingsClient({ user }: { user: { name: string; role: string } }) {
  const [items, setItems] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState<BookingItem | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function fetchBookings() {
    setLoading(true)
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

  const activeBookings = items.filter((b) => b.status === 'active')
  const historyBookings = items.filter((b) => b.status !== 'active')

  return (
    <AdminLayout initialUser={user}>
      <div className="space-y-8">
        <div className="bg-[#f4ecd6] rounded-[24px] p-6">
          <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40">Riwayat</p>
          <h1 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-black mt-1">Booking &amp; Riwayat</h1>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {activeBookings.length > 0 && (
              <div>
                <h2 className="text-[18px] font-bold text-black mb-3">Booking Aktif</h2>
                <div className="space-y-3">
                  {activeBookings.map((b) => (
                    <div key={b.id} className="bg-white rounded-[12px] border border-[#e6e6e6] p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex px-2 py-0.5 rounded-[50px] text-[11px] font-light bg-[#c5b0f4] text-black">
                              Booking
                            </span>
                            <span className="inline-flex px-2 py-0.5 rounded-[50px] text-[11px] font-light bg-[#dceeb1] text-black">
                              Menunggu
                            </span>
                          </div>
                          <h3 className="text-[16px] font-bold text-black">{b.book.title}</h3>
                          <p className="text-[14px] font-light text-black/50 mt-0.5">{b.book.author}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-[20px] font-mono font-bold tracking-widest text-black">{b.code}</span>
                          <button onClick={() => copyCode(b.code)}
                            className="px-3 py-1.5 bg-white text-black rounded-[50px] text-[12px] font-light border border-[#e6e6e6] hover:bg-[#f7f7f5] transition">
                            Salin
                          </button>
                        </div>
                        <button onClick={() => setCancelTarget(b)}
                          className="px-4 py-1.5 bg-white text-black/50 rounded-[50px] text-[12px] font-light border border-[#e6e6e6] hover:text-black hover:bg-[#f3c9b6]/30 transition">
                          Batalkan
                        </button>
                      </div>
                      <div className="mt-2 text-[12px] font-light text-black/40">
 Berlaku hingga {new Date(b.expiresAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-[18px] font-bold text-black mb-3">Riwayat</h2>
              {historyBookings.length === 0 ? (
                <p className="text-[15px] font-light text-black/40 text-center py-8">Belum ada riwayat</p>
              ) : (
                <div className="space-y-3">
                  {historyBookings.map((b) => (
                    <div key={b.id} className="bg-white rounded-[12px] border border-[#e6e6e6] p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex px-2 py-0.5 rounded-[50px] text-[11px] font-light bg-[#c5b0f4] text-black">
                              Booking
                            </span>
                          </div>
                          <h3 className="text-[16px] font-bold text-black">{b.book.title}</h3>
                          <p className="text-[14px] font-light text-black/50 mt-0.5">{b.book.author}</p>
                        </div>
                        <span className={`inline-flex px-3 py-1 rounded-[50px] text-[13px] font-light shrink-0 ${
                          b.status === 'completed' ? 'bg-[#c8e6cd] text-black' :
                          b.status === 'expired' ? 'bg-[#f3c9b6] text-black' :
                          'bg-[#f7f7f5] text-black/50'
                        }`}>
                          {b.status === 'completed' ? 'Selesai' : b.status === 'expired' ? 'Expired' : 'Dibatalkan'}
                        </span>
                      </div>
                      <div className="mt-3">
                        <span className="text-[13px] font-light text-black/40">
                          {new Date(b.createdAt).toLocaleDateString('id-ID')}
                        </span>
                        {b.code && (
                          <span className="ml-3 text-[12px] font-mono text-black/30">{b.code}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        open={cancelTarget !== null}
        title="Batalkan Booking"
        message={`Yakin ingin membatalkan booking untuk "${cancelTarget?.book?.title}"?`}
        onConfirm={handleCancel}
        onCancel={() => { if (!cancelling) setCancelTarget(null) }}
      />
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </AdminLayout>
  )
}
