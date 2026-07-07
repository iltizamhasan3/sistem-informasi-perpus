'use client'

export function Pagination({ page, totalPages, total, onPageChange }: {
  page: number
  totalPages: number
  total: number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 w-full">
      <span className="hidden sm:inline-block text-[13px] font-medium text-[var(--color-slate)] mr-2">Total: {total}</span>
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 sm:px-4 sm:py-2 rounded-full border border-black/5 text-[13px] font-medium text-[var(--color-ink)] transition hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center">
          <svg className="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>
        <span className="text-[13px] font-medium text-[var(--color-ink)] px-2 sm:px-3 bg-white shadow-sm border border-black/5 rounded-full py-1.5">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 sm:px-4 sm:py-2 rounded-full border border-black/5 text-[13px] font-medium text-[var(--color-ink)] transition hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center">
          <span className="hidden sm:inline">Selanjutnya</span>
          <svg className="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  )
}

