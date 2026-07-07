'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AdminLayout } from '@/components/admin-layout'
import { useUser } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import { Skeleton } from '@/components/skeleton'

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
  const { user } = useUser()
  const { addToCart, cart, setCartOpen } = useCart()
  const [book, setBook] = useState<BookDetail | null>(null)
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
      fetch('/api/ebooks/my').then((r) => r.json()).catch(() => ({ active: [] })),
    ]).then(([bookData, ebData]) => {
      if (bookData.book) setBook(bookData.book)
      const found = (ebData.active ?? []).find((r: { bookId: number }) => r.bookId === Number(id))
      if (found) setActiveRental({ id: found.id })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  async function handleAddToCart() {
    if (!book) return
    if (cart.length >= 3) {
      setMessage({ type: 'error', text: 'Keranjang penuh (Maksimal 3 buku).' })
      return
    }
    if (cart.find(c => c.id === book.id)) {
      setCartOpen(true)
      return
    }
    addToCart({
      id: book.id,
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      stock: book.stock,
    })
    setMessage({ type: 'success', text: 'Buku berhasil ditambahkan ke keranjang!' })
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
    <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
      
      {/* Ghost Watermark Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[-1] pointer-events-none w-full text-center mt-[-60px]">
         <h1 className="mc-ghost-watermark select-none text-[120px] md:text-[240px]">BOOK</h1>
      </div>

      <div className="mc-card-stadium p-6 md:p-12 mb-6">
        <div className="mb-8 border-b border-[var(--color-ink)]/5 pb-6">
          <Link href="/catalog" className="inline-flex items-center gap-2 text-[14px] font-[500] text-[var(--color-slate)] hover:text-[var(--color-ink)] transition mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Kembali ke Katalog
          </Link>
          <div className="flex items-center gap-3">
             <p className="mc-eyebrow text-[var(--color-slate)]">Detail Buku</p>
             {book && (
               <span className="inline-flex px-3 py-1 rounded-full text-[12px] font-[500] bg-[var(--color-ink)]/5 text-[var(--color-ink)]">
                 {book.category.name}
               </span>
             )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="md:flex gap-8">
              <Skeleton className="w-full md:w-64 aspect-[3/4] rounded-[24px]" />
              <div className="flex-1 space-y-4 mt-6 md:mt-0">
                <Skeleton className="h-10 w-3/4 rounded-full" />
                <Skeleton className="h-6 w-1/2 rounded-full" />
                <Skeleton className="h-4 w-1/3 rounded-full" />
                <Skeleton className="h-24 w-full rounded-[16px]" />
              </div>
            </div>
          </div>
        ) : !book ? (
          <p className="text-[16px] font-[450] text-[var(--color-slate)] text-center py-12">Buku tidak ditemukan</p>
        ) : (
          <div className="md:flex gap-10">
            <div className="md:w-[280px] shrink-0">
              <div className="rounded-[24px] overflow-hidden bg-black/5 shadow-sm border border-black/5">
                {book.coverImage ? (
                  <Image src={book.coverImage} alt={book.title} width={280} height={380} className="w-full aspect-[3/4] object-cover" />
                ) : (
                  <div className="w-full aspect-[3/4] flex items-center justify-center">
                    <span className="text-[40px] text-[var(--color-slate)]/30 font-bold">?</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 mt-8 md:mt-0">
              <h1 className="text-[36px] font-bold tracking-tight leading-[1.1] text-[var(--color-ink)]">{book.title}</h1>
              <p className="text-[20px] font-[450] text-[var(--color-slate)] mt-2">{book.author}</p>

              <div className="mt-6 space-y-2 text-[15px] font-[450] text-[var(--color-slate)] bg-[var(--color-canvas-cream)]/50 p-4 rounded-[16px] border border-[var(--color-ink)]/5">
                {book.publisher && <p><strong className="text-[var(--color-ink)] font-[500]">Penerbit:</strong> {book.publisher}</p>}
                {book.year && <p><strong className="text-[var(--color-ink)] font-[500]">Tahun:</strong> {book.year}</p>}
              </div>

              {book.description && (
                <div className="mt-8">
                  <h3 className="text-[16px] font-[500] text-[var(--color-ink)] mb-3">Sinopsis</h3>
                  <p className="text-[15px] font-[450] text-[var(--color-slate)] leading-relaxed whitespace-pre-line">{book.description}</p>
                </div>
              )}

              {message && (
                <div className={`mt-8 rounded-[16px] p-5 text-[15px] font-[500] ${
                  message.type === 'success' ? 'bg-[#c8e6cd] text-[#1e4b26]' : 'bg-[#fff5f2] text-[var(--color-signal)] border border-[var(--color-signal)]/10'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-8 pt-8 border-t border-[var(--color-ink)]/5">
                <div className="flex-1">
                  <span className="text-[15px] font-[500] text-[var(--color-ink)]">Sisa stok fisik: <span className="text-[var(--color-slate)]">{book.stock}</span></span>
                  {book.stock <= 0 && (
                    <span className="ml-3 inline-flex px-3 py-1 rounded-full text-[12px] font-[500] bg-[var(--color-signal)]/10 text-[var(--color-signal)]">
                      Kosong
                    </span>
                  )}
                </div>
                
                {book.stock > 0 && user?.role === 'member' && (
                  <button onClick={handleAddToCart}
                    className="mc-btn-primary px-8">
                    Tambah ke Keranjang
                  </button>
                )}
                {book.stock > 0 && !user && (
                  <Link href="/login" className="mc-btn-secondary px-6">
                    Masuk untuk booking
                  </Link>
                )}
              </div>

              {book.isEbook && (
                <div className="mt-8 pt-8 border-t border-[var(--color-ink)]/5">
                  <h3 className="text-[16px] font-[500] text-[var(--color-ink)] mb-4">E-book Digital</h3>
                  {rentMsg && (
                    <div className={`mb-4 rounded-[16px] p-5 text-[15px] font-[500] ${
                      rentMsg.type === 'success' ? 'bg-[#c8e6cd] text-[#1e4b26]' : 'bg-[#fff5f2] text-[var(--color-signal)] border border-[var(--color-signal)]/10'
                    }`}>
                      {rentMsg.text}
                    </div>
                  )}
                  {activeRental ? (
                    <Link href={`/reader/${activeRental.id}`}
                      className="mc-btn-primary px-8 inline-block">
                      Mulai Membaca E-book
                    </Link>
                  ) : user?.role === 'member' ? (
                    <button onClick={handleRentEbook} disabled={renting}
                      className="mc-btn-primary px-8">
                      {renting ? 'Memproses...' : 'Sewa E-book'}
                    </button>
                  ) : !user ? (
                    <Link href="/login" className="mc-btn-secondary px-6 inline-block">
                      Masuk untuk baca E-book
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )

  if (user) {
    return <AdminLayout>{content}</AdminLayout>
  }

  return (
    <div className="min-h-screen bg-[var(--color-canvas-cream)] relative overflow-hidden font-sans">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--color-signal)] flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
               </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-[500] text-xl tracking-tight leading-none text-[var(--color-ink)]">SiPustaka</span>
              <span className="text-[12px] text-[var(--color-slate)] font-[450] leading-none mt-1">by Perpustakaan AA</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[15px] font-[500] text-[var(--color-ink)] hover:text-[var(--color-signal)] transition-colors">Masuk</Link>
            <Link href="/register" className="mc-btn-primary px-6 py-2">Daftar</Link>
          </div>
        </div>
      </nav>
      {content}
    </div>
  )
}
