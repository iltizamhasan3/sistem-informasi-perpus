import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">SiPustaka</h1>
          <div className="space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary-light transition"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Sistem Informasi Perpustakaan Digital
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Kelola peminjaman buku, pantau stok, dan akses katalog dengan mudah.
            Solusi modern untuk perpustakaan Anda.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              Mulai Sekarang
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary-light transition"
            >
              Masuk
            </Link>
          </div>
        </section>

        <section className="bg-primary-light py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="font-semibold text-lg mb-2">Manajemen Buku</h3>
                <p className="text-gray-600 text-sm">
                  Tambah, edit, dan kelola koleksi buku dengan katalog dan kategori.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="font-semibold text-lg mb-2">Peminjaman Mudah</h3>
                <p className="text-gray-600 text-sm">
                  Proses peminjaman dan pengembalian cepat dengan perhitungan denda otomatis.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="font-semibold text-lg mb-2">Laporan & Statistik</h3>
                <p className="text-gray-600 text-sm">
                  Pantau tren peminjaman, buku populer, dan hasilkan laporan.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} SiPustaka. All rights reserved.
      </footer>
    </div>
  )
}
