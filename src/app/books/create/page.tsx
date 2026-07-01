'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Category { id: number; name: string }

export default function CreateBookPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({ title: '', author: '', publisher: '', year: '', categoryId: '', stock: '1', description: '' })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [uploadStatus, setUploadStatus] = useState('')
  const [isEbook, setIsEbook] = useState(false)
  const [ebookFile, setEbookFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/categories', { cache: 'no-store' }).then((r) => r.json()).then((d) => setCategories(d.categories)).catch(() => {})
  }, [])

  function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const tasks: Promise<void>[] = []
    let coverImage = ''
    if (coverFile) {
      setUploadStatus('Mengunggah sampul...')
      tasks.push((async () => {
        const fd = new FormData(); fd.append('file', coverFile)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error || 'Gagal upload sampul')
        coverImage = d.url
      })())
    }
    let ebookPath = ''
    if (isEbook && ebookFile) {
      setUploadStatus('Mengunggah e-book...')
      tasks.push((async () => {
        const fd = new FormData(); fd.append('file', ebookFile)
        const res = await fetch('/api/ebooks/upload', { method: 'POST', body: fd })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error || 'Gagal upload e-book')
        ebookPath = d.path
      })())
    }
    try {
      if (tasks.length) setUploadStatus('Mengunggah...')
      await Promise.all(tasks)
      setUploadStatus('Menyimpan...')
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, coverImage: coverImage || undefined, isEbook: isEbook || undefined, ebookFile: ebookPath || undefined }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      router.push('/books')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
      setUploadStatus('')
    }
  }

  return (
    <div className="space-y-12">
      <div className="bg-[#f4ecd6] rounded-[24px] p-12">
        <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40 mb-3">Form Buku</p>
        <h1 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-black">Tambah Buku</h1>
        <p className="text-[18px] font-light leading-relaxed text-black/50 mt-3 max-w-xl">
          Lengkapi data buku baru untuk menambah koleksi perpustakaan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[24px] border border-[#e6e6e6] p-12 max-w-2xl space-y-8">
        {error && (
          <div className="bg-[#f3c9b6] border-l-4 border-black text-black px-5 py-4 rounded-r-[8px] text-[15px] font-light leading-relaxed">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-6 gap-y-7">
          <div className="col-span-2">
            <label className="text-[15px] font-light text-black mb-2 block">Judul <span className="text-black/20">*</span></label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Masukkan judul buku"
              className="w-full px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[17px] font-light text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition" />
          </div>
          <div>
            <label className="text-[15px] font-light text-black mb-2 block">Pengarang <span className="text-black/20">*</span></label>
            <input type="text" required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Nama penulis"
              className="w-full px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[17px] font-light text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition" />
          </div>
          <div>
            <label className="text-[15px] font-light text-black mb-2 block">Penerbit</label>
            <input type="text" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })}
              placeholder="Nama penerbit"
              className="w-full px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[17px] font-light text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition" />
          </div>
          <div>
            <label className="text-[15px] font-light text-black mb-2 block">Tahun</label>
            <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
              placeholder="2024"
              className="w-full px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[17px] font-light text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition" />
          </div>
          <div>
            <label className="text-[15px] font-light text-black mb-2 block">Kategori <span className="text-black/20">*</span></label>
            <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[17px] font-light text-black focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition">
              <option value="">Pilih kategori</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[15px] font-light text-black mb-2 block">Stok</label>
            <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[17px] font-light text-black focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition" />
          </div>
          <div className="col-span-2">
            <label className="text-[15px] font-light text-black mb-2 block">Sampul Buku</label>
            <label className="cursor-pointer inline-block">
              <span className="inline-block px-5 py-[10px] bg-black text-white rounded-[50px] text-[15px] font-light hover:bg-gray-800 transition leading-[1.4]">
                Pilih File
              </span>
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
            <p className="text-[14px] text-gray-400 font-light mt-2">{coverFile ? coverFile.name : 'Belum ada file dipilih'}</p>
            {coverPreview && (
              <div className="mt-4 p-3 bg-[#f7f7f5] rounded-[8px] inline-block">
                <img src={coverPreview} className="h-36 object-contain rounded-[6px]" />
              </div>
            )}
          </div>
          <div className="col-span-2">
            <label className="text-[15px] font-light text-black mb-2 block">Deskripsi</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
              placeholder="Sinopsis atau deskripsi buku"
              className="w-full px-[14px] py-3 bg-white border border-[#e6e6e6] rounded-[8px] text-[17px] font-light text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c5b0f4]/20 focus:border-black transition resize-none" />
          </div>
          <div className="col-span-2 border-t border-[#f1f1f1] pt-6">
            <label className="inline-flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input type="checkbox" checked={isEbook} onChange={(e) => setIsEbook(e.target.checked)} className="sr-only peer" />
                <div className="w-[18px] h-[18px] border-2 border-[#c5b0f4]/40 rounded-[3px] flex items-center justify-center transition peer-checked:bg-black peer-checked:border-black">
                  <svg className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
              <span className="text-[15px] font-light text-black">Tersedia sebagai e-book (PDF)</span>
            </label>
          </div>
          {isEbook && (
            <div className="col-span-2 pl-7">
              <label className="text-[15px] font-light text-black mb-2 block">File PDF</label>
              <label className="cursor-pointer inline-block">
                <span className="inline-block px-5 py-[10px] bg-black text-white rounded-[50px] text-[15px] font-light hover:bg-gray-800 transition leading-[1.4]">
                  Pilih PDF
                </span>
                <input type="file" accept=".pdf,application/pdf" onChange={(e) => setEbookFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
              <p className="text-[14px] text-gray-400 font-light mt-2">{ebookFile ? ebookFile.name : 'Belum ada file dipilih'}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-[#f1f1f1]">
          <button type="submit" disabled={loading}
            className="px-6 py-[10px] bg-black text-white rounded-[50px] text-[16px] font-light leading-[1.4] transition hover:bg-gray-800 active:bg-gray-700 disabled:opacity-40">
            {uploadStatus || (loading ? 'Menyimpan...' : 'Simpan')}
          </button>
          <button type="button" onClick={() => router.push('/books')}
            className="px-6 py-[10px] bg-white text-black rounded-[50px] text-[16px] font-light leading-[1.4] transition hover:bg-[#f7f7f5] active:bg-gray-100">
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
