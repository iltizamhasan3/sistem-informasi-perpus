'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Pagination } from '@/components/pagination'
import { ConfirmModal } from '@/components/confirm-modal'
import { Toast } from '@/components/toast'
import { LoadingSpinner } from '@/components/loading-spinner'

interface Member {
  id: number
  name: string
  email: string
  phone: string | null
  isActive: boolean
  createdAt: string
  _count: { transactions: number }
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageLoading, setPageLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [exporting, setExporting] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toggleData, setToggleData] = useState<{ id: number; current: boolean } | null>(null)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetchMembers().finally(() => setPageLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchMembers(q?: string, p?: number) {
    try {
      const params = new URLSearchParams()
      if (q || search) params.set('search', q || search)
      params.set('page', String(p || page))
      const res = await fetch(`/api/members?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memuat anggota')
      setMembers(data.members)
      if (data.meta) {
        setTotal(data.meta.total)
        setTotalPages(data.meta.totalPages)
        setPage(data.meta.page)
      }
    } catch {
      setToast({ type: 'error', message: 'Gagal memuat data anggota' })
    }
  }

  function onPageChange(p: number) {
    fetchMembers(search, p)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchMembers(search)
  }

  async function exportCSV() {
    setExporting(true)
    try {
      const res = await fetch(`/api/members?limit=all`)
      const data = await res.json()
      const list = data.members || data
      const rows = [['Nama', 'Email', 'Telepon', 'Status', 'Transaksi'].join(',')]
      for (const m of list) {
        rows.push([`"${m.name}"`, `"${m.email}"`, `"${m.phone || ''}"`, m.isActive ? 'Aktif' : 'Nonaktif', m._count?.transactions || 0].join(','))
      }
      const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'anggota.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch {
      setToast({ type: 'error', message: 'Gagal mengekspor data' })
    } finally {
      setExporting(false)
    }
  }

  async function toggleActive(id: number, current: boolean) {
    setToggling(true)
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah status')
      setToast({ type: 'success', message: 'Status anggota berhasil diubah' })
      fetchMembers()
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Gagal mengubah status' })
    } finally {
      setToggling(false)
      setToggleData(null)
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus anggota')
      setToast({ type: 'success', message: 'Anggota berhasil dihapus' })
      fetchMembers()
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Gagal menghapus anggota' })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="relative w-full z-10">
      
      {/* Ghost Watermark */}
      <div className="absolute -top-16 -left-10 md:-left-24 z-[-1] pointer-events-none overflow-hidden w-[150%] whitespace-nowrap">
         <h1 className="mc-ghost-watermark select-none text-[120px] md:text-[240px]">USERS</h1>
      </div>

      <div className="mc-card-stadium p-6 md:p-12 mb-16 relative overflow-hidden flex items-end min-h-[250px] md:min-h-[300px]">
        <div className="absolute -top-10 -right-10 opacity-10 md:opacity-5 pointer-events-none">
          <h1 className="text-[100px] md:text-[200px] font-bold tracking-tighter leading-none" style={{ fontFamily: 'var(--font-display)' }}>USER</h1>
        </div>
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between md:items-end gap-6">
           <div className="w-full md:w-auto min-w-0">
              <p className="mc-eyebrow text-[var(--color-slate)] mb-4">Direktori Anggota</p>
              <h1 className="mc-heading-1 text-[var(--color-ink)] break-words break-all sm:break-normal">Anggota<br/>Perpustakaan</h1>
           </div>
           <p className="text-[18px] font-[450] text-[var(--color-slate)] max-w-sm text-right pb-2">
             Kelola keanggotaan, pantau sirkulasi peminjaman, dan lihat riwayat aktivitas pembaca.
           </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <form onSubmit={handleSearch} className="relative flex items-center w-full md:w-[400px]">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full pl-6 pr-14 py-4 bg-white border-none rounded-full text-[16px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] transition-shadow shadow-[0_8px_24px_rgba(0,0,0,0.04)]" />
          <button type="submit" className="absolute right-2 w-12 h-12 bg-[var(--color-ink)] rounded-full flex items-center justify-center hover:scale-[0.96] transition-transform">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </form>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <button onClick={exportCSV} disabled={exporting}
            className="mc-btn-secondary px-6 py-4 disabled:opacity-50 w-full sm:w-auto text-center">
            {exporting ? 'Mengekspor...' : 'Export CSV'}
          </button>
          <Link href="/members/create" className="mc-btn-primary px-8 py-4 whitespace-nowrap flex justify-center w-full sm:w-auto">
            Tambah Anggota
          </Link>
        </div>
      </div>

      {/* Pill Rows List */}
      <div className="space-y-4 mb-16">
         {pageLoading ? (
            <div className="flex justify-center py-24"><LoadingSpinner /></div>
         ) : members.length === 0 ? (
            <div className="px-8 py-24 text-center bg-white/60 backdrop-blur-sm rounded-[40px] text-[var(--color-slate)] text-[16px] font-[450]">Belum ada data anggota</div>
         ) : (
            members.map((m) => (
               <div key={m.id} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-6 md:px-8 py-5 md:py-6 bg-[var(--color-lifted-cream)] rounded-[32px] shadow-sm hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition-shadow group">
                  
                  {/* Name & Avatar */}
                  <div className="flex items-center gap-6 lg:w-[30%]">
                     <div className="w-14 h-14 shrink-0 rounded-full bg-[var(--color-ink)] text-white flex items-center justify-center font-bold text-xl shadow-md">
                        {m.name.charAt(0).toUpperCase()}
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[18px] font-[500] text-[var(--color-ink)] mb-1">{m.name}</span>
                        <span className="text-[14px] font-[450] text-[var(--color-slate)]">{m.email}</span>
                     </div>
                  </div>

                  {/* Phone & Status */}
                  <div className="flex items-center justify-between lg:w-[40%] gap-6">
                     <div className="flex flex-col items-center text-center">
                        <span className="mc-eyebrow text-[var(--color-slate)] mb-1">Telepon</span>
                        <span className="text-[16px] font-[450] text-[var(--color-ink)]">{m.phone || '-'}</span>
                     </div>
                     <div className="flex flex-col items-center text-center">
                        <span className="mc-eyebrow text-[var(--color-slate)] mb-2">Status</span>
                        <button onClick={() => m.isActive ? setToggleData({ id: m.id, current: m.isActive }) : toggleActive(m.id, m.isActive)}
                           className={`inline-flex px-4 py-1.5 rounded-full text-[13px] font-[500] border transition-colors ${
                              m.isActive ? 'border-[var(--color-ink)]/20 text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-white' : 'border-[var(--color-signal)] text-[var(--color-signal)] hover:bg-[var(--color-signal)] hover:text-white'
                           }`}>
                           {m.isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                     </div>
                     <div className="flex flex-col items-center text-center">
                        <span className="mc-eyebrow text-[var(--color-slate)] mb-1">Transaksi</span>
                        <span className="text-[16px] font-[500] text-[var(--color-ink)]">{m._count.transactions}</span>
                     </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 lg:w-[20%]">
                     <Link href={`/members/${m.id}/edit`} className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[var(--color-ink)] shadow-sm hover:bg-[var(--color-ink)] hover:text-white transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                     </Link>
                     <button onClick={() => setDeleteId(m.id)} className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[var(--color-signal)] shadow-sm hover:bg-[var(--color-signal)] hover:text-white transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                  </div>

               </div>
            ))
         )}
      </div>

      <div className="flex justify-center mb-16">
        <div className="bg-white/60 backdrop-blur-md rounded-full px-4 py-2 border border-[#e6e6e6]">
           <Pagination page={page} totalPages={totalPages} total={total} onPageChange={onPageChange} />
        </div>
      </div>

      <ConfirmModal
        open={deleteId !== null}
        title="Hapus Anggota"
        message="Yakin ingin menghapus anggota ini? Tindakan ini tidak dapat dibatalkan."
        loading={deleting}
        onConfirm={() => deleteId !== null && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmModal
        open={toggleData !== null}
        title="Nonaktifkan Anggota"
        message="Yakin ingin menonaktifkan anggota ini? Mereka tidak akan bisa meminjam buku atau menyewa e-book."
        loading={toggling}
        onConfirm={() => toggleData !== null && toggleActive(toggleData.id, toggleData.current)}
        onCancel={() => setToggleData(null)}
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  )
}
