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
      const res = await fetch('/api/categories', { cache: 'no-store' })
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
      <div className="bg-[#c8e6cd] rounded-[24px] p-8 md:p-12 mb-8">
        <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40 mb-3">Kategori</p>
        <h1 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-black">Kategori Buku</h1>
        <p className="text-[18px] font-light leading-relaxed text-black/50 mt-3 max-w-xl">Kelola kategori buku perpustakaan</p>
      </div>

      {error && (
        <div className="px-4 py-3 text-[15px] font-light text-black bg-[#f3c9b6] rounded-[8px] mb-6">{error}</div>
      )}

      <form onSubmit={handleCreate} className="flex items-center gap-3 mb-6">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Nama kategori baru"
          className="w-full max-w-[240px] px-[14px] py-[10px] bg-white border border-[#e6e6e6] rounded-[50px] text-[15px] font-light text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition" />
        <button type="submit" disabled={loading || !name.trim()}
          className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition disabled:opacity-40">
          {loading ? 'Menyimpan...' : 'Tambah'}
        </button>
      </form>

      <div className="bg-white rounded-[24px] border border-[#e6e6e6] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
          <thead>
            <tr className="bg-[#c8e6cd]/15">
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Nama</th>
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Jumlah Buku</th>
              <th className="text-right px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageLoading ? (
              <tr><td colSpan={3}><LoadingSpinner /></td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="border-b border-[#f1f1f1] hover:bg-[#c5b0f4]/8 transition">
                <td className="px-4 py-3 text-[15px] font-light text-black">{cat.name}</td>
                <td className="px-4 py-3 text-[15px] font-light text-black/50">{cat._count.books} buku</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setDeleteId(cat.id)} className="text-[14px] font-light text-[#60619C]/60 hover:text-[#60619C] transition">Hapus</button>
                </td>
              </tr>
            ))}
            {!pageLoading && categories.length === 0 && (
              <tr><td colSpan={3} className="text-[15px] font-light text-black/40 text-center py-8">Belum ada kategori</td></tr>
            )}
          </tbody>
          </table>
        </div>
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
