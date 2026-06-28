'use client'

export function Pagination({ page, totalPages, total, onPageChange }: {
  page: number
  totalPages: number
  total: number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between mt-6 text-sm">
      <span className="text-gray-500">Total {total}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
        >
          Sebelumnya
        </button>
        <span className="text-gray-600">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  )
}
