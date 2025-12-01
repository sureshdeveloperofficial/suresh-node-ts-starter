import { Express, Router, RequestHandler } from 'express';
import 'reflect-metadata';
import {
  CONTROLLER_METADATA_KEY,
  ROUTE_METADATA_KEY,
  PARAM_METADATA_KEY,
  MIDDLEWARE_METADATA_KEY,
  ControllerMetadata,
  RouteMetadata,
  ParamMetadata,
} from '../decorators';
import { VALIDATE_METADATA_KEY } from '../decorators/validate';

export class RouterRegistry {
  private app: Express;

  constructor(app: Express) {
    this.app = app;
  }

  /**
   * Register a controller class
   */
  registerController(ControllerClass: new (...args: any[]) => any): void {
    const controllerMetadata: ControllerMetadata = Reflect.getMetadata(
      CONTROLLER_METADATA_KEY,
      ControllerClass
    );

    if (!controllerMetadata) {
      throw new Error(
        `Controller ${ControllerClass.name} must be decorated with @Controller()`
      );
    }

    const router = Router();
    const controllerInstance = new ControllerClass();
    const routes: RouteMetadata[] = Reflect.getMetadata(ROUTE_METADATA_KEY, ControllerClass) || [];

    // Apply class-level middleware
    const classMiddlewares: RequestHandler[] =
      Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, ControllerClass) || [];
    if (classMiddlewares.length > 0) {
      router.use(...classMiddlewares);
    }

    // Apply controller-level middleware from @Controller decorator
    if (controllerMetadata.middlewares) {
      router.use(...controllerMetadata.middlewares);
    }

    // Register routes
    routes.forEach((route) => {
      const handler = this.createRouteHandler(controllerInstance, route);
      const routeMiddlewares: RequestHandler[] =
        Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, ControllerClass.prototype, route.propertyKey) ||
        [];
      
      // Get validation middlewares
      const validationMiddlewares: RequestHandler[] =
        Reflect.getMetadata(VALIDATE_METADATA_KEY, ControllerClass.prototype, route.propertyKey) ||
        [];

      const allMiddlewares = [
        ...(route.middlewares || []),
        ...routeMiddlewares,
        ...validationMiddlewares,
        handler,
      ];

      router[route.method](route.path, ...allMiddlewares);
    });

    // Register router with app
    const basePath = controllerMetadata.path;
    this.app.use(basePath, router);
  }

  /**
   * Create a route handler that extracts parameters using decorators
   */
  private createRouteHandler(instance: any, route: RouteMetadata): RequestHandler {
    return async (req, res, next) => {
      try {
        const params: ParamMetadata[] =
          Reflect.getMetadata(PARAM_METADATA_KEY, instance, route.propertyKey) || [];

        // Sort params by index
        params.sort((a, b) => a.index - b.index);

        // Extract parameter values
        const args: any[] = [];
        params.forEach((param) => {
          switch (param.type) {
            case 'body':
              args.push(param.name ? req.body[param.name] : req.body);
              break;
            case 'query':
              args.push(param.name ? req.query[param.name] : req.query);
              break;
            case 'param':
              args.push(param.name ? req.params[param.name] : req.params);
              break;
            case 'req':
              args.push(req);
              break;
            case 'res':
              args.push(res);
              break;
          }
        });

        // Call the controller method
        const result = await instance[route.propertyKey](...args);

        // If result is not a response, send it
        if (result !== undefined && !res.headersSent) {
          if (typeof result === 'object') {
            res.json(result);
          } else {
            res.send(result);
          }
        }
      } catch (error) {
        next(error);
      }
    };
  }
}

