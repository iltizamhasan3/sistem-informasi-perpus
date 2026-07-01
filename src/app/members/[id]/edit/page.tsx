'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditMemberPage() {
  const router = useRouter()
  const params = useParams()
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/members/${params.id}`).then((r) => r.json()).then((d) => {
      if (d.member) setForm({ name: d.member.name, email: d.member.email, phone: d.member.phone || '', address: d.member.address || '' })
    }).catch(() => {})
  }, [params.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch(`/api/members/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error); return }
    router.push('/members')
  }

  return (
    <div className="space-y-12">
      <div className="bg-[#c5b0f4] rounded-[24px] p-8 md:p-12">
        <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40 mb-3">Form Anggota</p>
        <h1 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-black">Edit Anggota</h1>
        <p className="text-[18px] font-light leading-relaxed text-black/50 mt-3 max-w-xl">
          Perbarui data anggota perpustakaan yang sudah terdaftar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[24px] border border-[#e6e6e6] p-6 md:p-12 mx-auto max-w-lg space-y-7">
        {error && (
          <div className="bg-[#f3c9b6] border-l-4 border-black text-black px-5 py-4 rounded-r-[8px] text-[15px] font-light leading-relaxed">
            {error}
          </div>
        )}

        <div>
          <label className="text-[15px] font-light text-black mb-2 block">Nama <span className="text-black/20">*</span></label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama lengkap"
            className="w-full px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[17px] font-light text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition" />
        </div>
        <div>
          <label className="text-[15px] font-light text-black mb-2 block">Email <span className="text-black/20">*</span></label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="contoh@email.com"
            className="w-full px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[17px] font-light text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition" />
        </div>
        <div>
          <label className="text-[15px] font-light text-black mb-2 block">Telepon</label>
          <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Nomor telepon"
            className="w-full px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[17px] font-light text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition" />
        </div>
        <div>
          <label className="text-[15px] font-light text-black mb-2 block">Alamat</label>
          <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2}
            placeholder="Alamat lengkap"
            className="w-full px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[17px] font-light text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition resize-none" />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-[#f1f1f1]">
          <button type="submit" disabled={loading}
            className="px-6 py-[10px] bg-black text-white rounded-[50px] text-[16px] font-light leading-[1.4] transition hover:bg-gray-800 active:bg-gray-700 disabled:opacity-40">
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <button type="button" onClick={() => router.push('/members')}
            className="px-6 py-[10px] bg-white text-black rounded-[50px] text-[16px] font-light leading-[1.4] transition hover:bg-[#f7f7f5] active:bg-gray-100">
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
