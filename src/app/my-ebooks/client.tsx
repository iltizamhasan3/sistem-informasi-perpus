'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AdminLayout } from '@/components/admin-layout'
import { Toast } from '@/components/toast'
import { LoadingSpinner } from '@/components/loading-spinner'

interface EbookRental {
  id: number
  expiresAt: string
  currentPage: number
  book: { id: number; title: string; author: string; coverImage: string | null }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MyEbooksClient({ user }: { user: { name: string; role: string } }) {
  const router = useRouter()
  const [active, setActive] = useState<EbookRental[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setTimeout(() => setNow(Date.now()), 0)
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetch('/api/ebooks/my')
      .then((r) => { if (!r.ok) throw new Error('Gagal memuat e-book'); return r.json() })
      .then((data) => setActive(data.active ?? []))
      .catch(() => setToast({ type: 'error', message: 'Gagal memuat data e-book' }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <div className="relative w-full z-10">
        
        {/* Ghost Watermark */}
        <div className="absolute -top-16 -left-10 md:-left-24 z-[-1] pointer-events-none overflow-hidden w-[150%] whitespace-nowrap">
           <h1 className="mc-ghost-watermark select-none text-[120px] md:text-[240px]">EBOOKS</h1>
        </div>

        <div className="mc-card-stadium p-6 md:p-12 mb-12 relative overflow-hidden flex items-end min-h-[250px] md:min-h-[300px]">
          <div className="absolute -top-10 -right-10 opacity-10 md:opacity-5 pointer-events-none">
            <h1 className="text-[100px] md:text-[200px] font-bold tracking-tighter leading-none" style={{ fontFamily: 'var(--font-display)' }}>READ</h1>
          </div>
          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between md:items-end gap-6">
             <div>
                <p className="mc-eyebrow text-[var(--color-slate)] mb-4">Perpustakaan Digital</p>
                <h1 className="mc-heading-1 text-[var(--color-ink)]">E-book<br/>Saya</h1>
             </div>
             <p className="text-[18px] font-[450] text-[var(--color-slate)] max-w-sm text-right pb-2">
               Akses koleksi digital Anda di mana saja, kapan saja sebelum waktu sewa berakhir.
             </p>
          </div>
        </div>

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        <div className="space-y-4 mb-16">
          {loading ? (
             <div className="flex justify-center py-24"><LoadingSpinner /></div>
          ) : active.length === 0 ? (
             <div className="px-8 py-24 text-center bg-white/60 backdrop-blur-sm rounded-[40px] text-[var(--color-slate)] text-[16px] font-[450]">Tidak ada E-book aktif saat ini.</div>
          ) : (
             active.map((r) => {
                const remaining = now ? Math.max(0, new Date(r.expiresAt).getTime() - now) : 0
                const h = Math.floor(remaining / (1000 * 60 * 60))
                const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
                
                return (
                   <div key={r.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 md:px-8 py-5 md:py-6 bg-[var(--color-lifted-cream)] rounded-[32px] shadow-sm hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition-shadow">
                      
                      {/* Ebook Info */}
                      <div className="flex items-center gap-6 md:w-[50%]">
                         {r.book.coverImage ? (
                            <div className="w-16 h-24 shrink-0 rounded-[12px] overflow-hidden bg-black/5 relative shadow-sm">
                               <Image src={r.book.coverImage} alt="" fill className="object-cover" />
                            </div>
                         ) : (
                            <div className="w-16 h-24 shrink-0 rounded-[12px] bg-[var(--color-ink)]/5 text-[var(--color-slate)] flex items-center justify-center text-2xl font-bold">?</div>
                         )}
                         <div className="flex flex-col">
                            <span className="text-[18px] font-[500] text-[var(--color-ink)] line-clamp-1 mb-1">{r.book.title}</span>
                            <span className="text-[15px] font-[450] text-[var(--color-slate)] mb-2">{r.book.author}</span>
                             <div className="flex items-center gap-3">
                               <span className="inline-flex self-start px-3 py-1 rounded-full text-[11px] font-[500] border border-[var(--color-ink)]/20 text-[var(--color-ink)] uppercase tracking-wider">
                                  Tersedia Online
                               </span>
                               <span className="text-[13px] font-[450] text-[var(--color-slate)] bg-black/5 px-3 py-1 rounded-full">Halaman {r.currentPage}</span>
                             </div>
                         </div>
                      </div>

                      {/* Timer & Action */}
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between md:w-[50%] gap-4 md:gap-6 w-full mt-2 md:mt-0">
                         <div className="flex flex-col items-start md:items-center text-left md:text-center w-full md:w-auto border-b md:border-b-0 border-black/5 pb-4 md:pb-0">
                            <span className="mc-eyebrow text-[var(--color-slate)] mb-1">Sisa Waktu Baca</span>
                            <span className="text-[18px] font-[500] text-[var(--color-ink)] font-mono tracking-tight">
                               {h}j {m}m
                            </span>
                         </div>
                         
                         <div className="flex justify-start md:justify-end w-full md:w-auto">
                            <button onClick={() => router.push(`/reader/${r.id}`)}
                               className="mc-btn-primary px-8 py-3 w-full md:w-auto text-center rounded-full shadow-md group">
                               Mulai Membaca
                               <svg className="w-4 h-4 inline-block ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
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
