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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('📚 Memulai proses import buku terlaris dari Google Books API...\n')
  
  // Ambil kategori dari database
  const categories = await prisma.category.findMany();
  
  if (categories.length === 0) {
    console.error('❌ Tidak ada kategori ditemukan di database. Harap jalankan "npm run seed" terlebih dahulu.');
    process.exit(1);
  }

  let totalImported = 0;

  for (const category of categories) {
    console.log(`\n🔍 Mengambil data untuk kategori: ${category.name}...`);
    
    // Query yang dicari: berdasarkan nama kategori (bisa dalam Bahasa Indonesia)
    // Kata kunci "subject:" terkadang ketat, jadi kita tambahkan juga query general.
    const query = encodeURIComponent(category.name);
    
    try {
      // Call iTunes API
      const res = await fetch(`https://itunes.apple.com/search?term=${query}&media=ebook&limit=10`);
      
      if (!res.ok) {
        console.error(`❌ Gagal mengambil data untuk kategori ${category.name}: ${res.status} ${res.statusText}`);
        continue;
      }

      const data = await res.json();
      const items = data.results || [];
      
      if (items.length === 0) {
        console.log(`⚠️ Tidak ada buku ditemukan untuk kategori ${category.name}`);
        continue;
      }
      
      console.log(`Ditemukan ${items.length} buku. Menyimpan ke database...`);
      
      for (const item of items) {
        const title = item.trackName || 'Judul Tidak Diketahui';
        const author = item.artistName || 'Anonim';
        
        // Cek duplikasi
        const existingBook = await prisma.book.findFirst({
          where: { title, author }
        });
        
        if (existingBook) {
          console.log(`  ⏭️  Lewati: "${title}" (Sudah ada)`);
          continue;
        }

        const publisher = 'Penerbit iTunes';
        const year = item.releaseDate ? parseInt(item.releaseDate.substring(0, 4), 10) : null;
        
        // Ambil cover image (perbesar ukuran resolusi dari 100x100 ke 400x400)
        let coverImage = item.artworkUrl100 || null;
        if (coverImage) {
            coverImage = coverImage.replace('100x100bb', '400x400bb');
        }
          
        let description = item.description || 'Tidak ada deskripsi.';
        description = description.replace(/<[^>]*>?/gm, ''); // hapus tag html
        if (description.length > 2000) description = description.substring(0, 2000);
        
        const stock = 10;

        await prisma.book.create({
          data: {
            title,
            author,
            publisher,
            year,
            categoryId: category.id,
            stock,
            coverImage,
            description,
            isEbook: false,
          }
        });
        
        console.log(`  ✅ Berhasil import: "${title}"`);
        totalImported++;
      }
      
    } catch (error) {
      console.error(`❌ Error saat memproses kategori ${category.name}:`, error);
    }
    
    // Jeda sebentar
    await delay(1000);
  }

  // Update sequences agar ID selaras dengan manual insert di DB Postgres
  await prisma.$executeRawUnsafe(`SELECT setval('"Book_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Book"))`);

  console.log(`\n🎉 Proses selesai! Berhasil mengimpor ${totalImported} buku baru.`);
  
  await prisma.$disconnect()
}

main().catch((e) => { 
  console.error(e); 
  prisma.$disconnect();
  process.exit(1);
})
