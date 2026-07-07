'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { Toast } from '@/components/toast'
import { LoadingSpinner } from '@/components/loading-spinner'
import Image from 'next/image'

interface Transaction {
  id: number
  borrowDate: string
  dueDate: string
  fine: number
  status: string
  book: { id: number; title: string; author: string; coverImage?: string | null }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    <AdminLayout>
      <div className="relative w-full z-10">
        
        {/* Ghost Watermark */}
        <div className="absolute -top-16 -left-10 md:-left-24 z-[-1] pointer-events-none overflow-hidden w-[150%] whitespace-nowrap">
           <h1 className="mc-ghost-watermark select-none text-[120px] md:text-[240px]">BORROW</h1>
        </div>

        <div className="mc-card-stadium p-6 md:p-12 mb-12 relative overflow-hidden flex items-end min-h-[250px] md:min-h-[300px]">
          <div className="absolute -top-10 -right-10 opacity-10 md:opacity-5 pointer-events-none">
            <h1 className="text-[100px] md:text-[200px] font-bold tracking-tighter leading-none" style={{ fontFamily: 'var(--font-display)' }}>RENT</h1>
          </div>
          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between md:items-end gap-6">
             <div>
                <p className="mc-eyebrow text-[var(--color-slate)] mb-4">Sirkulasi Saya</p>
                <h1 className="mc-heading-1 text-[var(--color-ink)]">Peminjaman<br/>Aktif</h1>
             </div>
             
             {totalFine > 0 ? (
               <div className="bg-[var(--color-signal)] text-white px-8 py-5 rounded-[24px] text-right shadow-lg">
                  <p className="text-[13px] font-[500] uppercase tracking-wider mb-1 opacity-90">Total Denda Belum Dibayar</p>
                  <p className="text-[28px] font-bold tracking-tight">Rp {totalFine.toLocaleString('id-ID')}</p>
               </div>
             ) : (
               <p className="text-[18px] font-[450] text-[var(--color-slate)] max-w-sm text-right pb-2">
                 Pantau status buku yang sedang Anda baca dan batas waktu pengembaliannya.
               </p>
             )}
          </div>
        </div>

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        <div className="space-y-4 mb-16">
          {loading ? (
             <div className="flex justify-center py-24"><LoadingSpinner /></div>
          ) : active.length === 0 ? (
             <div className="px-8 py-24 text-center bg-white/60 backdrop-blur-sm rounded-[40px] text-[var(--color-slate)] text-[16px] font-[450]">Tidak ada buku yang sedang dipinjam.</div>
          ) : (
             active.map((t) => {
                const now = new Date()
                const due = new Date(t.dueDate)
                const overdue = now > due
                const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                
                return (
                   <div key={t.id} className={`flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 md:px-8 py-5 md:py-6 rounded-[32px] shadow-sm transition-shadow hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] border ${overdue ? 'bg-[#fff5f2] border-[var(--color-signal)]/10' : 'bg-[var(--color-lifted-cream)] border-transparent'}`}>
                      
                      <div className="flex items-center gap-6 md:w-[45%]">
                         {t.book.coverImage ? (
                            <div className="w-14 h-20 shrink-0 rounded-[12px] overflow-hidden bg-black/5 relative shadow-sm">
                               <Image src={t.book.coverImage} alt="" fill className="object-cover" />
                            </div>
                         ) : (
                            <div className="w-14 h-20 shrink-0 rounded-[12px] bg-[var(--color-ink)]/5 text-[var(--color-slate)] flex items-center justify-center text-xl font-bold">?</div>
                         )}
                         <div className="flex flex-col">
                            <span className="text-[18px] font-[500] text-[var(--color-ink)] line-clamp-1 mb-1">{t.book.title}</span>
                            <span className="text-[15px] font-[450] text-[var(--color-slate)]">{t.book.author}</span>
                         </div>
                      </div>

                      <div className="flex flex-wrap md:flex-nowrap items-center justify-between md:justify-end md:w-[55%] gap-4 md:gap-8 w-full mt-2 md:mt-0">
                         <div className="flex flex-col items-start md:items-center">
                            <span className="mc-eyebrow text-[var(--color-slate)] mb-1">Tanggal Pinjam</span>
                            <span className="text-[14px] md:text-[16px] font-[450] text-[var(--color-ink)]">{new Date(t.borrowDate).toLocaleDateString('id-ID')}</span>
                         </div>
                         
                         <div className="flex flex-col items-start md:items-center">
                            <span className="mc-eyebrow text-[var(--color-slate)] mb-1">Jatuh Tempo</span>
                            <span className={`text-[14px] md:text-[16px] font-[500] ${overdue ? 'text-[var(--color-signal)]' : 'text-[var(--color-ink)]'}`}>
                               {due.toLocaleDateString('id-ID')}
                            </span>
                         </div>

                         <div className="flex flex-col items-start md:items-center w-full md:w-auto mt-2 md:mt-0">
                            <span className="mc-eyebrow text-[var(--color-slate)] mb-2 md:mb-1">Status</span>
                            <span className={`inline-flex px-4 py-1.5 rounded-full text-[12px] md:text-[13px] font-[500] whitespace-nowrap border ${
                               overdue 
                                  ? 'border-[var(--color-signal)] text-white bg-[var(--color-signal)] shadow-sm' 
                                  : 'border-[var(--color-ink)]/20 text-[var(--color-ink)] bg-white'
                            }`}>
                               {overdue ? `Terlambat ${Math.abs(diffDays)} Hari` : diffDays === 0 ? 'Tempo Hari Ini' : `${diffDays} Hari Lagi`}
                            </span>
                         </div>
                      </div>
                   </div>
                )
             })
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
