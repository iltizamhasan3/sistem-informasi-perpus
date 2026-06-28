'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Pagination } from '@/components/pagination'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ConfirmModal } from '@/components/confirm-modal'
import { Toast } from '@/components/toast'

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
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageLoading, setPageLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchMembers().finally(() => setPageLoading(false)) }, [])

  async function fetchMembers(p?: number) {
    try {
      const params = new URLSearchParams()
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
    fetchMembers(p)
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Anggota</h2>
        <Link href="/members/create"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm">
          + Tambah Anggota
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary-light">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Nama</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Telepon</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Transaksi</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageLoading ? (
              <tr><td colSpan={6}><LoadingSpinner /></td></tr>
            ) : members.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{m.email}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{m.phone || '-'}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleActive(m.id, m.isActive)}
                    className={`text-xs px-2 py-1 rounded-full ${
                      m.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {m.isActive ? 'Aktif' : 'Nonaktif'}
                  </button>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-500">{m._count.transactions}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Link href={`/members/${m.id}/edit`} className="text-sm text-primary hover:underline">Edit</Link>
                  <button onClick={() => setDeleteId(m.id)} className="text-sm text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
            {!pageLoading && members.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Belum ada anggota</td></tr>
            )}
          </tbody>
        </table>
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
