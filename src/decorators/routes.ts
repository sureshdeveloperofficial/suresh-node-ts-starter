import 'reflect-metadata';
import { RequestHandler } from 'express';
import { ROUTE_METADATA_KEY, RouteMetadata } from './controller';

/**
 * Base route decorator factory
 */
function createRouteDecorator(method: 'get' | 'post' | 'put' | 'delete' | 'patch') {
  return function (path: string = '', ...middlewares: RequestHandler[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const routes: RouteMetadata[] =
        Reflect.getMetadata(ROUTE_METADATA_KEY, target.constructor) || [];

      routes.push({
        method,
        path,
        propertyKey,
        middlewares: middlewares.length > 0 ? middlewares : undefined,
      });

      Reflect.defineMetadata(ROUTE_METADATA_KEY, routes, target.constructor);
    };
  };
}

/**
 * HTTP method decorators
 */
export const Get = createRouteDecorator('get');
export const Post = createRouteDecorator('post');
export const Put = createRouteDecorator('put');
export const Delete = createRouteDecorator('delete');
export const Patch = createRouteDecorator('patch');

