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
    <div className="relative w-full z-10">
      
      {/* Ghost Watermark */}
      <div className="absolute -top-16 -left-10 md:-left-24 z-[-1] pointer-events-none overflow-hidden w-[150%] whitespace-nowrap">
         <h1 className="mc-ghost-watermark select-none text-[120px] md:text-[240px]">CATEGORIES</h1>
      </div>

      <div className="mc-card-stadium p-6 md:p-12 mb-16 relative overflow-hidden flex items-end min-h-[250px] md:min-h-[300px]">
        <div className="absolute -top-10 -right-10 opacity-10 md:opacity-5 pointer-events-none">
          <h1 className="text-[100px] md:text-[200px] font-bold tracking-tighter leading-none" style={{ fontFamily: 'var(--font-display)' }}>CATEGORIES</h1>
        </div>
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between md:items-end gap-6">
           <div className="w-full md:w-auto min-w-0">
              <p className="mc-eyebrow text-[var(--color-slate)] mb-4">Klasifikasi Literatur</p>
              <h1 className="mc-heading-1 text-[var(--color-ink)] break-words break-all sm:break-normal">Kategori<br/>Buku</h1>
           </div>
           <p className="text-[18px] font-[450] text-[var(--color-slate)] max-w-sm text-right pb-2">
             Kelola dan kelompokkan literatur perpustakaan untuk mempermudah sirkulasi.
           </p>
        </div>
      </div>

      {error && (
        <div className="px-6 py-4 text-[15px] font-[500] text-[var(--color-signal)] bg-white rounded-[24px] mb-8 shadow-sm border border-[var(--color-signal)]/20">{error}</div>
      )}

      {/* Tambah Kategori */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <h3 className="mc-heading-3 text-[var(--color-ink)]">Daftar Kategori</h3>
        
        <form onSubmit={handleCreate} className="relative flex items-center w-full md:w-[400px]">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Tambah kategori baru..."
            className="w-full pl-6 pr-32 py-4 bg-white border-none rounded-full text-[16px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] transition-shadow shadow-[0_8px_24px_rgba(0,0,0,0.04)]" />
          <button type="submit" disabled={loading || !name.trim()}
            className="absolute right-2 mc-btn-primary px-6 py-2.5 rounded-full disabled:opacity-50">
            {loading ? '...' : '+ Tambah'}
          </button>
        </form>
      </div>

      {/* Pill Rows List */}
      <div className="space-y-4">
         {pageLoading ? (
            <div className="flex justify-center py-24"><LoadingSpinner /></div>
         ) : categories.length === 0 ? (
            <div className="px-8 py-24 text-center bg-white/60 backdrop-blur-sm rounded-[40px] text-[var(--color-slate)] text-[16px] font-[450]">Belum ada kategori</div>
         ) : (
            categories.map((cat) => (
               <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 md:px-8 py-5 md:py-6 bg-[var(--color-lifted-cream)] rounded-[24px] shadow-sm hover:shadow-md transition-shadow group">
                  
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 rounded-full bg-[var(--color-ink)]/5 text-[var(--color-ink)] flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                     </div>
                     <span className="text-[18px] font-[500] text-[var(--color-ink)]">{cat.name}</span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-12 sm:w-1/2">
                     <div className="flex flex-col text-right">
                        <span className="mc-eyebrow text-[var(--color-slate)] mb-1">Jumlah Buku</span>
                        <span className="text-[16px] font-[500] text-[var(--color-ink)]">{cat._count.books} pcs</span>
                     </div>
                     
                     <button onClick={() => setDeleteId(cat.id)} className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[var(--color-signal)] opacity-100 sm:opacity-0 group-hover:opacity-100 shadow-sm hover:bg-[var(--color-signal)] hover:text-white transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                  </div>
               </div>
            ))
         )}
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
