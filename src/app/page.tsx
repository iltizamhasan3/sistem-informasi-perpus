import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function HomePage() {
  const user = await getCurrentUser()
  if (user) {
    redirect(user.role === 'admin' ? '/dashboard' : '/catalog')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] relative overflow-hidden font-sans">
      {/* Background Decorative Glow Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-[#c5b0f4]/20 to-[#9fbee7]/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#f3c9b6]/15 to-[#c5b0f4]/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Glassmorphic Navbar */}
      <header className="sticky top-0 z-50 glass-header">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center transition group-hover:scale-105 shadow-md">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6v13" /><path d="M12 6a4 4 0 0 0-4-4H2v16h6a4 4 0 0 1 4 4" /><path d="M12 6a4 4 0 0 1 4-4h6v16h-6a4 4 0 0 0-4 4" />
              </svg>
            </div>
            <span className="text-[18px] font-bold tracking-tight text-black font-display">SiPustaka</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="px-5 py-[8px] bg-white/60 hover:bg-white text-black rounded-full text-[14px] font-medium border border-black/5 backdrop-blur-md transition-all">
              Masuk
            </Link>
            <Link href="/register"
              className="px-5 py-[9px] btn-gradient rounded-full text-[14px] font-medium transition-all shadow-sm">
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col z-10 relative">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 w-full flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#c5b0f4]/15 border border-[#c5b0f4]/25 text-[#3d4f97] text-[12px] font-medium tracking-wide mb-6 animate-fade-in uppercase">
            <span>✨</span> Sistem Perpustakaan Digital Generasi Baru
          </div>
          <h1 className="text-[44px] md:text-[68px] font-extrabold tracking-[-0.04em] leading-[1.05] text-black max-w-4xl font-display">
            Membuka Gerbang <span className="bg-gradient-to-r from-[#3D4F97] via-[#60619C] to-[#8BA1D4] bg-clip-text text-transparent">Pengetahuan Tanpa Batas</span>
          </h1>
          <p className="text-[17px] md:text-[20px] font-light leading-relaxed text-black/60 mt-6 max-w-2xl">
            Kelola peminjaman buku, akses e-book favorit, dan pantau aktivitas perpustakaan dengan cara yang menyenangkan, cepat, dan modern.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-10 justify-center w-full sm:w-auto">
            <Link href="/register"
              className="px-8 py-[14px] btn-gradient rounded-full text-[16px] font-semibold text-center transition-all shadow-md">
              Mulai Sekarang
            </Link>
            <Link href="/catalog"
              className="px-8 py-[14px] bg-white/80 hover:bg-white text-black rounded-full text-[16px] font-medium text-center border border-black/10 transition-all backdrop-blur-md">
              Lihat Katalog Buku
            </Link>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="max-w-6xl mx-auto px-6 pb-24 w-full">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-card hover-scale-card rounded-[24px] p-8 flex flex-col items-start">
              <div className="w-12 h-12 bg-[#c5b0f4]/15 rounded-2xl flex items-center justify-center mb-6 border border-[#c5b0f4]/20 shadow-inner">
                <svg className="w-5 h-5 text-[#3d4f97]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h3 className="text-[18px] font-bold text-black mb-3 font-display">Manajemen Buku</h3>
              <p className="text-[14px] font-light text-black/60 leading-relaxed">
                Kelola koleksi fisik dan e-book Anda dengan pengelompokan kategori yang terorganisir serta pencarian pintar yang instan.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card hover-scale-card rounded-[24px] p-8 flex flex-col items-start">
              <div className="w-12 h-12 bg-[#c8e6cd]/20 rounded-2xl flex items-center justify-center mb-6 border border-[#c8e6cd]/30 shadow-inner">
                <svg className="w-5 h-5 text-[#2e6d39]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="text-[18px] font-bold text-black mb-3 font-display">Peminjaman &amp; Sewa</h3>
              <p className="text-[14px] font-light text-black/60 leading-relaxed">
                Sewa e-book secara online untuk dibaca langsung di browser Anda, atau lakukan booking peminjaman fisik dengan denda yang dinormalisasi secara adil.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card hover-scale-card rounded-[24px] p-8 flex flex-col items-start">
              <div className="w-12 h-12 bg-[#f3c9b6]/20 rounded-2xl flex items-center justify-center mb-6 border border-[#f3c9b6]/30 shadow-inner">
                <svg className="w-5 h-5 text-[#c15622]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
                </svg>
              </div>
              <h3 className="text-[18px] font-bold text-black mb-3 font-display">Laporan Terpadu</h3>
              <p className="text-[14px] font-light text-black/60 leading-relaxed">
                Pantau statistik transaksi harian, buku terpopuler, dan notifikasi aktivitas penting melalui sistem dasbor admin yang interaktif.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 border-t border-black/5 py-8 text-center backdrop-blur-md z-10 relative">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-black/80 font-display">SiPustaka</span>
            <span className="text-[14px] text-black/30">|</span>
            <p className="text-[13px] font-light text-black/50">Perpustakaan Digital Mahasiswa &amp; Siswa</p>
          </div>
          <p className="text-[13px] font-light text-black/40">&copy; {new Date().getFullYear()} SiPustaka. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
