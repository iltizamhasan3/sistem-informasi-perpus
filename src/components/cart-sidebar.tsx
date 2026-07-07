'use client'

import { useCart } from '@/lib/cart-context'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export function CartSidebar() {
  const { cart, removeFromCart, isCartOpen, setCartOpen, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!isCartOpen) return null

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/bookings/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookIds: cart.map((c) => c.id) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal checkout buku')
      
      setSuccess(`Booking berhasil! Kode: ${data.bookingCode}`)
      clearCart()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={() => setCartOpen(false)}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--color-canvas-cream)] shadow-2xl z-[101] flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between p-6 border-b border-black/5 bg-white/50 backdrop-blur-md">
          <h2 className="text-xl font-[600] tracking-tight text-[var(--color-ink)] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            Keranjang Pinjam
          </h2>
          <button onClick={() => setCartOpen(false)} className="p-2 rounded-full hover:bg-black/5 text-[var(--color-slate)] transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {success ? (
            <div className="text-center py-12 px-4 flex flex-col items-center">
               <div className="w-16 h-16 bg-[#c8e6cd] rounded-full flex items-center justify-center mb-6">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#1e4b26" className="w-8 h-8">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                 </svg>
               </div>
               <h3 className="text-[20px] font-bold text-[#1e4b26] mb-2">Checkout Berhasil!</h3>
               <p className="text-[15px] text-black/70 mb-6">{success}</p>
               <Link href="/my-bookings" onClick={() => setCartOpen(false)} className="mc-btn-primary px-6 py-2">Lihat Riwayat Booking</Link>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-12 px-4">
               <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-[var(--color-slate)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
               </div>
               <p className="text-[16px] font-[500] text-[var(--color-slate)]">Keranjang kamu masih kosong.</p>
               <button onClick={() => setCartOpen(false)} className="mt-4 text-[14px] text-[var(--color-ink)] underline font-[500]">Cari buku di katalog</button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[14px] font-[500] text-[var(--color-slate)] mb-2">Buku yang akan dipinjam ({cart.length}/3)</p>
              {error && <div className="p-4 rounded-[12px] bg-[#fff5f2] text-[var(--color-signal)] border border-[var(--color-signal)]/10 text-[14px] font-[500]">{error}</div>}
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 rounded-[20px] bg-white border border-black/5 shadow-sm relative group">
                  <div className="w-16 aspect-[3/4] bg-black/5 rounded-[12px] overflow-hidden shrink-0">
                     {item.coverImage ? (
                        <Image src={item.coverImage} alt={item.title} width={64} height={85} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-[20px] font-bold text-black/20">?</div>
                     )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0 pr-6">
                    <h4 className="text-[15px] font-[600] text-[var(--color-ink)] line-clamp-1">{item.title}</h4>
                    <p className="text-[13px] text-[var(--color-slate)] mt-0.5 line-clamp-1">{item.author}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="absolute top-1/2 -translate-y-1/2 right-4 p-1.5 text-black/20 hover:text-[var(--color-signal)] transition hover:bg-[var(--color-signal)]/10 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {!success && cart.length > 0 && (
          <div className="p-6 bg-white border-t border-black/5 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-center mb-6">
               <span className="text-[15px] font-[500] text-[var(--color-slate)]">Total Peminjaman</span>
               <span className="text-[18px] font-bold text-[var(--color-ink)]">{cart.length} Buku</span>
            </div>
            <button 
              onClick={handleCheckout} 
              disabled={loading || cart.length === 0}
              className="mc-btn-primary w-full py-4 text-[16px] flex justify-center disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Checkout Sekarang'}
            </button>
            <p className="text-[12px] text-center mt-4 text-[var(--color-slate)]">
              Batas waktu pengambilan buku fisik adalah 24 jam setelah checkout.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
