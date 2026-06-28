'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Category {
  id: number
  name: string
}

export default function EditBookPage() {
  const router = useRouter()
  const params = useParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    title: '', author: '', publisher: '', year: '', categoryId: '', stock: '1', description: '',
  })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [existingCover, setExistingCover] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(d.categories))
    fetch(`/api/books/${params.id}`).then((r) => r.json()).then((d) => {
      if (d.book) {
        setForm({
          title: d.book.title,
          author: d.book.author,
          publisher: d.book.publisher || '',
          year: d.book.year?.toString() || '',
          categoryId: d.book.categoryId.toString(),
          stock: d.book.stock.toString(),
          description: d.book.description || '',
        })
        if (d.book.coverImage) setExistingCover(d.book.coverImage)
      }
    })
  }, [params.id])

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    let coverImage = existingCover
    if (coverFile) {
      setUploading(true)
      const fd = new FormData()
      fd.append('file', coverFile)
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
      const uploadData = await uploadRes.json()
      setUploading(false)
      if (!uploadRes.ok) { setError(uploadData.error); setLoading(false); return }
      coverImage = uploadData.url
    }

    const res = await fetch(`/api/books/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, coverImage }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    router.push('/books')
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Edit Buku</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 max-w-2xl space-y-4">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pengarang *</label>
            <input type="text" required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Penerbit</label>
            <input type="text" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
            <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
            <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Pilih kategori</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
            <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampul Buku</label>
            <input type="file" accept="image/*" onChange={handleCoverUpload}
              className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:border-0 file:rounded-lg file:bg-gray-100 file:text-sm file:font-medium hover:file:bg-gray-200" />
            {(coverPreview || existingCover) && (
              <img src={coverPreview || existingCover} className="mt-2 h-32 object-contain rounded border" />
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading || uploading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
            {uploading ? 'Mengunggah...' : loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition">
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
