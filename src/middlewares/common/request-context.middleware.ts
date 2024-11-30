import { v4 as uuidv4 } from 'uuid';
import { NextFunction, Request, Response } from "express";
import { AsyncLocalStorage } from 'async_hooks';

export const requestContextMiddlewareFactory = (asyncLocalStorage: AsyncLocalStorage<unknown>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const originalUrl = req.originalUrl;
        const method = req.method;
        const route = `${method} ${originalUrl}`;
        const requestId = uuidv4();                        

        const store = {
            requestId,
            route,
        };

        res.setHeader("Request-Id", requestId);

        asyncLocalStorage.run(store, () => {
            next();
        });
    };
};