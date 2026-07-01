'use client'

import { useEffect } from 'react'

export function ConfirmModal({ open, title, message, confirmLabel = 'Ya', cancelLabel = 'Batal', loading, onConfirm, onCancel }: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onCancel}>
      <div className="bg-white rounded-[24px] shadow-sm p-8 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[18px] font-bold text-black mb-2">{title}</h3>
        <p className="text-[15px] font-light text-black/60 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} disabled={loading}
            className="px-5 py-[10px] bg-white text-black rounded-[50px] text-[15px] font-light border border-[#e6e6e6] transition hover:bg-[#c5b0f4]/10 disabled:opacity-40">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[15px] font-light transition hover:bg-gray-800 disabled:opacity-40">
            {loading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
