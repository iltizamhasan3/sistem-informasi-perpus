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
      <div className="bg-[#dceeb1] rounded-[24px] px-6 py-5 mb-8">
        <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40">Transaksi</p>
        <h2 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-black mt-1">Peminjaman Buku</h2>
      </div>

      {pageLoading ? <LoadingSpinner /> : (
        <div className="space-y-10">
          {userRole === 'admin' && (
            <div className="bg-white rounded-[24px] border border-[#e6e6e6] p-8 max-w-lg">
              <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40">Booking</p>
              <h3 className="text-[18px] font-light leading-relaxed text-black/50 mt-1 mb-5">Konfirmasi Kode Booking</h3>
              <div className="flex gap-2 mb-4">
                <input type="text" value={bookingCode} onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode booking"
                  className="flex-1 px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[16px] font-light text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition" />
                <button onClick={handleSearchBooking} disabled={bookingSearching}
                  className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition disabled:opacity-40 shrink-0">
                  {bookingSearching ? 'Mencari...' : 'Cari'}
                </button>
              </div>
              {bookingError && <p className="text-[15px] font-light text-black/50 mb-3">{bookingError}</p>}

              {bookingData && (
                <div className="bg-[#f7f7f5] rounded-[12px] p-6 space-y-3">
                  <p className="text-lg tracking-widest font-mono font-bold text-black">{bookingData.code}</p>
                  <div className="text-[15px] font-light text-black space-y-1">
                    <p><span className="text-black/40">Anggota:</span> {bookingData.user.name} ({bookingData.user.email})</p>
                    <p><span className="text-black/40">Buku:</span> {bookingData.book.title}</p>
                    <p><span className="text-black/40">Booking:</span> {new Date(bookingData.expiresAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <button onClick={() => setConfirmBooking(true)} disabled={confirming}
                    className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition disabled:opacity-40">
                    Konfirmasi & Buat Transaksi
                  </button>
                </div>
              )}
            </div>
          )}

          <div>
            <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40">Langsung</p>
            <h3 className="text-[18px] font-light leading-relaxed text-black/50 mt-1 mb-5">Pinjam Langsung</h3>
            <form onSubmit={handleSubmit} className="bg-white rounded-[24px] border border-[#e6e6e6] p-8 max-w-lg space-y-5">
              {error && (
                <div className="bg-[#f3c9b6]/30 text-black p-4 rounded-[12px] text-[15px] font-light border border-block-coral">
                  {error}
                </div>
              )}

              {userRole === 'admin' && (
                <div>
                  <label className="text-[15px] font-light text-black mb-2 block">Anggota</label>
                  <select value={memberId} onChange={(e) => setMemberId(e.target.value)}
                    className="w-full px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[16px] font-light text-black focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition">
                    <option value="">Pilih anggota</option>
                    {members.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[15px] font-light text-black mb-2 block">Buku</label>
                <select value={bookId} onChange={(e) => setBookId(e.target.value)}
                  className="w-full px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[16px] font-light text-black focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition">
                  <option value="">Pilih buku</option>
                  {books.filter((b) => b.stock > 0).map((b) => (
                    <option key={b.id} value={b.id}>{b.title} - {b.author} (stok: {b.stock})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading || !bookId || (userRole === 'admin' && !memberId)}
                  className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition disabled:opacity-40">
                  {loading ? 'Memproses...' : 'Pinjam Buku'}
                </button>
                <button type="button" onClick={() => router.push('/transactions')}
                  className="px-5 py-[10px] bg-white text-black rounded-[50px] text-[14px] font-light border border-[#e6e6e6] hover:bg-[#f7f7f5] transition">
                  Batal
                </button>
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
