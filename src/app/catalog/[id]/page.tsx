'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin-layout'
import { LoadingSpinner } from '@/components/loading-spinner'

interface BookDetail {
  id: number
  title: string
  author: string
  publisher: string | null
  year: number | null
  description: string | null
  stock: number
  coverImage: string | null
  isEbook: boolean
  category: { id: number; name: string }
}

export default function BookDetailPage() {
  const { id } = useParams()
  const [book, setBook] = useState<BookDetail | null>(null)
  const [user, setUser] = useState<{ id: number; name: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [bookingCode, setBookingCode] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [renting, setRenting] = useState(false)
  const [rentMsg, setRentMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeRental, setActiveRental] = useState<{ id: number } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/books/${id}`).then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/ebooks/my').then((r) => r.json()).catch(() => ({ active: [] })),
    ]).then(([bookData, auth, ebData]) => {
      if (bookData.book) setBook(bookData.book)
      if (auth.user) setUser(auth.user)
      const found = (ebData.active ?? []).find((r: { bookId: number }) => r.bookId === Number(id))
      if (found) setActiveRental({ id: found.id })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  async function handleBooking() {
    if (!book) return
    setBooking(true)
    setMessage(null)
    setBookingCode(null)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Gagal booking' })
      } else {
        setBookingCode(data.booking.code)
        setMessage({ type: 'success', text: 'Booking berhasil!' })
        setBook((prev) => prev ? { ...prev, stock: prev.stock - 1 } : prev)
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' })
    } finally {
      setBooking(false)
    }
  }

  async function handleRentEbook() {
    if (!book) return
    setRenting(true)
    setRentMsg(null)
    try {
      const res = await fetch('/api/ebooks/rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRentMsg({ type: 'error', text: data.error || 'Gagal sewa e-book' })
      } else {
        setActiveRental({ id: data.rental.id })
        setRentMsg({ type: 'success', text: 'E-book berhasil disewa! Kamu bisa membaca selama 2 hari.' })
      }
    } catch {
      setRentMsg({ type: 'error', text: 'Terjadi kesalahan' })
    } finally {
      setRenting(false)
    }
  }

  const content = (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-[#efd4d4] rounded-[24px] p-6 mb-6">
        <Link href="/catalog" className="inline-flex items-center gap-1 text-[14px] font-light text-black/60 hover:text-black transition mb-2">
          &larr; Kembali ke Katalog
        </Link>
        <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40">Detail Buku</p>
        {book && (
          <span className="inline-flex px-3 py-1 rounded-[50px] text-[13px] font-light bg-white/60 text-black mt-2">
            {book.category.name}
          </span>
        )}
      </div>

      {loading ? <LoadingSpinner /> : !book ? (
        <p className="text-[15px] font-light text-black/40 text-center py-8">Buku tidak ditemukan</p>
      ) : (
        <div className="bg-white rounded-[24px] border border-[#e6e6e6] overflow-hidden">
          <div className="md:flex">
            <div className="md:w-64 shrink-0 bg-[#f7f7f5]">
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} className="w-full aspect-[3/4] object-cover" />
              ) : (
                <div className="w-full aspect-[3/4] flex items-center justify-center">
                  <span className="text-[32px] text-black/20 font-light">?</span>
                </div>
              )}
            </div>
            <div className="p-6 md:p-8 flex-1 min-w-0">
              <h1 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-black">{book.title}</h1>
              <p className="text-[18px] font-light text-black/50 mt-1">{book.author}</p>

              <div className="mt-4 space-y-1 text-[15px] font-light text-black/60">
                {book.publisher && <p>Penerbit: {book.publisher}</p>}
                {book.year && <p>Tahun: {book.year}</p>}
              </div>

              {book.description && (
                <div className="mt-6 pt-6 border-t border-[#e6e6e6]">
                  <p className="text-[15px] font-light text-black mb-2">Sinopsis</p>
                  <p className="text-[15px] font-light text-black/60 leading-relaxed whitespace-pre-line">{book.description}</p>
                </div>
              )}

              {message && (
                <div className={`mt-6 rounded-[12px] p-4 text-[15px] font-light text-black ${
                  message.type === 'success' ? 'bg-[#c8e6cd]' : 'bg-[#f3c9b6]'
                }`}>
                  {message.text}
                  {bookingCode && (
                    <div className="mt-2">
                      <span className="inline-block px-3 py-1.5 bg-white rounded-[8px] text-[16px] font-mono font-bold tracking-widest">
                        {bookingCode}
                      </span>
                      <p className="mt-1 text-[13px] text-black/60">
                        Tunjukkan kode ini ke admin di perpustakaan untuk mengambil buku. Booking berlaku 24 jam.
                      </p>
                      <Link href="/my-bookings" className="mt-2 inline-block text-[13px] text-black/50 hover:text-black underline transition">
                        Lihat di Riwayat
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-[#e6e6e6]">
                <span className="text-[15px] font-light text-black">Sisa stok: {book.stock}</span>
                {book.stock > 0 && user?.role === 'member' && (
                  <button onClick={handleBooking} disabled={booking}
                    className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition disabled:opacity-40">
                    {booking ? 'Memproses...' : 'Booking Buku'}
                  </button>
                )}
                {book.stock > 0 && !user && (
                  <Link href="/login" className="text-[14px] font-light text-black/50 hover:underline">
                    Masuk untuk booking
                  </Link>
                )}
                {book.stock <= 0 && (
                  <span className="inline-flex px-3 py-1 rounded-[50px] text-[13px] font-light bg-[#f3c9b6] text-black">
                    Tidak tersedia
                  </span>
                )}
              </div>

              {book.isEbook && (
                <div className="mt-6 pt-6 border-t border-[#e6e6e6]">
                  <p className="text-[15px] font-light text-black mb-2">E-book</p>
                  {rentMsg && (
                    <div className={`mb-3 rounded-[12px] p-4 text-[15px] font-light text-black ${
                      rentMsg.type === 'success' ? 'bg-[#c8e6cd]' : 'bg-[#f3c9b6]'
                    }`}>
                      {rentMsg.text}
                    </div>
                  )}
                  {activeRental ? (
                    <Link href={`/reader/${activeRental.id}`}
                      className="inline-block px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition">
                      Baca E-book
                    </Link>
                  ) : user?.role === 'member' ? (
                    <button onClick={handleRentEbook} disabled={renting}
                      className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition disabled:opacity-40">
                      {renting ? 'Memproses...' : 'Sewa E-book (2 hari)'}
                    </button>
                  ) : !user ? (
                    <Link href="/login" className="text-[14px] font-light text-black/50 hover:underline">
                      Masuk untuk sewa e-book
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )

  if (user) {
    return <AdminLayout initialUser={user}>{content}</AdminLayout>
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <nav className="bg-white border-b border-[#e6e6e6] px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="bg-black text-white rounded-full px-2.5 py-0.5 text-sm font-black tracking-wider">S</span>
            <span className="text-black text-[15px] font-light">SiPustaka</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-5 py-[10px] text-black rounded-[50px] text-[14px] font-light hover:bg-[#f7f7f5] transition">Masuk</Link>
            <Link href="/register" className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition">Daftar</Link>
          </div>
        </div>
      </nav>
      {content}
    </div>
  )
}
