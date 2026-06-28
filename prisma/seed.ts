import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { createAdminClient } from '@supabase/server/core'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const supabaseAdmin = createAdminClient()
  const now = new Date()

  const users = [
    { name: 'Admin Perpustakaan', email: 'admin@sipustaka.id', password: 'admin123', role: 'admin', phone: '08123456789', address: 'Jl. Merdeka No. 1, Jakarta' },
    { name: 'Siti Rahmawati', email: 'siti@email.com', password: 'member123', role: 'member', phone: '08198765432', address: 'Jl. Pendidikan No. 5, Jakarta' },
  ]

  for (const u of users) {
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    })
    if (error && !error.message.includes('already exists')) {
      console.error(`Supabase user ${u.email}:`, error.message)
    } else {
      console.log(`✅ Supabase user ${u.email} siap`)
    }
  }

  await prisma.user.createMany({
    data: users.map((u, i) => ({
      id: i + 1,
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      phone: u.phone,
      address: u.address,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })),
    skipDuplicates: true,
  })

  await prisma.category.createMany({
    data: [
      { id: 1, name: 'Teknologi', createdAt: now },
      { id: 2, name: 'Sastra', createdAt: now },
      { id: 3, name: 'Sejarah', createdAt: now },
      { id: 4, name: 'Agama', createdAt: now },
      { id: 5, name: 'Pendidikan', createdAt: now },
    ],
    skipDuplicates: true,
  })

  await prisma.book.createMany({
    data: [
      { id: 1, title: 'Pemrograman Web dengan Next.js', author: 'Budi Santoso', publisher: 'Penerbit Digital', year: 2024, categoryId: 1, stock: 5, description: 'Panduan lengkap Next.js', createdAt: now, updatedAt: now },
      { id: 2, title: 'Dasar-Dasar JavaScript', author: 'Ahmad Fauzi', publisher: 'Edu Press', year: 2023, categoryId: 1, stock: 3, description: 'Pengenalan JavaScript', createdAt: now, updatedAt: now },
      { id: 3, title: 'Laskar Pelangi', author: 'Andrea Hirata', publisher: 'Bentang Pustaka', year: 2005, categoryId: 2, stock: 4, description: 'Novel inspiratif pendidikan', createdAt: now, updatedAt: now },
      { id: 4, title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', publisher: 'Hasta Mitra', year: 1980, categoryId: 2, stock: 2, description: 'Novel sejarah kolonial', createdAt: now, updatedAt: now },
      { id: 5, title: 'Sejarah Dunia yang Disembunyikan', author: 'Jonathan Black', publisher: 'Alvabet', year: 2019, categoryId: 3, stock: 2, description: 'Perspektif alternatif sejarah', createdAt: now, updatedAt: now },
      { id: 6, title: 'Filsafat Ilmu Pengetahuan', author: 'Jujun S. Suriasumantri', publisher: 'Pustaka Sinar Harapan', year: 1990, categoryId: 3, stock: 3, description: 'Pengantar filsafat ilmu', createdAt: now, updatedAt: now },
      { id: 7, title: 'Akhlak Tasawuf', author: 'Prof. Dr. Abuddin Nata', publisher: 'Rajawali Pers', year: 2018, categoryId: 4, stock: 4, description: 'Kajian akhlak dan tasawuf', createdAt: now, updatedAt: now },
      { id: 8, title: 'Metodologi Penelitian Pendidikan', author: 'Prof. Dr. Sugiyono', publisher: 'Alfabeta', year: 2020, categoryId: 5, stock: 6, description: 'Metode penelitian lengkap', createdAt: now, updatedAt: now },
      { id: 9, title: 'Clean Code', author: 'Robert C. Martin', publisher: 'Prentice Hall', year: 2008, categoryId: 1, stock: 2, description: 'Prinsip menulis kode bersih', createdAt: now, updatedAt: now },
      { id: 10, title: 'Ronggeng Dukuh Paruk', author: 'Ahmad Tohari', publisher: 'Gramedia', year: 2003, categoryId: 2, stock: 3, description: 'Novel budaya Jawa', createdAt: now, updatedAt: now },
    ],
    skipDuplicates: true,
  })

  await prisma.$disconnect()
  console.log('✅ Seed berhasil!')
  console.log('📧 Admin: admin@sipustaka.id / admin123')
  console.log('📧 Member: siti@email.com / member123')
}

main().catch((e) => { console.error(e); process.exit(1) })
