'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const PdfRenderer = dynamic(() => import('./pdf-renderer').then((m) => ({ default: m.PdfRenderer })), { ssr: false })

export default function ReaderPage() {
  const { rentalId } = useParams()
  const router = useRouter()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [bookTitle, setBookTitle] = useState('')
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [remaining, setRemaining] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'loading' | 'expired' | 'ready'>('loading')
  const [rentalInfo, setRentalInfo] = useState<{ id: number; currentPage: number } | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const rentRes = await fetch(`/api/ebooks/my`)
        const rentData = await rentRes.json()
        const rental = [...(rentData.active || []), ...(rentData.expired || [])].find(
          (r: { id: number }) => r.id === Number(rentalId)
        )
        if (!rental) { setError('Sewa tidak ditemukan'); setStatus('expired'); setLoading(false); return }

        setBookTitle(rental.book.title)
        setExpiresAt(new Date(rental.expiresAt))

        if (rental.status !== 'active' || new Date(rental.expiresAt) <= new Date()) {
          setStatus('expired'); setLoading(false); return
        }

        setRentalInfo({ id: rental.id, currentPage: rental.currentPage || 1 })

        const res = await fetch(`/api/ebooks/read/${rentalId}`)
        if (!res.ok) {
          if (res.status === 410) { setStatus('expired'); setLoading(false); return }
          const data = await res.json()
          throw new Error(data.error || 'Gagal memuat e-book')
        }

        const data = await res.json()
        setPdfUrl(data.url)
        setStatus('ready')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [rentalId])

  useEffect(() => {
    if (!expiresAt) return
    function tick() {
      const diff = expiresAt!.getTime() - Date.now()
      if (diff <= 0) {
        setRemaining('Masa sewa telah habis')
        setStatus('expired')
        return
      }
      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setRemaining(`${h} jam ${m} menit`)
    }
    tick()
    const interval = setInterval(tick, 10000)
    return () => clearInterval(interval)
  }, [expiresAt])

  useEffect(() => {
    if (status !== 'ready') return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/ebooks/read/${rentalId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.url) setPdfUrl(data.url)
        } else {
          if (res.status === 410) setStatus('expired')
        }
      } catch {}
    }, 300000)
    return () => clearInterval(interval)
  }, [status, rentalId])

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col">
      <header className="sticky top-0 z-20 bg-white border-b border-[#e6e6e6] px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={() => router.push('/my-ebooks')} className="text-[#60619C] text-[14px] font-light hover:text-black transition shrink-0">&larr; Kembali</button>
          <h1 className="text-[15px] font-light text-black/80 truncate">{bookTitle || 'E-book'}</h1>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {remaining && (
            status === 'expired'
              ? <span className="inline-flex px-3 py-1 rounded-[50px] text-[13px] font-light bg-[#f3c9b6] text-black">{remaining}</span>
              : <span className="inline-flex px-3 py-1 rounded-[50px] text-[13px] font-light bg-[#c5b0f4]/15 text-black/70">{remaining}</span>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto flex flex-col items-center py-8 px-4">
        {loading && (
          <div className="flex items-center justify-center flex-1">
            <div className="w-8 h-8 border-4 border-[#c5b0f4] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <p className="text-[16px] font-light text-black/60">{error}</p>
            </div>
          </div>
        )}

        {status === 'expired' && !loading && (
          <div className="flex items-center justify-center flex-1 text-center">
            <div>
              <p className="text-[18px] font-light text-black/60 mb-5">Masa sewa e-book telah habis</p>
              <button onClick={() => router.push('/my-ebooks')}
                className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition">
                Lihat E-book Saya
              </button>
            </div>
          </div>
        )}

        {status === 'ready' && pdfUrl && rentalInfo && <PdfRenderer pdfUrl={pdfUrl} rentalId={rentalInfo.id} initialPage={rentalInfo.currentPage} />}
      </main>
    </div>
  )
}
