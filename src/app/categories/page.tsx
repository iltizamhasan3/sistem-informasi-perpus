'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ConfirmModal } from '@/components/confirm-modal'
import { Toast } from '@/components/toast'

interface Category {
  id: number
  name: string
  _count: { books: number }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchCategories().finally(() => setPageLoading(false))
  }, [])

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memuat kategori')
      setCategories(data.categories)
    } catch {
      setError('Gagal memuat data kategori')
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menambah kategori')
      setName('')
      setToast({ type: 'success', message: 'Kategori berhasil ditambahkan' })
      fetchCategories()
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Gagal menambah kategori' })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus kategori')
      setToast({ type: 'success', message: 'Kategori berhasil dihapus' })
      fetchCategories()
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Gagal menghapus kategori' })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Kategori Buku</h2>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kategori baru"
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : 'Tambah'}
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary-light">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Nama</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Jumlah Buku</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageLoading ? (
              <tr><td colSpan={3}><LoadingSpinner /></td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="border-t">
                <td className="px-4 py-3">{cat.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{cat._count.books} buku</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {!pageLoading && categories.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  Belum ada kategori
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={deleteId !== null}
        title="Hapus Kategori"
        message="Yakin ingin menghapus kategori ini? Buku dalam kategori ini tidak akan terhapus."
        loading={deleting}
        onConfirm={() => deleteId !== null && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  )
}
