'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin-layout'

interface Book {
  id: number
  title: string
  author: string
  publisher: string | null
  year: number | null
  description: string | null
  stock: number
  coverImage: string | null
  category: { name: string }
}

interface Category {
  id: number
  name: string
}

export default function CatalogPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [user, setUser] = useState<{ id: number; name: string; role: string } | null>(null)
  const [bookingId, setBookingId] = useState<number | null>(null)
  const [bookingCode, setBookingCode] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ]).then(([cats, auth]) => {
      setCategories(cats.categories)
      setUser(auth.user || null)
    }).catch(() => {}).finally(() => { fetchBooks(); setLoading(false) })
  }, [])

  useEffect(() => {
    fetchBooks()
  }, [categoryId])

  async function fetchBooks(q?: string) {
    const params = new URLSearchParams()
    if (q || search) params.set('search', q || search)
    if (categoryId) params.set('categoryId', categoryId)

    const res = await fetch(`/api/books?${params}`)
    const data = await res.json()
    setBooks(data.books)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchBooks()
  }

  async function handleBooking(bookId: number) {
    setBookingId(bookId)
    setMessage(null)
    setBookingCode(null)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Gagal booking' })
      } else {
        setBookingCode(data.booking.code)
        setMessage({ type: 'success', text: `Booking berhasil! Kode: ${data.booking.code}` })
        fetchBooks()
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' })
    } finally {
      setBookingId(null)
    }
  }

  const content = (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6">Katalog Buku</h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau pengarang..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          <button type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm">Cari</button>
        </form>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Semua Kategori</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {message && (
        <div className={`col-span-full mb-4 px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {message.text}
          {bookingCode && (
            <div className="mt-2">
              <span className="text-lg tracking-widest font-mono font-bold bg-green-100 px-3 py-1 rounded">{bookingCode}</span>
              <p className="mt-1 text-xs text-green-600">Tunjukkan kode ini ke admin di perpustakaan untuk mengambil buku. Booking berlaku 24 jam.</p>
            </div>
          )}
          <button onClick={() => { setMessage(null); setBookingCode(null) }} className="float-right font-bold">&times;</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <div key={book.id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition">
            {book.coverImage && (
              <img src={book.coverImage} alt={book.title} className="w-full h-40 object-contain mb-3 rounded" />
            )}
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg leading-tight">{book.title}</h3>
              <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded shrink-0 ml-2">
                {book.category.name}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">{book.author}</p>
            {book.publisher && <p className="text-xs text-gray-500 mb-1">{book.publisher}{book.year ? ` (${book.year})` : ''}</p>}
            {book.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{book.description}</p>}
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-sm font-medium ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {book.stock > 0 ? `Tersedia (${book.stock})` : 'Stok Habis'}
              </span>
              {book.stock > 0 && user?.role === 'member' && (
                <button onClick={() => handleBooking(book.id)} disabled={bookingId === book.id}
                  className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
                  {bookingId === book.id ? 'Memproses...' : 'Booking'}
                </button>
              )}
              {book.stock > 0 && !user && (
                <Link href="/login" className="text-xs text-primary hover:underline">Masuk untuk booking</Link>
              )}
            </div>
          </div>
        ))}
        {!loading && books.length === 0 && (
          <p className="col-span-full text-center text-gray-500 py-12">Buku tidak ditemukan</p>
        )}
      </div>
      )}
    </main>
  )

  if (user) {
    return <AdminLayout initialUser={user}>{content}</AdminLayout>
  }

  return (
    <div className="min-h-screen bg-page">
      <nav className="bg-white border-b px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">SiPustaka</Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-primary hover:underline">Masuk</Link>
            <Link href="/register" className="text-sm bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark">Daftar</Link>
          </div>
        </div>
      </nav>
      {content}
    </div>
  )
}
