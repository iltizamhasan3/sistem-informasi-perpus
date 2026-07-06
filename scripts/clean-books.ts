import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const keywordsToKeep = [
    'pulang-pergi',
    'pulang pergi',
    'janji',
    'teka teki',
    'teka-teki',
    'gambar aneh'
  ]

  // Ambil semua buku
  const allBooks = await prisma.book.findMany()
  console.log(`Ditemukan total ${allBooks.length} buku di database.`)
  
  let deletedCount = 0;
  let keptCount = 0;

  for (const book of allBooks) {
    const titleLower = book.title.toLowerCase()
    
    // Cek apakah judul buku mengandung salah satu dari kata kunci yang ingin dipertahankan
    const shouldKeep = keywordsToKeep.some(keyword => titleLower.includes(keyword))
    
    if (!shouldKeep) {
      // Hapus data terkait agar tidak error Foreign Key Constraint
      await prisma.transaction.deleteMany({ where: { bookId: book.id } })
      await prisma.booking.deleteMany({ where: { bookId: book.id } })
      await prisma.ebookRental.deleteMany({ where: { bookId: book.id } })
      
      // Hapus bukunya
      await prisma.book.delete({ where: { id: book.id } })
      deletedCount++;
    } else {
      console.log(`✅ Mempertahankan buku: "${book.title}"`)
      keptCount++;
    }
  }
  
  console.log(`\nSelesai! Berhasil menghapus ${deletedCount} buku. Tersisa ${keptCount} buku.`)
}

main()
  .catch(e => {
    console.error('Terjadi kesalahan:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
