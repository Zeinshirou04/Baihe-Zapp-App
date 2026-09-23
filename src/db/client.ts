import { PrismaClient } from '@/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/* Convert the MySQL URL to a MariaDB URL – the adapter expects the
   "mariadb://" scheme. */
const connectionString = (process.env.DATABASE_URL ?? '')
  .replace(/^mysql:/i, 'mariadb:');

/* PrismaMariaDb constructor accepts a connection string directly. */
const adapter = new PrismaMariaDb(connectionString);

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;