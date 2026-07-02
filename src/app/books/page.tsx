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
  category: { name: string }
  _count: { transactions: number }
}

export default function BooksPage() {
  const { user } = useUser()
  const [books, setBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageLoading, setPageLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    fetchBooks().finally(() => setPageLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchBooks(q?: string, p?: number) {
    try {
      const params = new URLSearchParams()
      if (q || search) params.set('search', q || search)
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
    fetchBooks(search, p)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchBooks(search)
  }

  async function exportCSV() {
    try {
      const res = await fetch(`/api/books?limit=all`)
      const data = await res.json()
      const list = data.books || data
      const rows = [['Judul', 'Pengarang', 'Penerbit', 'Kategori', 'Stok', 'Dipinjam'].join(',')]
      for (const b of list) {
        rows.push([`"${b.title}"`, `"${b.author}"`, `"${b.publisher || ''}"`, `"${b.category.name}"`, b.stock, b._count?.transactions || 0].join(','))
      }
      const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'buku.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch {
      setToast({ type: 'error', message: 'Gagal mengekspor data' })
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus buku')
      setToast({ type: 'success', message: 'Buku berhasil dihapus' })
      fetchBooks(search)
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Gagal menghapus buku' })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div>
      <div className="bg-[#c5b0f4] rounded-[24px] p-8 md:p-12 mb-8">
        <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40 mb-3">Buku</p>
        <h1 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-black">Buku</h1>
        <p className="text-[18px] font-light leading-relaxed text-black/50 mt-3 max-w-xl">Kelola koleksi buku perpustakaan</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau pengarang..."
            className="w-full max-w-[240px] px-[14px] py-[10px] bg-white border border-[#e6e6e6] rounded-[50px] text-[15px] font-light text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition" />
          <button type="submit"
            className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition">Cari</button>
        </form>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={exportCSV}
              className="px-5 py-[10px] bg-white text-black rounded-[50px] text-[14px] font-light border border-[#e6e6e6] hover:bg-[#f7f7f5] transition">Export CSV</button>
            <Link href="/books/create"
              className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition">+ Tambah Buku</Link>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[24px] border border-[#e6e6e6] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-[#c5b0f4]/15">
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide w-16"></th>
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Judul</th>
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Pengarang</th>
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Kategori</th>
              <th className="text-center px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Stok</th>
              <th className="text-center px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Dipinjam</th>
              {isAdmin && <th className="text-right px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {pageLoading ? (
              <tr><td colSpan={isAdmin ? 7 : 6}><TableSkeleton rows={5} cols={isAdmin ? 6 : 5} /></td></tr>
            ) : books.map((book) => (
              <tr key={book.id} className="border-b border-[#f1f1f1] hover:bg-[#c5b0f4]/8 transition">
                <td className="px-4 py-3">
                  {book.coverImage ? (
                    <Image src={book.coverImage} alt="" width={40} height={56} className="object-cover border border-[#e6e6e6] rounded-[8px]" />
                  ) : (
                    <div className="w-10 h-14 bg-[#f7f7f5] rounded-[8px] flex items-center justify-center text-[13px] font-light text-black/20">-</div>
                  )}
                </td>
                <td className="px-4 py-3 text-[15px] font-light text-black">{book.title}</td>
                <td className="px-4 py-3 text-[15px] font-light text-black/50">{book.author}</td>
                <td className="px-4 py-3 text-[15px] font-light text-black/50">{book.category.name}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-3 py-1 rounded-[50px] text-[13px] font-light ${book.stock <= 2 ? 'bg-[#f3c9b6] text-black' : 'bg-[#c8e6cd] text-black'}`}>{book.stock}</span>
                </td>
                <td className="px-4 py-3 text-center text-[15px] font-light text-black/50">{book._count.transactions}</td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link href={`/books/${book.id}/edit`} className="text-[14px] font-light text-[#60619C]/60 hover:text-[#60619C] transition">Edit</Link>
                    <button onClick={() => setDeleteId(book.id)} className="text-[14px] font-light text-[#60619C]/60 hover:text-[#60619C] transition">Hapus</button>
                  </td>
                )}
              </tr>
            ))}
            {!pageLoading && books.length === 0 && (
              <tr><td colSpan={isAdmin ? 7 : 6} className="text-[15px] font-light text-black/40 text-center py-8">Belum ada buku</td></tr>
            )}
          </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={onPageChange} />

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
