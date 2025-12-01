import 'reflect-metadata';
import { RequestHandler } from 'express';

export const CONTROLLER_METADATA_KEY = Symbol('controller');
export const ROUTE_METADATA_KEY = Symbol('route');
export const PARAM_METADATA_KEY = Symbol('param');
export const MIDDLEWARE_METADATA_KEY = Symbol('middleware');

export interface ControllerMetadata {
  path: string;
  middlewares?: RequestHandler[];
}

export interface RouteMetadata {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  path: string;
  propertyKey: string;
  middlewares?: RequestHandler[];
}

export interface ParamMetadata {
  type: 'body' | 'query' | 'param' | 'req' | 'res';
  index: number;
  propertyKey: string;
  name?: string;
}

/**
 * Controller decorator - marks a class as a controller
 * @param path - Base path for all routes in this controller
 * @param middlewares - Optional middleware array
 */
export function Controller(path: string = '', ...middlewares: RequestHandler[]) {
  return function (target: any) {
    const metadata: ControllerMetadata = {
      path,
      middlewares: middlewares.length > 0 ? middlewares : undefined,
    };
    Reflect.defineMetadata(CONTROLLER_METADATA_KEY, metadata, target);
  };
}

