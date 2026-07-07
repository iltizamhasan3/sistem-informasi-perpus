'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (data.user) {
        router.replace(data.user.role === 'admin' ? '/dashboard' : '/catalog')
      }
    }).catch(() => {})
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) { 
        setError(data.error || 'Terjadi kesalahan')
        setLoading(false)
        return 
      }
      
      window.location.href = data.user.role === 'admin' ? '/dashboard' : '/catalog'
    } catch {
      setError('Terjadi kesalahan, silakan coba lagi')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] flex items-center justify-center p-6 relative overflow-hidden z-10">
      
      {/* Ghost Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1] pointer-events-none w-[150%] text-center">
         <h1 className="mc-ghost-watermark select-none text-[200px] md:text-[300px]">AUTH</h1>
      </div>

      <div className="w-full max-w-[480px] mc-card-stadium p-10 md:p-14 shadow-lg">
        
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-ink)] rounded-full mb-6 hover:scale-105 transition-transform shadow-md group">
            <svg className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6v13" />
              <path d="M12 6a4 4 0 0 0-4-4H2v16h6a4 4 0 0 1 4 4" />
              <path d="M12 6a4 4 0 0 1 4-4h6v16h-6a4 4 0 0 0-4 4" />
            </svg>
          </Link>
          <p className="mc-eyebrow text-[var(--color-slate)] mb-3">Selamat Datang Kembali</p>
          <h1 className="mc-heading-2 text-[var(--color-ink)]">Masuk ke SiPustaka</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-[#fff5f2] border border-[var(--color-signal)]/20 text-[var(--color-signal)] px-5 py-4 rounded-full text-[14px] font-[500] text-center shadow-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4">Email Address</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="contoh@email.com"
              className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm" />
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4">Password</label>
            <input
              type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Masukkan password"
              className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm" />
          </div>

          <div className="pt-4">
             <button type="submit" disabled={loading}
               className="mc-btn-primary w-full py-4 text-[16px] shadow-md disabled:opacity-50 flex justify-center items-center">
               {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               ) : 'Masuk'}
             </button>
          </div>

          <div className="text-center pt-6 mt-6 border-t border-black/5">
            <p className="text-[14px] font-[450] text-[var(--color-slate)]">
              Belum memiliki akun?{' '}
              <Link href="/register" className="text-[var(--color-ink)] font-bold hover:underline transition-all">Daftar Sekarang</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
