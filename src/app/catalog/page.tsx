'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AdminLayout } from '@/components/admin-layout'
import { Pagination } from '@/components/pagination'
import { Toast } from '@/components/toast'
import { useUser } from '@/lib/auth-context'
import { LoadingSpinner } from '@/components/loading-spinner'

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
  const [type, setType] = useState('')
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
  }, [categoryId, type])

  async function fetchBooks(q?: string, p?: number) {
    const params = new URLSearchParams()
    if (q || search) params.set('search', q || search)
    if (categoryId) params.set('categoryId', categoryId)
    if (type) params.set('type', type)
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
    <div className="relative w-full z-10 px-4 max-w-7xl mx-auto">
      {/* Ghost Watermark */}
      <div className="absolute -top-16 -left-10 md:-left-24 z-[-1] pointer-events-none overflow-hidden w-[150%] whitespace-nowrap">
         <h1 className="mc-ghost-watermark select-none text-[120px] md:text-[240px]">PERPUS AA</h1>
      </div>

      <div className="mc-card-stadium p-6 md:p-12 mb-16 mt-8 relative overflow-hidden flex items-end min-h-[250px] md:min-h-[300px]">
        <div className="absolute -top-10 -right-10 opacity-10 md:opacity-5 pointer-events-none">
          <h1 className="text-[100px] md:text-[200px] font-bold tracking-tighter leading-none" style={{ fontFamily: 'var(--font-display)' }}>PERPUS AA</h1>
        </div>
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between md:items-end gap-6">
           <div>
              <p className="mc-eyebrow text-[var(--color-slate)] mb-4">Jelajahi Koleksi Resmi</p>
              <h1 className="mc-heading-1 text-[var(--color-ink)]">Katalog<br/>Perpustakaan AA</h1>
           </div>
           
           <div className="flex flex-col gap-3 md:gap-4 max-w-full w-full md:w-auto pb-2 md:pb-0">
             <form onSubmit={handleSearch} className="relative flex items-center w-full shrink-0">
               <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="Cari buku..."
                 className="w-full pl-6 pr-14 py-3.5 md:py-4 bg-white border border-[var(--color-ink)]/10 rounded-full text-[15px] md:text-[16px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:border-[var(--color-ink)]/40 transition-shadow shadow-sm" />
               <button type="submit" className="absolute right-2 w-10 h-10 md:w-12 md:h-12 bg-[var(--color-ink)] rounded-full flex items-center justify-center hover:scale-[0.96] transition-transform">
                 <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               </button>
             </form>
             
             <div className="flex flex-row gap-3 md:gap-4 w-full">
               <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                 className="flex-1 min-w-[140px] md:min-w-[180px] shrink-0 px-5 md:px-6 py-3.5 md:py-4 bg-white border border-[var(--color-ink)]/10 rounded-full text-[14px] md:text-[16px] font-[450] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]/40 transition-shadow shadow-sm appearance-none cursor-pointer whitespace-nowrap"
                 style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23141413\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.2rem center', backgroundSize: '1.2em', paddingRight: '2.8rem' }}>
                 <option value="">Semua Kategori</option>
                 {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
               
               <select value={type} onChange={(e) => setType(e.target.value)}
                 className="flex-1 min-w-[140px] md:min-w-[180px] shrink-0 px-5 md:px-6 py-3.5 md:py-4 bg-white border border-[var(--color-ink)]/10 rounded-full text-[14px] md:text-[16px] font-[450] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]/40 transition-shadow shadow-sm appearance-none cursor-pointer whitespace-nowrap"
                 style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23141413\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.2rem center', backgroundSize: '1.2em', paddingRight: '2.8rem' }}>
                 <option value="">Semua Format</option>
                 <option value="physical">Buku Fisik</option>
                 <option value="ebook">E-Book</option>
               </select>
             </div>
           </div>
        </div>
      </div>

      {/* Grid Buku */}
      {loading ? (
         <div className="flex justify-center py-48"><LoadingSpinner /></div>
      ) : books.length === 0 ? (
         <div className="py-32 text-center bg-white/40 rounded-[40px] border border-white/60 backdrop-blur-sm shadow-sm mb-16">
            <h3 className="mc-heading-3 text-[var(--color-slate)]">Buku tidak ditemukan.</h3>
            <p className="text-[16px] text-[var(--color-slate)]/70 mt-2">Coba gunakan kata kunci lain.</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 mb-24 mt-16 relative">
            {books.map((book, idx) => (
              <Link href={`/catalog/${book.id}`} key={book.id} className="flex flex-col items-center group relative cursor-pointer">
                 
                 <div className="relative mb-8 z-10">
                    {/* Rectangular Card Portrait */}
                    <div className="w-[180px] md:w-[220px] aspect-[3/4] rounded-[24px] overflow-hidden bg-white shadow-[0_16px_32px_rgba(0,0,0,0.06)] group-hover:shadow-[0_24px_48px_rgba(0,0,0,0.12)] transition-shadow duration-500 relative flex items-center justify-center">
                       {book.coverImage ? (
                          <Image src={book.coverImage} alt={book.title} fill className="object-cover object-center transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 180px, 220px" />
                       ) : (
                          <span className="text-[var(--color-slate)]/20 font-bold text-6xl" style={{ fontFamily: 'var(--font-display)' }}>?</span>
                       )}
                       <div className="absolute inset-0 rounded-[24px] border border-black/5 pointer-events-none"></div>
                    </div>
                 </div>

                 {/* Info Buku */}
                 <div className="flex flex-col items-center text-center max-w-[240px]">
                   <div className="flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-signal-light)]"></span>
                      <span className="mc-eyebrow text-[var(--color-slate)]">{book.category.name}</span>
                   </div>

                   <h3 className="text-[18px] font-bold tracking-tight text-[var(--color-ink)] line-clamp-2 mb-2 leading-snug group-hover:text-[var(--color-signal)] transition-colors">{book.title}</h3>
                   <p className="text-[15px] font-[450] text-[var(--color-slate)] mb-4">{book.author}</p>

                   {/* Status Label */}
                   {book.stock > 0 ? (
                      <span className="px-4 py-1.5 rounded-full text-[13px] font-[500] border border-[var(--color-ink)]/15 text-[var(--color-ink)] bg-white/50">
                         Tersedia ({book.stock})
                      </span>
                   ) : (
                      <span className="px-4 py-1.5 rounded-full text-[13px] font-[500] border border-[var(--color-signal)] text-[var(--color-signal)] bg-white/50">
                         Stok Habis
                      </span>
                   )}
                 </div>
              </Link>
            ))}
         </div>
      )}

      {/* Pagination Container */}
      {!loading && books.length > 0 && (
         <div className="flex justify-center mb-24">
           <div className="bg-white/60 backdrop-blur-md rounded-full px-4 py-2 border border-[#e6e6e6]">
              <Pagination page={page} totalPages={totalPages} total={total} onPageChange={onPageChange} />
           </div>
         </div>
      )}
    </div>
  )

  if (user) {
    return <AdminLayout>{toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}{content}</AdminLayout>
  }

  return (
    <div className="min-h-screen bg-[var(--color-canvas-cream)] relative overflow-hidden font-sans">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      {/* Navbar for Guest */}
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
