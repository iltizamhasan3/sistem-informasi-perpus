'use client'

import { useEffect } from 'react'

export function Toast({ message, type = 'success', onClose, duration = 4000 }: {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const bg = type === 'success' ? 'bg-[#c8e6cd] text-black' : type === 'error' ? 'bg-[#f3c9b6] text-black' : 'bg-[#f7f7f5] text-black'

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div className={`${bg} px-5 py-3 rounded-[12px] text-[15px] font-light flex items-center gap-3 shadow-sm border border-[#e6e6e6]`}>
        <span>{message}</span>
        <button onClick={onClose} className="text-black/40 hover:text-[#60619C] font-bold transition">&times;</button>
      </div>
    </div>
  )
}
