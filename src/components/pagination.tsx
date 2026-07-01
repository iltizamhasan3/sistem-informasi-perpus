'use client'

export function Pagination({ page, totalPages, total, onPageChange }: {
  page: number
  totalPages: number
  total: number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between mt-8">
      <span className="text-[14px] font-light text-black/40">Total {total}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-4 py-2 rounded-[50px] border border-[#e6e6e6] text-[14px] font-light text-black transition hover:bg-[#c5b0f4]/10 disabled:opacity-30 disabled:pointer-events-none">
          Sebelumnya
        </button>
        <span className="text-[14px] font-light text-black/50 px-2">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-4 py-2 rounded-[50px] border border-[#e6e6e6] text-[14px] font-light text-black transition hover:bg-[#c5b0f4]/10 disabled:opacity-30 disabled:pointer-events-none">
          Selanjutnya
        </button>
      </div>
    </div>
  )
}
