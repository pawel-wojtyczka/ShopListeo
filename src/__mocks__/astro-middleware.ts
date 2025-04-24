// Mock dla modułu astro:middleware
import type { APIContext } from "astro";

export type MiddlewareHandler = (context: APIContext, next: () => Promise<Response>) => Promise<Response>;

export type MiddlewareResponseHandler = (response: Response, context: APIContext) => Promise<Response>;

export function defineMiddleware(handler: MiddlewareHandler): MiddlewareHandler {
  return handler;
}

export function sequence(...handlers: MiddlewareHandler[]): MiddlewareHandler {
  return async (context: APIContext, next: () => Promise<Response>) => {
    let index = -1;

    async function runNextHandler(): Promise<Response> {
      index++;
      if (index < handlers.length) {
        return handlers[index](context, runNextHandler);
      }
      return next();
    }

    return runNextHandler();
  };
}
