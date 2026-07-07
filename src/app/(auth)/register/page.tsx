'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', address: '' })
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

    if (form.password !== form.confirmPassword) {
      setError('Password tidak cocok')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone, address: form.address }),
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error); return }

      router.replace('/login')
    } catch {
      setError('Terjadi kesalahan, silakan coba lagi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] flex items-center justify-center p-6 relative overflow-hidden z-10">
      
      {/* Ghost Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1] pointer-events-none w-[150%] text-center">
         <h1 className="mc-ghost-watermark select-none text-[150px] md:text-[250px]">REGISTER</h1>
      </div>

      <div className="w-full max-w-[640px] mc-card-stadium p-10 md:p-14 shadow-lg my-12">
        
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-ink)] rounded-full mb-6 hover:scale-105 transition-transform shadow-md group">
            <svg className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6v13" />
              <path d="M12 6a4 4 0 0 0-4-4H2v16h6a4 4 0 0 1 4 4" />
              <path d="M12 6a4 4 0 0 1 4-4h6v16h-6a4 4 0 0 0-4 4" />
            </svg>
          </Link>
          <p className="mc-eyebrow text-[var(--color-slate)] mb-3">Selamat Datang di SiPustaka</p>
          <h1 className="mc-heading-2 text-[var(--color-ink)]">Daftar Akun Baru</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-[#fff5f2] border border-[var(--color-signal)]/20 text-[var(--color-signal)] px-5 py-4 rounded-full text-[14px] font-[500] text-center shadow-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4">Nama Lengkap <span className="text-[var(--color-signal)]">*</span></label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Masukkan nama lengkap"
              className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4">Email <span className="text-[var(--color-signal)]">*</span></label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contoh@email.com"
                className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4">Nomor Telepon</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0812xxxxxxxx (Opsional)"
                className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4">Password <span className="text-[var(--color-signal)]">*</span></label>
              <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimal 6 karakter"
                className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4">Konfirmasi Password <span className="text-[var(--color-signal)]">*</span></label>
              <input type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Ulangi password"
                className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4">Alamat Domisili</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2}
              placeholder="Alamat lengkap (opsional)"
              className="w-full px-6 py-4 bg-white border border-black/5 rounded-[24px] text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm resize-none" />
          </div>

          <div className="pt-4">
             <button type="submit" disabled={loading}
               className="mc-btn-primary w-full py-4 text-[16px] shadow-md disabled:opacity-50 flex justify-center items-center">
               {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               ) : 'Buat Akun Sekarang'}
             </button>
          </div>

          <div className="text-center pt-6 mt-6 border-t border-black/5">
            <p className="text-[14px] font-[450] text-[var(--color-slate)]">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="text-[var(--color-ink)] font-bold hover:underline transition-all">Masuk di sini</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
