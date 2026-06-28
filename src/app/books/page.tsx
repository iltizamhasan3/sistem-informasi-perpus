'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Pagination } from '@/components/pagination'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ConfirmModal } from '@/components/confirm-modal'
import { Toast } from '@/components/toast'

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
  const [books, setBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageLoading, setPageLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchBooks().finally(() => setPageLoading(false))
  }, [])

  async function fetchBooks(q?: string, p?: number) {
    try {
      const params = new URLSearchParams()
      if (q || search) params.set('search', q || search)
      params.set('page', String(p || page))
      const res = await fetch(`/api/books?${params}`)
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Daftar Buku</h2>
        <Link
          href="/books/create"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm"
        >
          + Tambah Buku
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul atau pengarang..."
          className="flex-1 max-w-md px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-100 border rounded-lg hover:bg-gray-200 transition text-sm"
        >
          Cari
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary-light">
            <tr>
              <th className="w-12 px-2 py-3"></th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Judul</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Pengarang</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Kategori</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Stok</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Dipinjam</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageLoading ? (
              <tr><td colSpan={7}><LoadingSpinner /></td></tr>
            ) : books.map((book) => (
              <tr key={book.id} className="border-t">
                <td className="px-2 py-3">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt="" className="w-10 h-14 object-cover rounded" />
                  ) : (
                    <div className="w-10 h-14 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">-</div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{book.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{book.author}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{book.category.name}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm ${book.stock <= 2 ? 'text-red-600 font-medium' : ''}`}>
                    {book.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-500">
                  {book._count.transactions}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Link
                    href={`/books/${book.id}/edit`}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteId(book.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {!pageLoading && books.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Belum ada buku
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
