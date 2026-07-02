'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AdminLayout } from '@/components/admin-layout'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Pagination } from '@/components/pagination'
import { Toast } from '@/components/toast'
import { useUser } from '@/lib/auth-context'
import { CardSkeleton } from '@/components/skeleton'

interface Book {
  id: number
  title: string
  author: string
  coverImage: string | null
  stock: number
  category: { name: string }
}

interface Category {
  id: number
  name: string
}

export default function CatalogPage() {
  const { user } = useUser()
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    fetch('/api/categories', { cache: 'no-store' })
      .then((r) => r.json())
      .then((cats) => setCategories(cats.categories))
      .catch(() => {})
      .finally(() => { fetchBooks(); setLoading(false) })
  }, [])

  useEffect(() => {
    fetchBooks()
  }, [categoryId])

  async function fetchBooks(q?: string, p?: number) {
    const params = new URLSearchParams()
    if (q || search) params.set('search', q || search)
    if (categoryId) params.set('categoryId', categoryId)
    params.set('page', String(p || page))

    try {
      const res = await fetch(`/api/books?${params}`)
      if (!res.ok) throw new Error('Gagal memuat buku')
      const data = await res.json()
      setBooks(data.books)
      if (data.meta) {
        setPage(data.meta.page)
        setTotalPages(data.meta.totalPages)
        setTotal(data.meta.total)
      }
    } catch {
      setToast({ type: 'error', message: 'Gagal memuat data buku' })
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchBooks(search, 1)
  }

  function onPageChange(p: number) {
    fetchBooks(search, p)
  }

  const content = (
    <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-[#dceeb1] rounded-[24px] p-6 mb-6">
        <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40 mb-1">Katalog Buku</p>
        <h1 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-black mb-4">Jelajahi Koleksi Buku</h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul atau pengarang..."
              className="w-full px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[16px] font-light text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition" />
            <button type="submit"
              className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition shrink-0">Cari</button>
          </form>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
            className="w-full sm:w-auto px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[16px] font-light text-black focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition">
            <option value="">Semua Kategori</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? <CardSkeleton count={4} /> : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {books.map((book) => (
          <Link key={book.id} href={`/catalog/${book.id}`} className="bg-white rounded-[24px] border border-[#e6e6e6] overflow-hidden transition hover:bg-[#f7f7f5]">
            <div className="aspect-[3/4] bg-[#f7f7f5] flex items-center justify-center relative">
              {book.coverImage ? (
                <Image src={book.coverImage} alt={book.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
              ) : (
                <span className="text-[32px] text-black/20 font-light">?</span>
              )}
            </div>
            <div className="p-4">
              <span className="inline-flex px-2 py-0.5 rounded-[50px] text-[11px] font-light bg-[#f7f7f5] text-black/60 mb-2">{book.category.name}</span>
              <h3 className="text-[15px] font-bold text-black line-clamp-2">{book.title}</h3>
              <p className="text-[13px] font-light text-black/40 mt-1">{book.author}</p>
              {book.stock > 0 ? (
                <span className="inline-flex px-2.5 py-0.5 rounded-[50px] text-[12px] font-light mt-2 bg-[#c8e6cd] text-black">
                  Tersedia ({book.stock})
                </span>
              ) : (
                <span className="inline-flex px-2.5 py-0.5 rounded-[50px] text-[12px] font-light mt-2 bg-[#f3c9b6] text-black">
                  Stok Habis
                </span>
              )}
            </div>
          </Link>
        ))}
        {!loading && books.length === 0 && (
          <p className="col-span-full text-[15px] font-light text-black/40 text-center py-8">Buku tidak ditemukan</p>
        )}
        {!loading && <Pagination page={page} totalPages={totalPages} total={total} onPageChange={onPageChange} />}
      </div>
      )}
    </main>
  )

  if (user) {
    return <AdminLayout>{toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}{content}</AdminLayout>
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <nav className="bg-white border-b border-[#e6e6e6] px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
