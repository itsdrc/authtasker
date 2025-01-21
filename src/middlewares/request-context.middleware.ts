import { v4 as uuidv4 } from 'uuid';
import { NextFunction, Request, Response } from "express";
import { AsyncLocalStorage } from 'async_hooks';
import { LoggerService } from '@root/services/logger.service';
import { handleError } from '@root/common/handlers/error.handler';

export const requestContextMiddlewareFactory = (
    asyncLocalStorage: AsyncLocalStorage<unknown>,
    loggerService: LoggerService,
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            loggerService.info('INCOMING REQUEST RECEIVED, INITIALIZING CONTEXT...');

            const url = req.originalUrl;
            const method = req.method;
            const requestId = uuidv4();

            const store = {
                requestId,
                method,
                url,
            };

            const start = process.hrtime();

            res.on('finish', () => {
                const [seconds, nanoseconds] = process.hrtime(start);
                const durationInMs = (seconds * 1000) + (nanoseconds / 1000000);

                loggerService.logRequest({
                    ip: req.ip,
                    method: req.method,
                    requestId: requestId,
                    responseTime: durationInMs,
                    statusCode: res.statusCode,
                    url,
                })
            });

            res.setHeader("Request-Id", requestId);

            asyncLocalStorage.run(store, () => {
                next();
            });

        } catch (error) {
            handleError(res, error, loggerService);
        }
    };
};