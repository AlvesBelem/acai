// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// ✅ Cria uma única instância durante Dev e reusa em hot reloads
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
