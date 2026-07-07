export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-canvas-cream)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#e6e6e6] border-t-black rounded-full animate-spin" />
    </div>
  )
}
