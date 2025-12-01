import express, { Express } from 'express';
import { registerControllers } from '@/core/controllers.registry';

/**
 * Create test Express app
 */
export async function createApp(): Promise<Express> {
  const app = express();
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Register controllers
  registerControllers(app);

  return app;
}

