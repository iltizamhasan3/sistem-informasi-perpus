'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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
        const res = await fetch('/api/ebooks/upload', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: ebookFile.name, contentType: ebookFile.type })
        })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error || 'Gagal mendapatkan url upload e-book')
        
        const uploadRes = await fetch(d.uploadUrl, {
          method: 'PUT',
          body: ebookFile,
          headers: { 'Content-Type': ebookFile.type }
        })
        if (!uploadRes.ok) throw new Error('Gagal mengunggah e-book ke server storage')
        
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
    <div className="relative w-full z-10">
      
      {/* Ghost Watermark Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[-1] pointer-events-none w-full text-center mt-[-60px]">
         <h1 className="mc-ghost-watermark select-none text-[150px] md:text-[250px]">NEW BOOK</h1>
      </div>

      <div className="mc-card-stadium p-6 md:p-12 mb-10 mt-10 max-w-4xl mx-auto shadow-md">
        <div className="mb-10 text-center">
          <p className="mc-eyebrow text-[var(--color-slate)] mb-3">Registrasi Literatur</p>
          <h1 className="mc-heading-2 text-[var(--color-ink)]">Tambah Buku Baru</h1>
          <p className="text-[16px] font-[450] text-[var(--color-slate)] mt-4 max-w-lg mx-auto">
            Lengkapi form di bawah ini untuk menambahkan koleksi buku atau e-book baru ke perpustakaan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-[#fff5f2] border border-[var(--color-signal)]/10 text-[var(--color-signal)] px-6 py-4 rounded-[16px] text-[15px] font-[500] shadow-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="col-span-1 md:col-span-2">
              <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4 mb-2 block">Judul Buku <span className="text-[var(--color-signal)]">*</span></label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Masukkan judul buku..."
                className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm" />
            </div>
            
            <div>
              <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4 mb-2 block">Pengarang <span className="text-[var(--color-signal)]">*</span></label>
              <input type="text" required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="Nama penulis"
                className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm" />
            </div>
            
            <div>
              <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4 mb-2 block">Penerbit</label>
              <input type="text" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                placeholder="Nama penerbit"
                className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm" />
            </div>
            
            <div>
              <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4 mb-2 block">Tahun Terbit</label>
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                placeholder="Misal: 2024"
                className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm" />
            </div>
            
            <div>
              <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4 mb-2 block">Kategori <span className="text-[var(--color-signal)]">*</span></label>
              <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23141413\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.2em' }}>
                <option value="">Pilih Kategori</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4 mb-2 block">Stok Fisik</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-6 py-4 bg-white border border-black/5 rounded-full text-[15px] font-[450] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm" />
            </div>

            <div className="col-span-1 md:col-span-2 mt-2">
              <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4 mb-2 block">Sampul Buku</label>
              <div className="flex flex-col sm:flex-row items-start gap-6 bg-white/40 p-6 rounded-[24px] border border-black/5">
                <label className="cursor-pointer shrink-0 w-full sm:w-auto">
                  <span className="mc-btn-secondary w-full sm:w-auto py-3 px-6 inline-block cursor-pointer text-center">
                    Pilih File Gambar
                  </span>
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                </label>
                <div>
                  <p className="text-[14px] text-[var(--color-slate)] font-[450] mb-3">{coverFile ? coverFile.name : 'Belum ada gambar yang dipilih'}</p>
                  {coverPreview && (
                    <div className="bg-white p-2 rounded-[16px] inline-block shadow-sm border border-black/5">
                      <Image src={coverPreview} alt="Pratinjau Sampul" width={100} height={144} className="h-32 w-auto object-cover rounded-[8px]" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4 mb-2 block">Sinopsis</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4}
                placeholder="Tuliskan sinopsis buku secara singkat..."
                className="w-full px-6 py-5 bg-white border border-black/5 rounded-[32px] text-[15px] font-[450] text-[var(--color-ink)] placeholder:text-[var(--color-slate)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:border-transparent transition-all shadow-sm resize-none" />
            </div>

            <div className="col-span-1 md:col-span-2 border-t border-[var(--color-ink)]/5 pt-8 mt-2">
              <label className="inline-flex items-center gap-4 cursor-pointer select-none group">
                <div className="relative">
                  <input type="checkbox" checked={isEbook} onChange={(e) => setIsEbook(e.target.checked)} className="sr-only peer" />
                  <div className="w-6 h-6 border-2 border-[var(--color-ink)]/20 rounded-md flex items-center justify-center transition peer-checked:bg-[var(--color-ink)] peer-checked:border-[var(--color-ink)] group-hover:border-[var(--color-ink)]/40">
                    <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <span className="text-[16px] font-[500] text-[var(--color-ink)]">Buku ini tersedia dalam format digital (E-book)</span>
              </label>
            </div>
            
            {isEbook && (
              <div className="col-span-1 md:col-span-2 ml-0 sm:ml-10">
                <label className="text-[14px] font-[500] text-[var(--color-ink)] pl-4 mb-2 block">Upload File PDF</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/40 p-4 rounded-[24px] sm:rounded-full border border-black/5">
                  <label className="cursor-pointer shrink-0 w-full sm:w-auto">
                    <span className="mc-btn-secondary py-3 sm:py-2 px-6 inline-block cursor-pointer text-[14px] w-full sm:w-auto text-center">
                      Pilih PDF
                    </span>
                    <input type="file" accept=".pdf,application/pdf" onChange={(e) => setEbookFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                  <p className="text-[14px] text-[var(--color-slate)] font-[450] truncate pr-4">{ebookFile ? ebookFile.name : 'Belum ada file dipilih'}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 mt-8 border-t border-[var(--color-ink)]/5">
            <button type="submit" disabled={loading}
              className="mc-btn-primary w-full sm:w-auto px-10 py-4 shadow-md disabled:opacity-50 flex justify-center items-center">
              {uploadStatus || (loading ? 'Menyimpan...' : 'Simpan Buku Baru')}
            </button>
            <button type="button" onClick={() => router.push('/books')}
              className="mc-btn-secondary w-full sm:w-auto px-10 py-4">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
