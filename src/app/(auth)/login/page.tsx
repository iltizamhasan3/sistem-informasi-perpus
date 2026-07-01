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
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Terjadi kesalahan'); return }
      window.location.href = data.user.role === 'admin' ? '/dashboard' : '/catalog'
    } catch {
      setError('Terjadi kesalahan, silakan coba lagi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-black rounded-full mb-4">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6v13" />
              <path d="M12 6a4 4 0 0 0-4-4H2v16h6a4 4 0 0 1 4 4" />
              <path d="M12 6a4 4 0 0 1 4-4h6v16h-6a4 4 0 0 0-4 4" />
            </svg>
          </div>
          <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40 mb-2">SiPustaka</p>
          <h1 className="text-[28px] font-bold tracking-[-0.02em] leading-[1.1] text-black">Masuk ke akun Anda</h1>
          <div className="mt-6 w-6 h-[1px] bg-black/20 mx-auto" />
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[24px] border border-[#e6e6e6] p-8 space-y-5">
          {error && (
            <div className="bg-[#f3c9b6] border-l-4 border-black text-black px-4 py-3.5 rounded-r-[8px] text-[14px] font-light leading-relaxed">
              {error}
            </div>
          )}

          <div>
            <label className="text-[14px] font-light text-black mb-1.5 block">Email</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@email.com"
              className="w-full px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[16px] font-light text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition" />
          </div>

          <div>
            <label className="text-[14px] font-light text-black mb-1.5 block">Password</label>
            <input
              type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Masukkan password"
              className="w-full px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[16px] font-light text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-[12px] bg-black text-white rounded-[50px] text-[16px] font-light leading-[1.4] transition hover:bg-gray-800 active:bg-gray-700 disabled:opacity-40">
            {loading ? 'Memproses...' : 'Masuk'}
          </button>

          <div className="text-center pt-2">
            <p className="text-[14px] font-light text-black/40">
              Belum punya akun?{' '}
              <Link href="/register" className="text-black font-medium hover:text-black/70 transition">Daftar</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
