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
  const tables = ['Book', 'User', 'Category']
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`SELECT setval('"${table}_id_seq"', (SELECT MAX(id) FROM "${table}"))`)
    console.log(`✅ ${table}_id_seq fixed`)
  }
  await prisma.$disconnect()
  console.log('Done')
}

main().catch((e) => { console.error(e); process.exit(1) })
