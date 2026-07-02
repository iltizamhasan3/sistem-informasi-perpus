'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AdminLayout } from '@/components/admin-layout'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchBooks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Sleek Search Header */}
      <div className="bg-gradient-to-r from-[#c5b0f4]/15 via-[#9fbee7]/15 to-[#FAF9F5] border border-black/5 rounded-[32px] p-8 mb-8 relative overflow-hidden shadow-sm">
        <div className="absolute right-[-10%] top-[-20%] w-[250px] h-[250px] bg-[#c5b0f4]/20 rounded-full blur-[40px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <p className="font-mono text-[12px] uppercase tracking-wider text-black/50 mb-2">Katalog Perpustakaan</p>
          <h1 className="text-[36px] font-extrabold tracking-tight leading-tight text-black mb-6 font-display">
            Jelajahi Dunia Lewat Buku
          </h1>

          <div className="flex flex-col md:flex-row gap-3 w-full">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-black/30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                </span>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari judul, pengarang, penerbit..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-black/5 rounded-2xl text-[15px] text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-[#60619C] shadow-sm transition-all" />
              </div>
              <button type="submit"
                className="px-6 py-3.5 btn-gradient rounded-2xl text-[14px] font-semibold transition-all shadow-md shrink-0">
                Cari
              </button>
            </form>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
              className="w-full md:w-auto px-4 py-3.5 bg-white border border-black/5 rounded-2xl text-[15px] text-black/85 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-[#60619C] shadow-sm transition-all">
              <option value="">Semua Kategori</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Book Grid */}
      {loading ? <CardSkeleton count={8} /> : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link key={book.id} href={`/catalog/${book.id}`} 
                className="glass-card hover-scale-card rounded-[24px] overflow-hidden flex flex-col h-full">
                <div className="aspect-[3/4] bg-black/5 flex items-center justify-center relative overflow-hidden group">
                  {book.coverImage ? (
                    <Image src={book.coverImage} alt={book.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-black/20">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="text-[12px] font-medium tracking-wide">Sampul Kosong</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#60619C]/10 text-[#3d4f97] mb-3">
                      {book.category.name}
                    </span>
                    <h3 className="text-[15px] font-bold text-black leading-snug line-clamp-2 font-display hover:text-[#3D4F97] transition-all">
                      {book.title}
                    </h3>
                    <p className="text-[13px] font-light text-black/50 mt-1">{book.author}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
                    {book.stock > 0 ? (
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700">
                        Tersedia ({book.stock})
                      </span>
                    ) : (
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-700">
                        Stok Habis
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!loading && books.length === 0 && (
            <div className="text-center py-16 glass-card rounded-[24px] p-8 max-w-md mx-auto">
              <svg className="w-12 h-12 text-black/20 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-[16px] font-bold text-black mb-1">Buku Tidak Ditemukan</h3>
              <p className="text-[14px] font-light text-black/50">Coba gunakan kata kunci pencarian yang lain.</p>
            </div>
          )}

          {!loading && books.length > 0 && (
            <div className="mt-10 flex justify-center">
              <Pagination page={page} totalPages={totalPages} total={total} onPageChange={onPageChange} />
            </div>
          )}
        </div>
      )}
    </main>
  )

  if (user) {
    return <AdminLayout>{toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}{content}</AdminLayout>
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#c5b0f4]/10 rounded-full blur-[60px] pointer-events-none" />
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      {/* Navbar for Guest */}
      <nav className="sticky top-0 z-50 glass-header">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 6v13" /><path d="M12 6a4 4 0 0 0-4-4H2v16h6a4 4 0 0 1 4 4" /><path d="M12 6a4 4 0 0 1 4-4h6v16h-6a4 4 0 0 0-4 4" />
              </svg>
            </div>
            <span className="text-[16px] font-bold text-black font-display">SiPustaka</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-5 py-[8px] text-[14px] font-medium text-black/80 hover:bg-black/5 rounded-full transition-all">Masuk</Link>
            <Link href="/register" className="px-5 py-[9px] btn-gradient text-[14px] font-medium rounded-full transition-all shadow-sm">Daftar</Link>
          </div>
        </div>
      </nav>
      {content}
    </div>
  )
}
