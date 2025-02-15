import { apiLimiterMiddlewareFactory, authLimiterMiddlewareFactory } from "@root/middlewares";

export type RequestLimiterMiddlewares = {
    readonly authLimiter: ReturnType<typeof authLimiterMiddlewareFactory>;
    readonly apiLimiter: ReturnType<typeof apiLimiterMiddlewareFactory>;
}