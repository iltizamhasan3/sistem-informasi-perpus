'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Toast } from '@/components/toast'

interface Book { id: number; title: string; author: string; stock: number }
interface Member { id: number; name: string; email: string }

export default function BorrowPage() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [bookId, setBookId] = useState('')
  const [memberId, setMemberId] = useState('')
  const [userRole, setUserRole] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/books').then((r) => r.json()),
      fetch('/api/members').then((r) => r.json()),
    ])
      .then(([auth, booksData, membersData]) => {
        if (auth.user) setUserRole(auth.user.role)
        setBooks(booksData.books || [])
        setMembers(membersData.members || [])
      })
      .catch(() => setError('Gagal memuat data'))
      .finally(() => setPageLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const body: Record<string, string> = { bookId }

    if (userRole === 'admin' && memberId) {
      body.memberId = memberId
    }

    try {
      const res = await fetch('/api/transactions/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal meminjam buku')
      setToast({ type: 'success', message: 'Buku berhasil dipinjam!' })
      setTimeout(() => router.push('/transactions'), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal meminjam buku')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Peminjaman Buku</h2>

      {pageLoading ? <LoadingSpinner /> : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 max-w-lg space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          {userRole === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anggota</label>
              <select value={memberId} onChange={(e) => setMemberId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Pilih anggota</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buku</label>
            <select value={bookId} onChange={(e) => setBookId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Pilih buku</option>
              {books.filter((b) => b.stock > 0).map((b) => (
                <option key={b.id} value={b.id}>{b.title} - {b.author} (stok: {b.stock})</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading || !bookId || (userRole === 'admin' && !memberId)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
              {loading ? 'Memproses...' : 'Pinjam Buku'}
            </button>
            <button type="button" onClick={() => router.back()}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition">Batal</button>
          </div>
        </form>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  )
}
