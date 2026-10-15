import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ]
        : [{ emit: 'event', level: 'error' }],
  });

if (env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

// Log queries in development
if (env.NODE_ENV === 'development') {
  // @ts-expect-error prisma event listener
  prisma.$on('error', (e: unknown) => {
    logger.error({ err: e }, 'Prisma Error');
  });
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    logger.error({ err }, 'Falha na conexão com o Banco de Dados PostgreSQL');
    return false;
  }
}
