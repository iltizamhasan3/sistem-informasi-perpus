import 'dotenv/config'
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
      role: u.role,
      phone: u.phone,
      address: u.address,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })),
    skipDuplicates: true,
  })
  await prisma.$executeRawUnsafe(`SELECT setval('"User_id_seq"', (SELECT MAX(id) FROM "User"))`)

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
  await prisma.$executeRawUnsafe(`SELECT setval('"Category_id_seq"', (SELECT MAX(id) FROM "Category"))`)

  await prisma.$executeRawUnsafe(`SELECT setval('"Book_id_seq"', 1)`)
  console.log('ℹ️  Tidak ada buku dummy. Tambahkan buku melalui halaman admin.')

  await prisma.$disconnect()
  console.log('✅ Seed berhasil!')
  console.log('📧 Admin: admin@sipustaka.id / admin123')
  console.log('📧 Member: siti@email.com / member123')
}

main().catch((e) => { console.error(e); process.exit(1) })
