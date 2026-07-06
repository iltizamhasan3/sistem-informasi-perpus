<div align="center">
  <img src="https://img.icons8.com/fluency/144/book.png" alt="SiPustaka Logo" width="120"/>
  <h1 align="center" style="margin: 0; font-size: 2.5rem;">📚 SiPustaka</h1>
  <p align="center"><strong>Sistem Informasi Perpustakaan Premium & Modern</strong></p>
  <p align="center">
    Aplikasi manajemen perpustakaan yang mengusung desain elegan, minimalis, dan sangat responsif—ditenagai oleh Next.js, Supabase, dan PostgreSQL.
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16.2.9-black?style=flat&logo=next.js" alt="Next.js"/>
    <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat&logo=react" alt="React"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss" alt="Tailwind CSS"/>
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase" alt="Supabase"/>
    <img src="https://img.shields.io/badge/Prisma-7.8.0-2D3748?style=flat&logo=prisma" alt="Prisma"/>
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql" alt="PostgreSQL"/>
  </p>
</div>

---

## 🌟 Sorotan Utama (Highlight)

Sistem Informasi Perpustakaan ini dibangun dengan filosofi desain **Mastercard-inspired UI/UX** yang memberikan kesan _premium_, bersih, dan memukau:

- 🎨 **Estetika Premium:** Kombinasi warna _Lifted Cream_ (#FAF9F5) dan _Ink Black_ (#0A0A0A) dengan _ghost watermark background_ yang dinamis.
- 🏟️ **Stadium Cards Layout:** Seluruh kontainer informasi menggunakan radius elips yang elegan (`mc-card-stadium`), menciptakan pengalaman visual yang _flowy_.
- 📱 **Mobile-First & Responsif:** Tipografi menggunakan fungsi `clamp()` sehingga proporsional di semua layar, serta struktur layout yang otomatis beradaptasi dengan _smartphone_ tanpa tumpang tindih (_overlapping_).
- 🚀 **Performa Tinggi:** Menggunakan Next.js App Router dengan _server-side rendering_ (SSR) dan manajemen status yang efisien.

---

## ✨ Fitur Lengkap

### 👨‍💼 Panel Admin (Manajemen Inti)
| Ikon | Fitur | Penjelasan |
|:---:|---|---|
| 📊 | **Dashboard Analitik** | Statistik real-time, grafik buku terpopuler, hingga peringatan stok menipis. |
| 👥 | **Manajemen Pengguna** | CRUD (Create, Read, Update, Delete) anggota perpustakaan secara mudah. |
| 📚 | **Sistem Katalog Buku** | Manajemen koleksi buku fisik lengkap dengan fitur *upload* sampul buku (_Supabase Storage_). |
| 💻 | **Manajemen E-Book** | *Upload* file PDF digital yang dilindungi dengan aman untuk disewa secara _online_. |
| 🔀 | **Transaksi Fisik** | Input peminjaman dan pengembalian buku di tempat dengan sistem auto-validasi stok maksimal (3 buku). |
| 🗂️ | **Sistem Kategori** | Labelisasi dan kategori buku untuk memudahkan kurasi. |
| 📄 | **Ekspor Laporan CSV** | Ekspor data transaksi, buku, dan anggota hanya dengan satu klik. |

### 👤 Portal Member (Pengalaman Pengguna)
| Ikon | Fitur | Penjelasan |
|:---:|---|---|
| 🛒 | **Booking 24 Jam** | Member bisa "pesan" buku incaran dari rumah (maksimal 24 jam) sebelum diambil di perpustakaan. Jika lewat waktu, sistem membatalkan otomatis. |
| 📱 | **E-Book Reader** | Sewa buku digital (selama 2 hari) dan baca langsung via *in-app PDF Viewer* tanpa opsi *download* (anti-pembajakan). |
| 💾 | **Last Page Saved** | Sistem mengingat persis di halaman berapa *e-book* terakhir dibaca (sinkronisasi Cloud). |
| 💸 | **Denda Otomatis** | Perhitungan denda keterlambatan pengembalian buku (Rp 2.000/hari). |
| 🎫 | **Riwayat & Status** | Pantau status _booking_ (aktif/batal/selesai), status e-book, dan buku fisik yang sedang dipinjam secara langsung. |
| 🔔 | **Notifikasi Real-time** | Pengingat in-app saat buku hampir jatuh tempo atau *booking* telah disetujui. |
| 🔍 | **Pencarian Katalog** | Eksplorasi literatur dengan filter, hover membesar (_micro-animation_), dan desain sampul yang menonjol. |

---

## 🚀 Teknologi yang Digunakan

SiPustaka dibangun dengan _stack_ paling modern di ekosistem JavaScript:

*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width="18"/> **Next.js 16.2.9** — Framework utama (App Router).
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="18"/> **TypeScript 5** — *Type-safety* di seluruh sisi _frontend_ dan _backend_.
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="18"/> **Tailwind CSS v4** — Framework CSS *utility-first* dengan konfigurasi khusus *design system*.
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" width="18"/> **Supabase** — Autentikasi aman terintegrasi (JWT), dan Cloud Storage untuk _asset_.
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="18"/> **PostgreSQL** — Basis data relasional tangguh.
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" width="18"/> **Prisma ORM 7** — Transaksi basis data yang intuitif dan terstruktur dengan *schema*.
*   📄 **react-pdf** — *Engine rendering* dokumen untuk fitur E-Book Reader interaktif.

---

## 🗂️ Peta Situs (Route Structure)

Aplikasi ini menggunakan perutean modular yang sangat terpisah antara publik, admin, dan anggota:

### 🌐 Publik & Autentikasi
*   `/` → Halaman *Landing* memukau dengan *ghost watermark* "LIBRARY"
*   `/login` → Gerbang masuk (Otomatis mendeteksi Admin vs Anggota)
*   `/register` → Pendaftaran anggota baru secara mandiri

### 🛡️ Zona Admin (Restricted)
*   `/dashboard` → Pusat kendali & analitik
*   `/books`, `/books/create`, `/books/[id]/edit` → Manajemen inventaris pustaka
*   `/categories` → Pengelompokan literatur
*   `/members`, `/members/create`, `/members/[id]/edit` → Direktori anggota
*   `/transactions`, `/transactions/borrow`, `/transactions/return` → Meja sirkulasi dan sinkronisasi peminjaman

### 🙋‍♂️ Zona Anggota (Restricted)
*   `/catalog`, `/catalog/[id]` → Etalase buku dan portal _Booking_ / _Rent E-Book_
*   `/my-borrowings` → Lemari peminjaman buku fisik aktif
*   `/my-bookings` → Dompet tiket pesanan buku (*reserved*)
*   `/my-ebooks` → Rak koleksi buku digital sewaan
*   `/reader/[rentalId]` → Portal PDF Viewer mode layar penuh

---

## ⚙️ Petunjuk Instalasi & Menjalankan (Local Development)

Ikuti langkah-langkah di bawah ini untuk menjalankan SiPustaka di komputer lokal Anda:

### 1. Kloning Repositori & Instal Dependensi

```bash
git clone https://github.com/iltizamhasan3/sistem-informasi-perpus.git
cd sistem-informasi-perpus
npm install
```

### 2. Atur Variabel Lingkungan (Environment Variables)

Buatlah sebuah file bernama `.env` di _root_ proyek, lalu sesuaikan isinya:

```env
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:5432/[DB_NAME]"
SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
SUPABASE_PUBLISHABLE_KEY="[YOUR_ANON_KEY]"
SUPABASE_SECRET_KEY="[YOUR_SERVICE_ROLE_KEY]"
SUPABASE_JWKS_URL="https://[YOUR_PROJECT_ID].supabase.co/auth/v1/.well-known/jwks.json"
```

### 3. Setup Database (Migrasi & Seed)

Singkronkan *schema* Prisma dengan PostgreSQL dan isi data contoh (*seeding*):

```bash
npx prisma migrate dev
npm run seed
```

### 4. Menyalakan Server Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser favorit Anda.

---

## 📦 Kumpulan Script (`package.json`)

```bash
npm run dev      # Memulai server Next.js (Hot Reload)
npm run build    # Kompilasi aplikasi untuk lingkungan Produksi
npm run start    # Menjalankan server Produksi yang telah di-build
npm run seed     # Memasukkan data dummy awal ke database
npm run lint     # Mengecek kualitas kode (ESLint)
```

---

## 🧑‍💻 Hak Cipta & Penulis

Dikembangkan dengan kebanggaan oleh:
**Iltizam Hasan** — Temukan saya di GitHub [@iltizamhasan3](https://github.com/iltizamhasan3)
