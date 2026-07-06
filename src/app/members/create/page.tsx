'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateMemberPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/members')
    } catch {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full z-10">
      
      {/* Ghost Watermark Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[-1] pointer-events-none w-full text-center mt-[-60px]">
         <h1 className="mc-ghost-watermark select-none text-[150px] md:text-[250px]">NEW USER</h1>
      </div>

      <div className="mc-card-stadium p-6 md:p-12 mb-10 mt-10 max-w-2xl mx-auto shadow-md">
        <div className="mb-10 text-center">
          <p className="mc-eyebrow text-[var(--color-slate)] mb-3">Registrasi Pengguna</p>
          <h1 className="mc-heading-2 text-[var(--color-ink)]">Tambah Anggota</h1>
          <p className="text-[16px] font-[450] text-[var(--color-slate)] mt-4 max-w-lg mx-auto">
            Daftarkan anggota baru untuk bergabung di perpustakaan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-[#fff5f2] border border-[var(--color-signal)]/10 text-[var(--color-signal)] px-6 py-4 rounded-[16px] text-[15px] font-[500] shadow-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4 mb-2 block">Nama Lengkap <span className="text-[var(--color-signal)]">*</span></label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Masukkan nama lengkap"
              className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm" />
          </div>
          
          <div>
            <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4 mb-2 block">Alamat Email <span className="text-[var(--color-signal)]">*</span></label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="contoh@email.com"
              className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm" />
          </div>
          
          <div>
            <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4 mb-2 block">Password Sementara <span className="text-[var(--color-signal)]">*</span></label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Minimal 6 karakter"
              className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm" />
          </div>
          
          <div>
            <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4 mb-2 block">Nomor Telepon</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0812xxxxxxxx"
              className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm" />
          </div>
          
          <div>
            <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4 mb-2 block">Alamat Lengkap</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3}
              placeholder="Masukkan alamat domisili"
              className="w-full px-6 py-5 bg-white border border-black/5 rounded-[32px] text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm resize-none" />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 mt-8 border-t border-[var(--color-ink)]/5">
            <button type="submit" disabled={loading}
              className="mc-btn-primary w-full sm:w-auto px-10 py-4 shadow-md disabled:opacity-50 flex justify-center items-center">
              {loading ? 'Menyimpan...' : 'Simpan Anggota Baru'}
            </button>
            <button type="button" onClick={() => router.push('/members')}
              className="mc-btn-secondary w-full sm:w-auto px-10 py-4">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
