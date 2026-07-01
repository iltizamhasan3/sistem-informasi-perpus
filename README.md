<div align="center">
  <img src="https://img.icons8.com/fluency/96/book.png" alt="SiPustaka Logo" width="96"/>
  <h1 align="center" style="margin: 0;">📚 SiPustaka</h1>
  <p align="center"><strong>Sistem Informasi Perpustakaan</strong></p>
  <p align="center">
    Aplikasi manajemen perpustakaan berbasis web modern dengan Next.js, Supabase, dan PostgreSQL.
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

## ✨ Fitur

| Fitur | Keterangan |
|-------|-----------|
| 📖 **Katalog Buku** | Jelajahi koleksi buku dengan pencarian & filter kategori |
| 👥 **Manajemen Anggota** | CRUD anggota perpustakaan (admin) |
| 📚 **Manajemen Buku** | CRUD buku dengan unggah sampul & file PDF e-book |
| 🔄 **Transaksi Peminjaman** | Pinjam & kembalikan buku dengan validasi stok (max 3) |
| 💰 **Denda Otomatis** | Hitung denda keterlambatan (Rp 2.000/hari) |
| 📊 **Dashboard** | Statistik real-time, buku populer, peringatan stok menipis |
| 🔔 **Notifikasi** | Notifikasi in-app untuk peminjaman & pengembalian |
| 👤 **My Borrowings** | Anggota lihat riwayat & status peminjaman sendiri |
| 📅 **Booking Buku** | Booking buku 24 jam, konfirmasi admin, riwayat booking |
| 📱 **E-book Reader** | Sewa e-book 2 hari, baca online via react-pdf, anti-download |
| 💾 **Last Page Saved** | Halaman terakhir otomatis tersimpan, lanjut baca dari posisi terakhir |
| 🔐 **Autentikasi** | Login/register via Supabase Auth (admin & member) |
| 🖼️ **Sampul Buku** | Unggah & tampilkan sampul buku |
| 📄 **Ekspor CSV** | Ekspor data buku, anggota, dan transaksi ke CSV |

## 🚀 Teknologi

| Teknologi | Keterangan |
|-----------|------------|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width="20"/> **Next.js 16** | Framework React dengan App Router |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="20"/> **TypeScript** | Bahasa pemrograman |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="20"/> **Tailwind CSS v4** | Utility-first CSS framework |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="20"/> **PostgreSQL** | Database relasional |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" width="20"/> **Supabase** | Auth, Storage & Database hosting |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" width="20"/> **Prisma 7** | ORM (Object Relational Mapping) |

## 🗂️ Struktur Route

### Halaman Publik & Auth
```
/                     → Landing page
/login                → Login (admin & member)
/register             → Registrasi member baru
```

### Halaman Admin
```
/dashboard            → Dashboard admin
/books                → Manajemen buku
/books/create         → Tambah buku baru
/books/[id]/edit      → Edit buku
/categories           → Manajemen kategori
/members              → Manajemen anggota
/members/create       → Tambah anggota
/members/[id]/edit    → Edit anggota
/transactions         → Semua transaksi
/transactions/borrow  → Form peminjaman
/transactions/return  → Form pengembalian
```

### Halaman Member
```
/catalog              → Katalog publik
/catalog/[id]         → Detail buku (booking & sewa e-book)
/my-borrowings        → Riwayat peminjaman
/my-bookings          → Riwayat booking
/my-ebooks            → E-book yang disewa
/reader/[rentalId]    → Pembaca e-book online
```

## ⚙️ Cara Install

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/iltizamhasan3/sistem-informasi-perpus.git
cd sistem-informasi-perpus
npm install
```

### 2. Setup Environment Variable

Buat file `.env` di root project:

```env
DATABASE_URL="postgresql://user:password@host:5432/postgres"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
SUPABASE_SECRET_KEY="your-secret-key"
SUPABASE_JWKS_URL="https://your-project.supabase.co/auth/v1/.well-known/jwks.json"
```

### 3. Setup Database

```bash
npx prisma migrate dev
npm run seed
```

### 4. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 👤 Akun Demo

| Role    | Email               | Password  |
|---------|---------------------|-----------|
| Admin   | admin@sipustaka.id  | admin123  |
| Member  | siti@email.com      | member123 |

## 📦 Scripts

```bash
npm run dev      # Jalankan development server
npm run build    # Build production
npm run start    # Jalankan production server
npm run seed     # Seed database
npm run lint     # Linting
```

## 🧑‍💻 Author

**Iltizam Hasan** — [@iltizamhasan3](https://github.com/iltizamhasan3)

---
