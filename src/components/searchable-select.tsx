'use client'

import { useState, useRef, useEffect } from 'react'

export interface Option {
  id: string
  label: string
}

interface Props {
  options: Option[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  className?: string
}

export function SearchableSelect({ options, value, onChange, placeholder = 'Pilih...', className = '' }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((o) => o.id === value)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setQuery('') // Reset query when clicking outside
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = query === '' 
    ? options 
    : options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))

  // Prevent default focus behaviors when clicking the input wrapper to open dropdown without typing immediately
  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        placeholder={placeholder}
        className={className}
        value={isOpen ? query : (selectedOption?.label || '')}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
      />
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#141413]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <ul className="absolute z-50 w-full mt-2 bg-white border border-black/5 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-h-[250px] overflow-auto">
          {filteredOptions.length === 0 ? (
            <li className="px-6 py-4 text-[14px] text-[#939393] font-[450]">Pencarian tidak ditemukan.</li>
          ) : (
            filteredOptions.map((opt) => (
              <li
                key={opt.id}
                onClick={() => {
                  onChange(opt.id)
                  setIsOpen(false)
                  setQuery('')
                }}
                className={`px-6 py-3 cursor-pointer text-[15px] font-[450] text-[#141413] hover:bg-[#faf9f5] transition-colors ${opt.id === value ? 'bg-[#faf9f5]' : ''}`}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
