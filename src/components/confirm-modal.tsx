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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-[var(--color-lifted-cream)] rounded-[40px] shadow-[0_24px_48px_0_rgba(0,0,0,0.08)] p-10 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="mc-heading-3 text-[var(--color-ink)] mb-3">{title}</h3>
        <p className="text-[16px] font-[450] text-[var(--color-slate)] mb-10 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} disabled={loading}
            className="mc-btn-secondary disabled:opacity-40">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="bg-[var(--color-signal)] text-white rounded-[24px] px-[30px] py-[8px] text-[15px] font-[500] tracking-tight transition hover:bg-[#b53c00] disabled:opacity-40 border-none">
            {loading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
