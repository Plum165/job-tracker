import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/opportunity_hub?schema=public';

  const pool = new pg.Pool({
    connectionString,
    connectionTimeoutMillis: 3000,
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
