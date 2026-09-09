import { PrismaClient } from '../generated/prisma'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

/** Bump after prisma generate so Next.js dev does not reuse a stale client. */
const PRISMA_SCHEMA_VERSION = '20260910010000_quiz_completion'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaSchemaVersion?: string
}

if (globalForPrisma.prisma && globalForPrisma.prismaSchemaVersion !== PRISMA_SCHEMA_VERSION) {
  void globalForPrisma.prisma.$disconnect()
  globalForPrisma.prisma = undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION
}
