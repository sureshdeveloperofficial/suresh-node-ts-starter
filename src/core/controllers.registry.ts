import express, { Express } from 'express';
import { RouterRegistry } from './router';
import {
  HomeController,
  HealthController,
  ApiController,
  UserController,
  AuthController,
  PermissionController,
} from '../controllers';
import { config } from '../config';

/**
 * Register all controllers with the Express app
 * This centralizes controller registration for better organization
 */
export function registerControllers(app: Express): void {
  const routerRegistry = new RouterRegistry(app);

  // Register root-level controllers
  routerRegistry.registerController(HomeController);
  routerRegistry.registerController(HealthController);
  routerRegistry.registerController(ApiController);

  // Register API controllers under a nested Express app to satisfy type constraints
  const apiApp = express() as Express;
  const apiRegistry = new RouterRegistry(apiApp);
  apiRegistry.registerController(AuthController);
  apiRegistry.registerController(UserController);
  apiRegistry.registerController(PermissionController);
  app.use(config.apiPrefix, apiApp);
}

