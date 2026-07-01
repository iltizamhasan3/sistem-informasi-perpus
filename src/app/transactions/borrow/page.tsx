'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Toast } from '@/components/toast'
import { ConfirmModal } from '@/components/confirm-modal'

interface Book { id: number; title: string; author: string; stock: number }
interface Member { id: number; name: string; email: string }

export default function BorrowPage() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [bookId, setBookId] = useState('')
  const [memberId, setMemberId] = useState('')
  const [userRole, setUserRole] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [bookingCode, setBookingCode] = useState('')
  const [bookingData, setBookingData] = useState<{ id: number; code: string; user: { name: string; email: string }; book: { title: string }; expiresAt: string } | null>(null)
  const [bookingError, setBookingError] = useState('')
  const [bookingSearching, setBookingSearching] = useState(false)
  const [confirmBooking, setConfirmBooking] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/books').then((r) => r.json()),
      fetch('/api/members').then((r) => r.json()),
    ])
      .then(([auth, booksData, membersData]) => {
        if (auth.user) setUserRole(auth.user.role)
        setBooks(booksData.books || [])
        setMembers(membersData.members || [])
      })
      .catch(() => setError('Gagal memuat data'))
      .finally(() => setPageLoading(false))
  }, [])

  async function handleSearchBooking() {
    if (!bookingCode.trim()) { setBookingError('Masukkan kode booking'); return }
    setBookingSearching(true)
    setBookingError('')
    setBookingData(null)
    try {
      const res = await fetch(`/api/bookings?status=active`)
      const data = await res.json()
      const found = (data.bookings ?? []).find((b: { code: string }) => b.code === bookingCode.trim().toUpperCase())
      if (!found) {
        setBookingError('Kode booking tidak ditemukan atau sudah tidak aktif')
        return
      }
      setBookingData({ id: found.id, code: found.code, user: found.user, book: found.book, expiresAt: found.expiresAt })
    } catch {
      setBookingError('Gagal mencari booking')
    } finally {
      setBookingSearching(false)
    }
  }

  async function handleConfirmBooking() {
    setConfirming(true)
    try {
      const res = await fetch('/api/transactions/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingCode: bookingData!.code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal konfirmasi booking')
      setToast({ type: 'success', message: 'Booking berhasil dikonfirmasi! Transaksi tercatat.' })
      setConfirmBooking(false)
      setBookingData(null)
      setBookingCode('')
      setTimeout(() => router.push('/transactions'), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal')
      setConfirmBooking(false)
    } finally {
      setConfirming(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const body: Record<string, string> = { bookId }

    if (userRole === 'admin' && memberId) {
      body.memberId = memberId
    }

    try {
      const res = await fetch('/api/transactions/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal meminjam buku')
      setToast({ type: 'success', message: 'Buku berhasil dipinjam!' })
      setTimeout(() => router.push('/transactions'), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal meminjam buku')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Peminjaman Buku</h2>

      {pageLoading ? <LoadingSpinner /> : (
        <div className="space-y-8">
          {userRole === 'admin' && (
            <div className="bg-white rounded-xl shadow-sm border p-6 max-w-lg">
              <h3 className="font-semibold mb-4">Konfirmasi Kode Booking</h3>
              <div className="flex gap-2 mb-3">
                <input type="text" value={bookingCode} onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode booking"
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary uppercase" />
                <button onClick={handleSearchBooking} disabled={bookingSearching}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition disabled:opacity-50">
                  {bookingSearching ? 'Mencari...' : 'Cari'}
                </button>
              </div>
              {bookingError && <p className="text-sm text-red-600 mb-2">{bookingError}</p>}

              {bookingData && (
                <div className="bg-primary-light rounded-lg p-4 space-y-2">
                  <p className="text-lg tracking-widest font-mono font-bold text-primary">{bookingData.code}</p>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-500">Anggota:</span> {bookingData.user.name} ({bookingData.user.email})</p>
                    <p><span className="text-gray-500">Buku:</span> {bookingData.book.title}</p>
                    <p><span className="text-gray-500">Booking:</span> {new Date(bookingData.expiresAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <button onClick={() => setConfirmBooking(true)} disabled={confirming}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50">
                    Konfirmasi & Buat Transaksi
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4 text-gray-500">Pinjam Langsung</h3>
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 max-w-lg space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

              {userRole === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anggota</label>
                  <select value={memberId} onChange={(e) => setMemberId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Pilih anggota</option>
                    {members.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buku</label>
                <select value={bookId} onChange={(e) => setBookId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Pilih buku</option>
                  {books.filter((b) => b.stock > 0).map((b) => (
                    <option key={b.id} value={b.id}>{b.title} - {b.author} (stok: {b.stock})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading || !bookId || (userRole === 'admin' && !memberId)}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
                  {loading ? 'Memproses...' : 'Pinjam Buku'}
                </button>
                <button type="button" onClick={() => router.push('/transactions')}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmBooking && bookingData !== null}
        title="Konfirmasi Booking"
        message={`Yakin ingin mengkonfirmasi booking ${bookingData?.code} untuk ${bookingData?.user?.name}? Transaksi akan tercatat dengan masa pinjam 5 hari.`}
        onConfirm={handleConfirmBooking}
        onCancel={() => setConfirmBooking(false)}
      />
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  )
}
