'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Toast } from '@/components/toast'

interface Transaction {
  id: number
  borrowDate: string
  dueDate: string
  fine: number
  status: string
  book: { id: number; title: string; author: string }
}

export function MyBorrowingsClient({ user }: { user: { name: string; role: string } }) {
  const [active, setActive] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    fetch('/api/transactions?status=borrowed&mine=true')
      .then((r) => { if (!r.ok) throw new Error('Gagal memuat peminjaman'); return r.json() })
      .then((data) => setActive(data.transactions ?? []))
      .catch(() => setToast({ type: 'error', message: 'Gagal memuat data peminjaman' }))
      .finally(() => setLoading(false))
  }, [])

  const totalFine = active.reduce((sum, t) => sum + (t.status === 'overdue' ? t.fine : 0), 0)

  return (
    <AdminLayout initialUser={user}>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <div className="space-y-4">
        <div className="bg-[#f3c9b6] rounded-[24px] p-6">
          <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40">Peminjaman</p>
          <h1 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-black mt-1">Peminjaman Aktif</h1>
        </div>

        {totalFine > 0 && (
          <div className="bg-[#f3c9b6] rounded-[12px] p-4 text-[15px] font-light text-black">
            Total denda belum dibayar: <strong>Rp {totalFine.toLocaleString('id-ID')}</strong>
          </div>
        )}

        {loading ? <LoadingSpinner /> : (
          <div className="space-y-3">
            {active.length === 0 ? (
              <p className="text-[15px] font-light text-black/40 text-center py-8">Tidak ada peminjaman aktif</p>
            ) : active.map((t) => {
              const now = new Date()
              const due = new Date(t.dueDate)
              const overdue = now > due
              const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              return (
                <div key={t.id} className="bg-white rounded-[12px] border border-[#e6e6e6] p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-[16px] font-bold text-black">{t.book.title}</h3>
                      <p className="text-[14px] font-light text-black/50 mt-0.5">{t.book.author}</p>
                    </div>
                    <span className={`inline-flex px-3 py-1 rounded-[50px] text-[13px] font-light shrink-0 ${
                      overdue ? 'bg-[#f3c9b6] text-black' : 'bg-[#c8e6cd] text-black'
                    }`}>
                      {overdue ? 'Terlambat' : 'Aktif'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[13px] font-light text-black/40">
                      Dipinjam {new Date(t.borrowDate).toLocaleDateString('id-ID')}
                      {' — '}Jatuh tempo {due.toLocaleDateString('id-ID')}
                      {' · '}{overdue ? `Terlambat ${Math.abs(diffDays)} hari` : diffDays === 0 ? 'Hari ini jatuh tempo' : `${diffDays} hari lagi`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
