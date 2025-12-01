import 'reflect-metadata';
import { PARAM_METADATA_KEY, ParamMetadata } from './controller';

/**
 * Base parameter decorator factory
 */
function createParamDecorator(type: 'body' | 'query' | 'param' | 'req' | 'res') {
  return function (name?: string) {
    return function (target: any, propertyKey: string, parameterIndex: number) {
      const params: ParamMetadata[] =
        Reflect.getMetadata(PARAM_METADATA_KEY, target, propertyKey) || [];

      params.push({
        type,
        index: parameterIndex,
        propertyKey,
        name,
      });

      Reflect.defineMetadata(PARAM_METADATA_KEY, params, target, propertyKey);
    };
  };
}

/**
 * Parameter decorators
 */
export const Body = createParamDecorator('body');
export const Query = createParamDecorator('query');
export const Param = createParamDecorator('param');
export const Req = createParamDecorator('req');
export const Res = createParamDecorator('res');

