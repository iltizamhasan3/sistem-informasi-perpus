'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { pdfjs, Document, Page } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

const CDNS = [
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`,
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`,
]
pdfjs.GlobalWorkerOptions.workerSrc = CDNS[0]

function useFallbackWorker() {
  if (CDNS[1]) {
    pdfjs.GlobalWorkerOptions.workerSrc = CDNS[1]
    CDNS[1] = ''
  }
}

export function PdfRenderer({ pdfUrl, rentalId, initialPage }: { pdfUrl: string; rentalId: number; initialPage: number }) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(initialPage)
  const [error, setError] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const savePage = useCallback((page: number) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      fetch('/api/ebooks/page', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rentalId, page }),
      }).catch(() => {})
    }, 2000)
  }, [rentalId])

  useEffect(() => {
    return () => clearTimeout(saveTimer.current)
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white rounded-[12px] border border-[#e6e6e6] p-3 inline-block" onContextMenu={(e) => e.preventDefault()}>
        {error ? (
          <div className="flex flex-col items-center gap-3 py-12 px-8">
            <p className="text-[15px] font-light text-black/60">{error}</p>
            <button onClick={() => { useFallbackWorker(); setError('') }}
              className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition">
              Coba CDN alternatif
            </button>
          </div>
        ) : (
          <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={(e) => setError(e?.message || 'Gagal memuat PDF')}
            loading={<div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-[#c5b0f4] border-t-transparent rounded-full animate-spin" /></div>}>
            <Page pageNumber={pageNumber} renderTextLayer renderAnnotationLayer
              width={Math.min(typeof window !== 'undefined' ? window.innerWidth - 80 : 800, 800)} />
          </Document>
        )}
      </div>
      {numPages > 0 && (
        <div className="flex items-center justify-center gap-4 py-2">
          <button onClick={() => { const p = Math.max(1, pageNumber - 1); setPageNumber(p); savePage(p) }} disabled={pageNumber <= 1}
            className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition disabled:opacity-30">
            Prev
          </button>
          <span className="text-[14px] font-light text-black/40">Halaman {pageNumber} dari {numPages}</span>
          <button onClick={() => { const p = Math.min(numPages, pageNumber + 1); setPageNumber(p); savePage(p) }} disabled={pageNumber >= numPages}
            className="px-5 py-[10px] bg-black text-white rounded-[50px] text-[14px] font-light hover:bg-gray-800 transition disabled:opacity-30">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
