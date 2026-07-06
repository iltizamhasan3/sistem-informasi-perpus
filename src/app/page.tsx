import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function HomePage() {
  const user = await getCurrentUser()
  if (user) {
    redirect(user.role === 'admin' ? '/dashboard' : '/catalog')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)] relative overflow-hidden font-sans z-10">
      
      {/* Ghost Watermark Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[-1] pointer-events-none w-[150%] text-center mt-12 md:mt-0">
         <h1 className="mc-ghost-watermark select-none text-[180px] md:text-[300px]">LIBRARY</h1>
      </div>

      {/* Navbar */}
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="mc-nav-pill flex items-center justify-between w-full max-w-[1200px]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-[var(--color-ink)] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6v13" /><path d="M12 6a4 4 0 0 0-4-4H2v16h6a4 4 0 0 1 4 4" /><path d="M12 6a4 4 0 0 1 4-4h6v16h-6a4 4 0 0 0-4 4" />
              </svg>
            </div>
            <span className="font-[500] text-xl tracking-tight text-[var(--color-ink)]">SiPustaka</span>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/login" className="text-[14px] md:text-[15px] font-[500] text-[var(--color-slate)] hover:text-[var(--color-ink)] transition-colors px-3 md:px-4">
              Masuk
            </Link>
            <Link href="/register" className="mc-btn-primary px-4 md:px-6 py-2.5 text-[13px] md:text-[14px]">
              Daftar Sekarang
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center pt-[140px] md:pt-[180px] pb-24 px-4 md:px-6 max-w-[1200px] mx-auto w-full">
        
        {/* Hero Section */}
        <section className="mc-card-stadium p-8 md:p-20 text-center w-full flex flex-col items-center mb-12 md:mb-16 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.05)]">
          <p className="mc-eyebrow text-[var(--color-slate)] mb-4 md:mb-6">Masa Depan Literasi Digital</p>
          <h1 className="mc-heading-1 text-[var(--color-ink)] max-w-4xl mb-6 md:mb-8 leading-[1.1]">
            Membuka Gerbang<br/>Pengetahuan Tanpa Batas
          </h1>
          <p className="text-[16px] md:text-[20px] font-[450] text-[var(--color-slate)] max-w-2xl leading-relaxed mb-10 md:mb-12">
            Kelola peminjaman buku, akses e-book eksklusif, dan pantau sirkulasi perpustakaan dengan pendekatan yang elegan dan modern.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <Link href="/register" className="mc-btn-primary px-10 py-4 text-[16px] shadow-md hover:-translate-y-1 transition-transform w-full sm:w-auto">
              Mulai Eksplorasi
            </Link>
            <Link href="/login" className="mc-btn-secondary px-10 py-4 text-[16px] w-full sm:w-auto">
              Pelajari Fitur
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Feature 1 */}
          <div className="bg-[var(--color-lifted-cream)] rounded-[32px] p-8 md:p-10 hover:shadow-lg transition-all duration-300 group border border-white/50">
            <div className="w-14 h-14 bg-[var(--color-ink)] rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h3 className="text-[20px] font-[500] text-[var(--color-ink)] mb-3">Katalog Tersinkronisasi</h3>
            <p className="text-[15px] font-[450] text-[var(--color-slate)] leading-relaxed">
              Temukan berbagai literatur dengan pencarian instan dan sistem pengelompokan tingkat lanjut.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[var(--color-lifted-cream)] rounded-[32px] p-8 md:p-10 hover:shadow-lg transition-all duration-300 group border border-white/50">
            <div className="w-14 h-14 bg-[var(--color-ink)] rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="text-[20px] font-[500] text-[var(--color-ink)] mb-3">Sirkulasi Cerdas</h3>
            <p className="text-[15px] font-[450] text-[var(--color-slate)] leading-relaxed">
              Ajukan peminjaman buku fisik dan akses ruang baca digital di mana pun Anda berada tanpa kendala.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[var(--color-lifted-cream)] rounded-[32px] p-8 md:p-10 hover:shadow-lg transition-all duration-300 group border border-white/50">
            <div className="w-14 h-14 bg-[var(--color-ink)] rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
              </svg>
            </div>
            <h3 className="text-[20px] font-[500] text-[var(--color-ink)] mb-3">Ekosistem Analitik</h3>
            <p className="text-[15px] font-[450] text-[var(--color-slate)] leading-relaxed">
              Analisis performa transaksi secara komprehensif lewat tampilan dasbor kontrol berbasis data yang intuitif.
            </p>
          </div>
        </section>

      </main>

      <footer className="w-full pb-10 text-center">
         <p className="text-[13px] font-[450] text-[var(--color-slate)]/50">&copy; {new Date().getFullYear()} SiPustaka. All rights reserved.</p>
      </footer>
    </div>
  )
}
