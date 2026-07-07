<div align="center">
  <img src="https://img.icons8.com/fluency/144/book.png" alt="SiPustaka Logo" width="100"/>
  <h1 align="center" style="margin: 0; font-size: 2.8rem;">📚 SiPustaka</h1>
  <p align="center"><strong>Sistem Informasi Perpustakaan Premium & Modern</strong></p>
  <p align="center">
    Aplikasi manajemen perpustakaan berbasis web yang mengusung desain elegan, minimalis, dan sangat responsif—ditenagai oleh Next.js, Supabase, dan PostgreSQL.
  </p>
  <p align="center">
    <a href="https://sistem-informasi-perpus.vercel.app" target="_blank">
      <img src="https://img.shields.io/badge/🌐_Live_Demo-sistem--informasi--perpus.vercel.app-0A0A0A?style=for-the-badge&logo=vercel" alt="Live Demo"/>
    </a>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js_16-black?style=flat&logo=next.js" alt="Next.js"/>
    <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react" alt="React"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat&logo=tailwindcss" alt="Tailwind CSS"/>
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase" alt="Supabase"/>
    <img src="https://img.shields.io/badge/Prisma_7-2D3748?style=flat&logo=prisma" alt="Prisma"/>
    <img src="https://img.shields.io/badge/TypeScript_5-3178C6?style=flat&logo=typescript" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql" alt="PostgreSQL"/>
  </p>
</div>

---

## 📋 Daftar Isi

- [Tentang Project](#-tentang-project)
- [Fitur Lengkap](#-fitur-lengkap)
- [Teknologi](#-teknologi)
- [Struktur Rute](#-struktur-rute)
- [Database Schema](#-database-schema)
- [Screenshot](#-screenshot)
- [Instalasi Lokal](#-instalasi-lokal)
- [Deployment](#-deployment)
- [Scripts](#-scripts)
- [Penulis](#-penulis)

---

## 🎯 Tentang Project

**SiPustaka** adalah sistem informasi perpustakaan digital modern yang dikembangkan untuk mengotomatisasi manajemen perpustakaan—mulai dari katalogisasi buku, peminjaman & pengembalian, booking buku, hingga penyewaan e-book digital. Aplikasi ini dirancang dengan filosofi desain **Mastercard-inspired UI/UX** yang memberikan kesan premium, bersih, dan memukau.

### 📊 Database Stats Saat Ini

| Statistik | Jumlah |
|:---|---:|
| 📚 Total Buku | **13** |
| 👥 Anggota Terdaftar | **2** |
| 🏷️ Kategori | **4** |
| 📋 Riwayat Transaksi | **1** |
| 📖 Peminjaman Aktif | **0** |

### 🎨 Filosofi Desain

- **Estetika Premium:** Kombinasi warna *Lifted Cream* (#FAF9F5) dan *Ink Black* (#0A0A0A) dengan *ghost watermark background* yang dinamis.
- **Stadium Cards Layout:** Seluruh kontainer informasi menggunakan radius elips yang elegan, menciptakan pengalaman visual yang *flowy*.
- **Mobile-First & Responsif:** Tipografi menggunakan fungsi `clamp()` sehingga proporsional di semua layar.
- **Micro-animations:** Efek hover, transisi halus, dan watermark animasi yang memperkaya pengalaman pengguna.

---

## ✨ Fitur Lengkap

### 👨‍💼 Panel Admin

| Ikon | Fitur | Deskripsi |
|:---:|---|---|
| 📊 | **Dashboard Analitik** | Statistik real-time, grafik buku terpopuler, peringatan stok menipis, dan ringkasan aktivitas harian. |
| 👥 | **Manajemen Anggota** | CRUD anggota perpustakaan, lihat riwayat peminjaman, dan status akun. |
| 📚 | **Manajemen Buku** | Kelola koleksi buku fisik lengkap dengan upload sampul via Supabase Storage, edit, dan soft-delete. |
| 📄 | **Manajemen E-Book** | Upload file PDF digital yang dilindungi — tidak bisa di-download, hanya dibaca via in-app reader. |
| 🔀 | **Transaksi Peminjaman** | Proses peminjaman & pengembalian buku fisik dengan auto-validasi stok (maks 3 buku/member). |
| 🔁 | **Transaksi Pengembalian** | Catat pengembalian dengan kalkulasi denda otomatis (Rp 2.000/hari keterlambatan). |
| 🗂️ | **Kategori Buku** | Kelola label kategori untuk memudahkan kurasi dan pencarian. |
| 📥 | **Ekspor CSV** | Ekspor data transaksi, buku, dan anggota ke format CSV dengan satu klik. |

### 👤 Portal Member

| Ikon | Fitur | Deskripsi |
|:---:|---|---|
| 🔍 | **Katalog Buku** | Eksplorasi koleksi dengan filter, animasi hover, dan desain sampul yang menonjol. |
| 🛒 | **Booking 24 Jam** | Pesan buku dari rumah, berlaku 24 jam. Jika lewat, sistem batalkan otomatis via cron. |
| 📖 | **E-Book Reader** | Baca buku digital langsung di browser — lengkap dengan navigasi halaman, tanpa opsi download. |
| 💾 | **Last Page Saved** | Sistem menyimpan halaman terakhir yang dibaca, sinkron otomatis ke cloud. |
| 📋 | **Status Peminjaman** | Pantau buku yang sedang dipinjam, riwayat, dan denda. |
| 🎫 | **Status Booking** | Lihat booking aktif, riwayat booking, dan status (aktif/batal/selesai). |
| 📱 | **My E-Books** | Koleksi e-book yang sedang disewa (masa sewa 2 hari, otomatis kedaluwarsa). |
| 🔔 | **Notifikasi** | Pengingat in-app saat buku hampir jatuh tempo atau booking disetujui. |

### 🔐 Autentikasi & Keamanan

- **Login 2 Langkah:** Email/password diverifikasi via Supabase Auth, dilanjutkan verifikasi OTP 6 digit yang dikirim ke email.
- **OTP via Resend:** Kode OTP dikirim secara real-time menggunakan Resend API.
- **JWT Token:** Session dikelola via httpOnly cookie dengan Supabase JWT.
- **Rate Limiting:** Proteksi brute-force dengan rate limiter per IP (10 percobaan/menit).
- **Role-based Access:** Pemisahan akses Admin vs Member dengan middleware dan route protection.
- **CSRF Protection:** Validasi origin pada setiap request API.

---

## 🛠️ Teknologi

### Frontend & Backend

| Teknologi | Versi | Fungsi |
|:---|---:|---|
| ⚛️ **Next.js** | 16.2.9 | Framework utama (App Router, SSR, API Routes) |
| 🟦 **TypeScript** | 5 | Type safety di seluruh stack |
| 🎨 **Tailwind CSS** | 4 | Utility-first CSS framework |
| 🗄️ **Prisma** | 7.8.0 | ORM untuk database PostgreSQL |
| 🐘 **PostgreSQL** | - | Database relasional (via Supabase) |
| 🔥 **Supabase** | - | Autentikasi, Storage, dan hosting database |
| 📧 **Resend** | - | Email service untuk pengiriman OTP |
| 📄 **react-pdf** | 10.4.1 | PDF viewer untuk e-book reader |
| 🚀 **Vercel** | - | Hosting & deployment |

### Package Lainnya

| Package | Fungsi |
|---|---|
| `@supabase/supabase-js` | Client SDK untuk Supabase Auth |
| `@supabase/server` | Supabase server-side context helper |
| `pg` | PostgreSQL driver untuk Prisma adapter |
| `dotenv` | Environment variable loader |
| `tsx` | TypeScript executor untuk script dan seed |
| `better-sqlite3` | SQLite driver (untuk development lokal) |

---

## 🗺️ Struktur Rute

### 🌐 Publik & Autentikasi

| Route | Deskripsi | Akses |
|:---|---|:---:|
| `/` | Halaman landing dengan ghost watermark "LIBRARY" | Publik |
| `/login` | Halaman login 2 langkah (email/password → OTP) | Publik |
| `/register` | Pendaftaran anggota baru | Publik |
| `/catalog` | Katalog publik tanpa login | Publik |
| `/catalog/[id]` | Detail buku | Publik |

### 🛡️ Admin (Role: `admin`)

| Route | Deskripsi |
|:---|---|
| `/dashboard` | Dashboard analitik & statistik real-time |
| `/books` | Manajemen koleksi buku |
| `/books/create` | Tambah buku baru |
| `/books/[id]/edit` | Edit detail buku |
| `/categories` | Manajemen kategori |
| `/members` | Direktori anggota |
| `/members/create` | Tambah anggota |
| `/members/[id]/edit` | Edit data anggota |
| `/transactions` | Riwayat transaksi |
| `/transactions/borrow` | Form peminjaman buku |
| `/transactions/return` | Form pengembalian buku |

### 🙋‍♂️ Member (Role: `member`)

| Route | Deskripsi |
|:---|---|
| `/my-borrowings` | Buku yang sedang dipinjam |
| `/my-bookings` | Booking buku aktif |
| `/my-ebooks` | Koleksi e-book sewaan |
| `/reader/[rentalId]` | E-book reader (full screen PDF viewer) |

### ⚙️ API Routes

| Endpoint | Method | Deskripsi |
|:---|---:|---|
| `/api/auth/register` | POST | Registrasi user baru (via Supabase Admin API) |
| `/api/auth/login-step-1` | POST | Verifikasi email/password + kirim OTP |
| `/api/auth/login-step-2` | POST | Verifikasi OTP + set session cookie |
| `/api/auth/logout` | POST | Hapus session cookie |
| `/api/auth/me` | GET | Cek user saat ini dari cookie |
| `/api/books` | GET/POST | CRUD buku |
| `/api/books/[id]` | GET/PUT/DELETE | Detail & manipulasi buku |
| `/api/categories` | GET/POST | CRUD kategori |
| `/api/categories/[id]` | PUT/DELETE | Manipulasi kategori |
| `/api/members` | GET/POST | CRUD anggota |
| `/api/members/[id]` | GET/PUT/DELETE | Detail & manipulasi anggota |
| `/api/transactions` | GET | Riwayat transaksi |
| `/api/transactions/borrow` | POST | Peminjaman buku |
| `/api/transactions/return` | POST | Pengembalian buku |
| `/api/transactions/confirm` | POST | Konfirmasi booking → transaksi |
| `/api/bookings` | GET/POST | CRUD booking |
| `/api/bookings/expire` | POST | Cron: expired booking otomatis |
| `/api/dashboard` | GET | Data statistik dashboard |
| `/api/ebooks/rent` | POST | Sewa e-book |
| `/api/ebooks/my` | GET | E-book yang disewa user |
| `/api/ebooks/page` | POST | Simpan halaman terakhir baca |
| `/api/ebooks/read/[rentalId]` | GET | Serve PDF e-book |
| `/api/ebooks/upload` | POST | Upload file PDF e-book |
| `/api/notifications` | GET | Notifikasi user |
| `/api/notifications/read` | POST | Tandai notifikasi sudah dibaca |
| `/api/upload` | POST | Upload gambar sampul buku |

---

## 🗃️ Database Schema

### Entity Relationship

```
User (1) ──< Transaction >── (1) Book
User (1) ──< Booking     >── (1) Book
User (1) ──< EbookRental >── (1) Book
User (1) ──< Notification
Category (1) ──< Book
Booking (1) ──< Transaction  (opsional)
```

### Models

| Model | Fields Utama | Relasi |
|:---|---:|---|
| **User** | id, name, email, password?, role, phone?, address, isActive | transactions, notifications, bookings, ebookRentals |
| **Book** | id, title, author, publisher, year, stock, coverImage, description, isEbook, ebookFile, deletedAt | category, transactions, bookings, ebookRentals |
| **Category** | id, name | books |
| **Transaction** | id, borrowDate, dueDate, returnDate?, fine, status | user, book, booking? |
| **Booking** | id, code, status, expiresAt | user, book, transaction? |
| **EbookRental** | id, status, currentPage, rentedAt, expiresAt | user, book |
| **Notification** | id, title, message, isRead, type, readAt | user |
| **Otp** | id, email (unique), code, accessToken?, expiresAt | — |

---

## 🚀 Deployment

Aplikasi ini sudah **deploy dan berjalan** di Vercel:

| Platform | URL | Status |
|:---|---|:---:|
| 🌐 **Production** | [sistem-informasi-perpus.vercel.app](https://sistem-informasi-perpus.vercel.app) | ✅ Active |
| 📦 **Repository** | [github.com/iltizamhasan3/sistem-informasi-perpus](https://github.com/iltizamhasan3/sistem-informasi-perpus) | ✅ Public |

### Fitur Deployment

- **Auto-deploy:** Setiap push ke branch `master` otomatis build & deploy ke Vercel.
- **CI/CD:** Build pipeline mencakup `prisma generate` + `next build` + TypeScript check.
- **Environment Variables:** Semua secrets dikelola via Vercel Environment Variables (encrypted).
- **SSL/HTTPS:** Otomatis oleh Vercel.
- **Database:** PostgreSQL via Supabase (connection pooling dengan PgBouncer di port 6543).

---

## ⚙️ Instalasi Lokal

### Prasyarat

- Node.js 18+ (recommended: 20+)
- npm atau yarn
- PostgreSQL (atau akses ke Supabase database)

### Langkah-langkah

```bash
# 1. Clone repositori
git clone https://github.com/iltizamhasan3/sistem-informasi-perpus.git
cd sistem-informasi-perpus

# 2. Install dependensi
npm install

# 3. Setup environment variables
# Buat file .env di root project:
cat > .env << EOF
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:5432/[DB_NAME]"
JWT_SECRET="your-jwt-secret"
SUPABASE_URL="https://[PROJECT].supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-anon-key"
SUPABASE_SECRET_KEY="your-service-role-key"
SUPABASE_JWKS_URL="https://[PROJECT].supabase.co/auth/v1/.well-known/jwks.json"
RESEND_API_KEY="re_xxx"  # Optional, untuk OTP email
EOF

# 4. Generate Prisma client & sync database
npx prisma generate
npx prisma db push

# 5. (Opsional) Seed data awal
npm run seed

# 6. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 📦 Scripts

| Script | Deskripsi |
|:---|---|
| `npm run dev` | 🚀 Memulai Next.js development server (hot reload) |
| `npm run build` | 📦 Build aplikasi untuk production |
| `npm run start` | 🏃 Menjalankan server production |
| `npm run lint` | 🔍 Cek kualitas kode dengan ESLint |
| `npm run seed` | 🌱 Isi data dummy ke database |
| `npx prisma generate` | 🔄 Generate Prisma client dari schema |
| `npx prisma db push` | 📤 Sync schema ke database tanpa migrasi |
| `npx prisma studio` | 🖥️ Buka Prisma Studio (GUI database) |

---

## 📄 Lisensi

© 2026 **Iltizam Hasan** — Dikembangkan dengan dedikasi untuk kemajuan literasi digital.

> Dibuat dengan ❤️ menggunakan Next.js, Supabase, dan kopi tanpa batas.

---

<div align="center">
  <p>
    <a href="https://github.com/iltizamhasan3"><img src="https://img.shields.io/badge/GitHub-@iltizamhasan3-0A0A0A?style=flat&logo=github" alt="GitHub"/></a>
    <a href="https://sistem-informasi-perpus.vercel.app"><img src="https://img.shields.io/badge/🌐_Live-sistem--informasi--perpus.vercel.app-3ECF8E?style=flat" alt="Live Demo"/></a>
  </p>
</div>
