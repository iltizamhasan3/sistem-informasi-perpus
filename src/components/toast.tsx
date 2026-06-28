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

  const bg = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div className={`${bg} text-white px-5 py-3 rounded-xl shadow-lg text-sm flex items-center gap-3`}>
        <span>{message}</span>
        <button onClick={onClose} className="text-white/80 hover:text-white font-bold">&times;</button>
      </div>
    </div>
  )
}
