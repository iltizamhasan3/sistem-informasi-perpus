'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Toast } from '@/components/toast'
import { ConfirmModal } from '@/components/confirm-modal'
import { SearchableSelect } from '@/components/searchable-select'

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
  const [bookingData, setBookingData] = useState<{ baseCode: string; user: { name: string; email: string }; books: string[]; expiresAt: string } | null>(null)
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
      
      const inputCode = bookingCode.trim().toUpperCase()
      
      const foundBookings = (data.bookings ?? []).filter((b: { code: string }) => b.code === inputCode)
      
      if (foundBookings.length === 0) {
        setBookingError('Kode booking tidak ditemukan atau sudah tidak aktif')
        return
      }
      
      const first = foundBookings[0]
      
      setBookingData({ 
         baseCode: inputCode, 
         user: first.user, 
         books: foundBookings.map((b: any) => b.book.title), 
         expiresAt: first.expiresAt 
      })
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
        body: JSON.stringify({ bookingCode: bookingData!.baseCode }),
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
    <div className="relative w-full z-10">
      
      {/* Ghost Watermark Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[-1] pointer-events-none w-full text-center mt-[-60px]">
         <h1 className="mc-ghost-watermark select-none text-[90px] md:text-[200px]">BORROW</h1>
      </div>

      <div className="mc-card-stadium p-6 md:p-12 mb-10 mt-10 max-w-2xl mx-auto shadow-md">
        <div className="mb-10 text-center">
          <p className="mc-eyebrow text-[var(--color-slate)] mb-3">Transaksi</p>
          <h1 className="mc-heading-2 text-[var(--color-ink)]">Peminjaman Buku</h1>
          <p className="text-[16px] font-[450] text-[var(--color-slate)] mt-4 max-w-lg mx-auto">
            Pinjam buku baru atau konfirmasi booking anggota.
          </p>
        </div>

        {pageLoading ? <LoadingSpinner /> : (
          <div className="space-y-10">
            {userRole === 'admin' && (
              <div className="bg-white/40 p-6 md:p-8 rounded-[32px] border border-black/5">
                <p className="mc-eyebrow text-[var(--color-slate)] mb-5 text-center">Konfirmasi Kode Booking</p>
                <div className="flex flex-col sm:flex-row gap-4 mb-2">
                  <input type="text" value={bookingCode} onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                    placeholder="Masukkan kode booking"
                    className="flex-1 w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm" />
                  <button onClick={handleSearchBooking} disabled={bookingSearching}
                    className="mc-btn-primary px-8 py-4 w-full sm:w-auto flex justify-center items-center shadow-md shrink-0">
                    {bookingSearching ? 'Mencari...' : 'Cari'}
                  </button>
                </div>
                {bookingError && <p className="text-[14px] font-[500] text-[var(--color-signal)] mt-4 text-center">{bookingError}</p>}

                {bookingData && (
                  <div className="bg-white p-6 rounded-[24px] space-y-4 shadow-sm border border-black/5 mt-6">
                    <p className="text-xl tracking-widest font-mono font-bold text-center text-[var(--color-ink)]">{bookingData.baseCode}</p>
                    <div className="text-[14px] font-[450] text-[var(--color-ink)] space-y-2 border-t border-black/5 pt-4">
                      <p><span className="text-[var(--color-slate)]">Anggota:</span> {bookingData.user.name} ({bookingData.user.email})</p>
                      <p><span className="text-[var(--color-slate)]">Buku:</span> {bookingData.books.join(', ')}</p>
                      <p><span className="text-[var(--color-slate)]">Batas Waktu:</span> {new Date(bookingData.expiresAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <button onClick={() => setConfirmBooking(true)} disabled={confirming}
                      className="mc-btn-primary w-full py-3 mt-4 flex justify-center">
                      Konfirmasi & Buat Transaksi
                    </button>
                  </div>
                )}
              </div>
            )}

            <div>
              <p className="mc-eyebrow text-[var(--color-slate)] mb-6 text-center">Pinjam Langsung</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-[#fff5f2] border border-[var(--color-signal)]/10 text-[var(--color-signal)] px-6 py-4 rounded-[16px] text-[15px] font-[500] shadow-sm text-center">
                    {error}
                  </div>
                )}

                {userRole === 'admin' && (
                  <div>
                    <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4 mb-2 block">Pilih Anggota <span className="text-[var(--color-signal)]">*</span></label>
                    <SearchableSelect
                      value={memberId}
                      onChange={setMemberId}
                      options={members.map((m) => ({ id: m.id.toString(), label: `${m.name} (${m.email})` }))}
                      placeholder="Pilih anggota perpustakaan"
                      className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4 mb-2 block">Pilih Buku <span className="text-[var(--color-signal)]">*</span></label>
                  <SearchableSelect
                    value={bookId}
                    onChange={setBookId}
                    options={books.filter((b) => b.stock > 0).map((b) => ({ id: b.id.toString(), label: `${b.title} - ${b.author} (stok: ${b.stock})` }))}
                    placeholder="Pilih buku yang tersedia"
                    className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 mt-8 border-t border-[var(--color-ink)]/5">
                  <button type="submit" disabled={loading || !bookId || (userRole === 'admin' && !memberId)}
                    className="mc-btn-primary w-full sm:w-auto px-10 py-4 shadow-md disabled:opacity-50 flex justify-center items-center">
                    {loading ? 'Memproses...' : 'Pinjam Buku'}
                  </button>
                  <button type="button" onClick={() => router.push('/transactions')}
                    className="mc-btn-secondary w-full sm:w-auto px-10 py-4">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmBooking && bookingData !== null}
        title="Konfirmasi Booking"
        message={`Yakin ingin mengkonfirmasi booking ${bookingData?.baseCode} untuk ${bookingData?.user?.name}? Transaksi untuk ${bookingData?.books.length} buku akan tercatat dengan masa pinjam 5 hari.`}
        onConfirm={handleConfirmBooking}
        onCancel={() => setConfirmBooking(false)}
      />
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  )
}
