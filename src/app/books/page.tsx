'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Pagination } from '@/components/pagination'
import { ConfirmModal } from '@/components/confirm-modal'
import { Toast } from '@/components/toast'
import { useUser } from '@/lib/auth-context'
import { TableSkeleton } from '@/components/skeleton'

interface Book {
  id: number
  title: string
  author: string
  publisher: string | null
  stock: number
  coverImage: string | null
  category: { id: number; name: string }
  _count: { transactions: number }
}

interface Category {
  id: number
  name: string
}

export default function BooksPage() {
  const { user } = useUser()
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageLoading, setPageLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    fetchCategories()
    fetchBooks().finally(() => setPageLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (res.ok) setCategories(data.categories)
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchBooks(q?: string, cat?: string, p?: number) {
    try {
      const params = new URLSearchParams()
      const finalSearch = q !== undefined ? q : search
      const finalCat = cat !== undefined ? cat : categoryFilter
      if (finalSearch) params.set('search', finalSearch)
      if (finalCat) params.set('categoryId', finalCat)
      params.set('page', String(p || page))
      const res = await fetch(`/api/books?${params}`, { cache: 'no-cache' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memuat buku')
      setBooks(data.books)
      if (data.meta) {
        setTotal(data.meta.total)
        setTotalPages(data.meta.totalPages)
        setPage(data.meta.page)
      }
    } catch {
      setToast({ type: 'error', message: 'Gagal memuat data buku' })
    }
  }

  function onPageChange(p: number) {
    fetchBooks(search, categoryFilter, p)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchBooks(search, categoryFilter, 1)
  }

  function handleCategoryFilter(val: string) {
    setCategoryFilter(val)
    setPage(1)
    fetchBooks(search, val, 1)
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus buku')
      setToast({ type: 'success', message: 'Buku berhasil dihapus' })
      fetchBooks(search, categoryFilter)
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Gagal menghapus buku' })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="relative w-full z-10">
      
      {/* Ghost Watermark Background */}
      <div className="absolute -top-16 -left-10 md:-left-24 z-[-1] pointer-events-none overflow-hidden w-[150%] whitespace-nowrap">
         <h1 className="mc-ghost-watermark select-none text-[120px] md:text-[240px]">BOOKS</h1>
      </div>

      <div className="mc-card-stadium p-6 md:p-12 mb-16 relative overflow-hidden flex items-end min-h-[250px] md:min-h-[300px]">
        <div className="absolute -top-10 -right-10 opacity-10 md:opacity-5 pointer-events-none">
          <h1 className="text-[100px] md:text-[200px] font-bold tracking-tighter leading-none" style={{ fontFamily: 'var(--font-display)' }}>BOOKS</h1>
        </div>
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between md:items-end gap-6">
           <div className="w-full md:w-auto min-w-0">
              <p className="mc-eyebrow text-[var(--color-slate)] mb-4">Katalog Pusat</p>
              <h1 className="mc-heading-1 text-[var(--color-ink)] break-words break-all sm:break-normal">Koleksi<br/>Buku</h1>
           </div>
           <p className="text-[18px] font-[450] text-[var(--color-slate)] max-w-sm text-right pb-2">
             Jelajahi dan kelola katalog literatur perpustakaan kami.
           </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
         <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
            <form onSubmit={handleSearch} className="relative flex items-center w-full sm:w-[320px]">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari judul atau pengarang..."
                className="w-full pl-6 pr-14 py-3 bg-white border border-[var(--color-ink)]/10 rounded-full text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:border-[var(--color-ink)]/40 transition-colors shadow-sm" />
              <button type="submit" className="absolute right-1.5 w-9 h-9 bg-[var(--color-ink)] rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>

            <select
               value={categoryFilter}
               onChange={(e) => handleCategoryFilter(e.target.value)}
               className="w-full sm:w-auto pl-6 pr-12 py-3 bg-white border border-[var(--color-ink)]/10 rounded-full text-[15px] font-[450] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]/40 transition-colors shadow-sm appearance-none cursor-pointer"
               style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23141413\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.2rem center', backgroundSize: '1.2em' }}
            >
               <option value="">Semua Kategori</option>
               {categories.map(c => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
            </select>
         </div>
         
         {isAdmin && (
            <Link href="/books/create" className="mc-btn-primary py-3 px-8 w-full lg:w-auto whitespace-nowrap shrink-0 text-center">
               Tambah Buku
            </Link>
         )}
      </div>

      {/* Tabel Buku Clean Modern */}
      <div className="bg-white rounded-[24px] border border-[var(--color-ink)]/10 overflow-hidden shadow-sm mb-12">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-[var(--color-lifted-cream)]">
              <th className="text-left px-6 py-4 text-[13px] font-[500] text-[var(--color-slate)] uppercase tracking-wider">Buku</th>
              <th className="text-left px-6 py-4 text-[13px] font-[500] text-[var(--color-slate)] uppercase tracking-wider">Kategori</th>
              <th className="text-center px-6 py-4 text-[13px] font-[500] text-[var(--color-slate)] uppercase tracking-wider">Stok</th>
              <th className="text-center px-6 py-4 text-[13px] font-[500] text-[var(--color-slate)] uppercase tracking-wider">Dipinjam</th>
              <th className="text-right px-6 py-4 text-[13px] font-[500] text-[var(--color-slate)] uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageLoading ? (
              <tr><td colSpan={5}><TableSkeleton rows={5} cols={5} /></td></tr>
            ) : books.map((book) => (
              <tr key={book.id} className="border-b border-[var(--color-ink)]/5 hover:bg-[var(--color-lifted-cream)] transition-colors">
                <td className="px-6 py-4">
                   <div className="flex items-center gap-4">
                      {book.coverImage ? (
                         <div className="w-12 h-16 rounded-[8px] overflow-hidden shrink-0 relative bg-black/5">
                            <Image src={book.coverImage} alt={book.title} fill className="object-cover" sizes="48px" />
                         </div>
                      ) : (
                         <div className="w-12 h-16 rounded-[8px] bg-[var(--color-ink)]/5 flex items-center justify-center shrink-0">
                            <span className="text-[var(--color-slate)]/40 font-bold">?</span>
                         </div>
                      )}
                      <div>
                         <div className="text-[15px] font-[500] text-[var(--color-ink)] line-clamp-2 leading-snug">{book.title}</div>
                         <div className="text-[13px] font-[450] text-[var(--color-slate)] mt-1">{book.author}</div>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <span className="px-3 py-1 bg-[var(--color-ink)]/5 text-[var(--color-ink)] rounded-full text-[13px] font-[450] whitespace-nowrap">{book.category.name}</span>
                </td>
                <td className="px-6 py-4 text-center">
                   <span className={`text-[14px] font-[500] ${book.stock < 5 ? 'text-[var(--color-signal)]' : 'text-[var(--color-ink)]'}`}>{book.stock}</span>
                </td>
                <td className="px-6 py-4 text-center">
                   <span className="text-[14px] font-[450] text-[var(--color-slate)]">{book._count.transactions}</span>
                </td>
                <td className="px-6 py-4 text-right">
                   {isAdmin && (
                      <div className="flex items-center justify-end gap-3">
                         <Link href={`/books/${book.id}/edit`} className="text-[13px] font-[500] text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors">Edit</Link>
                         <button onClick={() => setDeleteId(book.id)} className="text-[13px] font-[500] text-[var(--color-signal)] hover:text-[#a03600] transition-colors">Hapus</button>
                      </div>
                   )}
                </td>
              </tr>
            ))}
            {!pageLoading && books.length === 0 && (
              <tr><td colSpan={5} className="text-[15px] font-[450] text-[var(--color-slate)] text-center py-12">Tidak ada buku ditemukan.</td></tr>
            )}
          </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center mb-16">
        <div className="bg-white/60 backdrop-blur-md rounded-full px-4 py-2 border border-[var(--color-ink)]/10">
           <Pagination page={page} totalPages={totalPages} total={total} onPageChange={onPageChange} />
        </div>
      </div>

      <ConfirmModal
        open={deleteId !== null}
        title="Hapus Buku"
        message="Yakin ingin menghapus buku ini? Tindakan ini tidak dapat dibatalkan."
        loading={deleting}
        onConfirm={() => deleteId !== null && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  )
}
