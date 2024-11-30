import { v4 as uuidv4 } from 'uuid';
import { NextFunction, Request, Response } from "express";
import { AsyncLocalStorage } from 'async_hooks';

export const requestContextMiddlewareFactory = (asyncLocalStorage: AsyncLocalStorage<unknown>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const requestId = uuidv4();
        res.setHeader("Request-Id", requestId);
        const store = { requestId };
        asyncLocalStorage.run(store, () => {
            next();
        });
    };
};