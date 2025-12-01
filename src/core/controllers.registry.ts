import express, { Express, Router } from 'express';
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

  // Register API controllers with prefix
  const apiRouter: Router = express.Router();
  const apiRegistry = new RouterRegistry(apiRouter);
  apiRegistry.registerController(AuthController);
  apiRegistry.registerController(UserController);
  apiRegistry.registerController(PermissionController);
  app.use(config.apiPrefix, apiRouter);
}

