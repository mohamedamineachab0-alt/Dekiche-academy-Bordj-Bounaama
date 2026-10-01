import { PrismaClient } from '../generated/prisma'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const rawConnectionString = process.env.DATABASE_URL || ''
const connectionString = rawConnectionString.includes('connection_limit')
  ? rawConnectionString
  : `${rawConnectionString}${rawConnectionString.includes('?') ? '&' : '?'}connection_limit=${process.env.NODE_ENV === 'production' ? 15 : 3}`

interface GlobalPrismaState {
  prisma?: PrismaClient
  pool?: Pool
  prismaSchemaVersion?: string
}

const globalForPrisma = globalThis as unknown as GlobalPrismaState

const PRISMA_SCHEMA_VERSION = '20261001_v5_pgbouncer'

function getPool(): Pool {
  if (!globalForPrisma.pool) {
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: process.env.NODE_ENV === 'production' ? 15 : 3,
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 15000,
    })

    pool.on('error', (err) => {
      console.warn('Postgres connection pool notice:', err?.message || err)
    })

    globalForPrisma.pool = pool
  }
  return globalForPrisma.pool
}

if (globalForPrisma.prisma && globalForPrisma.prismaSchemaVersion !== PRISMA_SCHEMA_VERSION) {
  void globalForPrisma.prisma.$disconnect()
  globalForPrisma.prisma = undefined
  if (globalForPrisma.pool) {
    void globalForPrisma.pool.end()
    globalForPrisma.pool = undefined
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(getPool()),
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION
}
