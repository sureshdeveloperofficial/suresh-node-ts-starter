import 'reflect-metadata';
import { createServer, Server } from 'http';
import { config } from './config';
import { logger } from './utils';
import createApp from './app';
import './config/database'; // Initialize database connection
import { initRedis, closeRedis } from './config/redis';

const startServer = async (): Promise<void> => {
  try {
    // Initialize Redis (non-blocking - server can start without it)
    try {
      await initRedis();
    } catch (error) {
      logger.warn('⚠️  Redis initialization failed, continuing without Redis');
    }

    const app = createApp();
    const server: Server = createServer(app);

    const PORT = config.port;

    server.listen(PORT, () => {
      logger.info(`🚀 Server is running on http://localhost:${PORT}`);
      logger.info(`📝 Environment: ${config.nodeEnv}`);
      logger.info(`⏰ Started at: ${new Date().toISOString()}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await closeRedis();
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: Error) => {
      logger.error('Unhandled Rejection:', reason);
      gracefulShutdown('unhandledRejection');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
