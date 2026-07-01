import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function HomePage() {
  const user = await getCurrentUser()
  if (user) {
    redirect(user.role === 'admin' ? '/dashboard' : '/catalog')
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-white border-b border-[#e6e6e6]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6v13" /><path d="M12 6a4 4 0 0 0-4-4H2v16h6a4 4 0 0 1 4 4" /><path d="M12 6a4 4 0 0 1 4-4h6v16h-6a4 4 0 0 0-4 4" />
              </svg>
            </div>
            <span className="text-[16px] font-medium text-black tracking-tight">SiPustaka</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="px-5 py-[8px] bg-white text-black rounded-[50px] text-[14px] font-light border border-[#e6e6e6] transition hover:bg-[#f7f7f5]">
              Masuk
            </Link>
            <Link href="/register"
              className="px-5 py-[8px] bg-black text-white rounded-[50px] text-[14px] font-light transition hover:bg-gray-800">
              Daftar
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-[#f4ecd6] rounded-[24px] mx-4 my-8 p-12 md:p-16 max-w-6xl md:mx-auto">
          <div className="max-w-2xl">
            <p className="font-mono text-sm uppercase tracking-[0.05em] text-black/40 mb-4">SiPustaka</p>
            <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.03em] leading-[1.05] text-black">
              Sistem Informasi Perpustakaan Digital
            </h1>
            <p className="text-[18px] md:text-[20px] font-light leading-relaxed text-black/50 mt-5 max-w-xl">
              Kelola peminjaman buku, pantau stok, dan akses katalog dengan mudah. Solusi modern untuk perpustakaan Anda.
            </p>
            <div className="flex gap-3 mt-8">
              <Link href="/register"
                className="px-6 py-[12px] bg-black text-white rounded-[50px] text-[16px] font-light transition hover:bg-gray-800">
                Mulai Sekarang
              </Link>
              <Link href="/login"
                className="px-6 py-[12px] bg-white text-black rounded-[50px] text-[16px] font-light border border-[#e6e6e6] transition hover:bg-[#f7f7f5]">
                Masuk
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-white rounded-[24px] border border-[#e6e6e6] p-7">
              <div className="w-10 h-10 bg-[#c5b0f4]/30 rounded-full flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h3 className="text-[17px] font-bold text-black mb-2">Manajemen Buku</h3>
              <p className="text-[15px] font-light text-black/50 leading-relaxed">
                Tambah, edit, dan kelola koleksi buku dengan katalog dan kategori yang terorganisir.
              </p>
            </div>
            <div className="bg-white rounded-[24px] border border-[#e6e6e6] p-7">
              <div className="w-10 h-10 bg-[#c8e6cd]/30 rounded-full flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="text-[17px] font-bold text-black mb-2">Peminjaman Mudah</h3>
              <p className="text-[15px] font-light text-black/50 leading-relaxed">
                Proses peminjaman dan pengembalian cepat dengan perhitungan denda otomatis.
              </p>
            </div>
            <div className="bg-white rounded-[24px] border border-[#e6e6e6] p-7">
              <div className="w-10 h-10 bg-[#f3c9b6]/30 rounded-full flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
                </svg>
              </div>
              <h3 className="text-[17px] font-bold text-black mb-2">Laporan &amp; Statistik</h3>
              <p className="text-[15px] font-light text-black/50 leading-relaxed">
                Pantau tren peminjaman, buku populer, dan hasilkan laporan secara real-time.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-[#e6e6e6] px-4 py-6 text-center">
        <p className="text-[13px] font-light text-black/40">&copy; {new Date().getFullYear()} SiPustaka. All rights reserved.</p>
      </footer>
    </div>
  )
}
