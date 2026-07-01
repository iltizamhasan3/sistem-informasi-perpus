'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Toast } from '@/components/toast'
import { ConfirmModal } from '@/components/confirm-modal'

interface Booking {
  id: number
  code: string
  status: string
  expiresAt: string
  createdAt: string
  user: { id: number; name: string; email: string }
  book: { id: number; title: string; author: string }
}

export function MyBookingsClient({ user }: { user: { name: string; role: string } }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => { fetchBookings() }, [])

  async function fetchBookings() {
    setLoading(true)
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      setBookings(data.bookings ?? [])
    } catch {}
    setLoading(false)
  }

  async function handleCancel(id: number) {
    try {
      const res = await fetch(`/api/bookings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'cancel' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal membatalkan booking')
      }
      setToast({ type: 'success', message: 'Booking berhasil dibatalkan' })
      fetchBookings()
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Gagal' })
    }
    setCancelId(null)
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setToast({ type: 'success', message: 'Kode booking disalin: ' + code })
  }

  const active = bookings.filter((b) => b.status === 'active')
  const history = bookings.filter((b) => b.status !== 'active')

  return (
    <AdminLayout initialUser={user}>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Booking Saya</h2>

        <div className="flex gap-2 border-b">
          <button onClick={() => setTab('active')} className={`px-4 py-2 text-sm font-medium border-b-2 transition ${tab === 'active' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>
            Aktif ({active.length})
          </button>
          <button onClick={() => setTab('history')} className={`px-4 py-2 text-sm font-medium border-b-2 transition ${tab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>
            Riwayat ({history.length})
          </button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {tab === 'active' && (
              <div className="space-y-3">
                {active.length === 0 ? (
                  <p className="text-gray-500 text-sm py-8 text-center">Tidak ada booking aktif</p>
                ) : active.map((b) => {
                  const expired = new Date(b.expiresAt) < new Date()
                  return (
                    <div key={b.id} className="bg-white border rounded-xl p-4 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-lg tracking-widest font-mono font-bold text-primary">{b.code}</span>
                          <button onClick={() => copyCode(b.code)} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded transition">Salin</button>
                        </div>
                        <p className="font-medium">{b.book.title}</p>
                        <p className="text-sm text-gray-500">{b.book.author}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Dibuat {new Date(b.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          {' — '}Berlaku sampai {new Date(b.expiresAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          {expired && <span className="text-red-600 ml-2 font-medium">(Expired)</span>}
                        </p>
                      </div>
                      <button onClick={() => setCancelId(b.id)} className="text-sm text-danger hover:underline shrink-0">Batalkan</button>
                    </div>
                  )
                })}
              </div>
            )}

            {tab === 'history' && (
              <div className="bg-white border rounded-xl overflow-x-auto">
                {history.length === 0 ? (
                  <p className="text-gray-500 text-sm py-8 text-center">Belum ada riwayat booking</p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-primary-light">
                      <tr>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Kode</th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Buku</th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Dibuat</th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((b) => (
                        <tr key={b.id} className="border-t">
                          <td className="px-4 py-3 font-mono text-sm font-medium">{b.code}</td>
                          <td className="px-4 py-3 text-sm">{b.book.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{new Date(b.createdAt).toLocaleDateString('id-ID')}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              b.status === 'completed' ? 'bg-green-100 text-green-700' :
                              b.status === 'expired' ? 'bg-danger-light text-danger' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {b.status === 'completed' ? 'Selesai' : b.status === 'expired' ? 'Expired' : 'Dibatalkan'}
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

      <ConfirmModal
        open={cancelId !== null}
        title="Batalkan Booking"
        message="Yakin ingin membatalkan booking ini? Stok buku akan dikembalikan."
        onConfirm={() => handleCancel(cancelId!)}
        onCancel={() => setCancelId(null)}
      />
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </AdminLayout>
  )
}
