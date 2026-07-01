'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'
import { LoadingSpinner } from '@/components/loading-spinner'

interface EbookRental {
  id: number
  expiresAt: string
  book: { id: number; title: string; author: string; coverImage: string | null }
}

export function MyEbooksClient({ user }: { user: { name: string; role: string } }) {
  const router = useRouter()
  const [active, setActive] = useState<EbookRental[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/ebooks/my')
      .then((r) => r.json())
      .then((data) => setActive(data.active ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout initialUser={user}>
      <div className="space-y-4">
        <div className="bg-[#c5b0f4] rounded-[24px] p-6">
          <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40">E-book</p>
          <h1 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-black mt-1">E-book Saya</h1>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="space-y-3">
            {active.length === 0 ? (
              <p className="text-[15px] font-light text-black/40 text-center py-8">Tidak ada e-book aktif</p>
            ) : active.map((r) => {
              const remaining = Math.max(0, new Date(r.expiresAt).getTime() - Date.now())
              const h = Math.floor(remaining / (1000 * 60 * 60))
              const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
              return (
                <div key={r.id} className="bg-white rounded-[12px] border border-[#e6e6e6] p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-14 bg-[#f7f7f5] rounded-[8px] overflow-hidden shrink-0 flex items-center justify-center text-[18px] text-black/20 font-light">
                        {r.book.coverImage ? <img src={r.book.coverImage} className="w-full h-full object-cover" /> : '?'}
                      </div>
                      <div>
                        <h3 className="text-[16px] font-bold text-black">{r.book.title}</h3>
                        <p className="text-[14px] font-light text-black/50 mt-0.5">{r.book.author}</p>
                      </div>
                    </div>
                    <span className="inline-flex px-3 py-1 rounded-[50px] text-[13px] font-light bg-[#c8e6cd] text-black shrink-0">Aktif</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[13px] font-light text-black/40">
                      Sisa waktu: {h} jam {m} menit
                    </span>
                    <button onClick={() => router.push(`/reader/${r.id}`)}
                      className="px-4 py-[8px] bg-black text-white rounded-[50px] text-[13px] font-light hover:bg-gray-800 transition">
                      Baca
                    </button>
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
