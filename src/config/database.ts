import { PrismaClient } from '@prisma/client';
import { config } from './env';
import { logger } from '../utils';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      config.nodeEnv === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (config.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Connect to database
prisma
  .$connect()
  .then(() => {
    logger.info('✅ Database connected successfully');
  })
  .catch((error: any) => {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  });

// Disconnect on process termination
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
});

export default prisma;

