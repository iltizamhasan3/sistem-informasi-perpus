'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Pagination } from '@/components/pagination'
import { ConfirmModal } from '@/components/confirm-modal'
import { Toast } from '@/components/toast'
import { TableSkeleton } from '@/components/skeleton'

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
    <div>
      <div className="bg-[#efd4d4] rounded-[24px] p-8 md:p-12 mb-8">
        <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40 mb-3">Anggota</p>
        <h1 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-black">Anggota</h1>
        <p className="text-[18px] font-light leading-relaxed text-black/50 mt-3 max-w-xl">Kelola data anggota perpustakaan</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full max-w-[240px] px-[14px] py-[10px] bg-white border border-[#e6e6e6] rounded-[50px] text-[15px] font-light text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition" />
          <button type="submit"
            className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition">Cari</button>
        </form>
        <div className="flex gap-2">
          <button onClick={exportCSV} disabled={exporting}
            className="px-5 py-[10px] bg-white text-black rounded-[50px] text-[14px] font-light border border-[#e6e6e6] hover:bg-[#f7f7f5] transition disabled:opacity-40">
            {exporting ? 'Mengekspor...' : 'Export CSV'}
          </button>
          <Link href="/members/create"
            className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition">+ Tambah Anggota</Link>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-[#e6e6e6] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-[#efd4d4]/15">
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Nama</th>
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Telepon</th>
              <th className="text-center px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Status</th>
              <th className="text-center px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Transaksi</th>
              <th className="text-right px-4 py-3 text-[13px] font-light text-black/50 uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageLoading ? (
              <tr><td colSpan={6}><TableSkeleton rows={5} cols={6} /></td></tr>
            ) : members.map((m) => (
              <tr key={m.id} className="border-b border-[#f1f1f1] hover:bg-[#c5b0f4]/8 transition">
                <td className="px-4 py-3 text-[15px] font-light text-black">{m.name}</td>
                <td className="px-4 py-3 text-[15px] font-light text-black/50">{m.email}</td>
                <td className="px-4 py-3 text-[15px] font-light text-black/50">{m.phone || '-'}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleActive(m.id, m.isActive)}
                    className={`inline-flex px-3 py-1 rounded-[50px] text-[13px] font-light ${
                      m.isActive ? 'bg-[#c8e6cd] text-black' : 'bg-[#f3c9b6] text-black'
                    }`}>
                    {m.isActive ? 'Aktif' : 'Nonaktif'}
                  </button>
                </td>
                <td className="px-4 py-3 text-center text-[15px] font-light text-black/50">{m._count.transactions}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link href={`/members/${m.id}/edit`} className="text-[14px] font-light text-[#60619C]/60 hover:text-[#60619C] transition">Edit</Link>
                  <button onClick={() => setDeleteId(m.id)} className="text-[14px] font-light text-[#60619C]/60 hover:text-[#60619C] transition">Hapus</button>
                </td>
              </tr>
            ))}
            {!pageLoading && members.length === 0 && (
              <tr><td colSpan={6} className="text-[15px] font-light text-black/40 text-center py-8">Belum ada anggota</td></tr>
            )}
          </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={onPageChange} />

      <ConfirmModal
        open={deleteId !== null}
        title="Hapus Anggota"
        message="Yakin ingin menghapus anggota ini? Tindakan ini tidak dapat dibatalkan."
        loading={deleting}
        onConfirm={() => deleteId !== null && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  )
}
