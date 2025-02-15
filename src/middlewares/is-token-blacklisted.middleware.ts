import { handleError } from "@root/common/handlers/error.handler";
import { HTTP_STATUS_CODE } from "@root/rules/constants";
import { JwtBlackListService, JwtService, LoggerService } from "@root/services";
import { NextFunction, Response, Request } from "express";

export const isTokenBlackListedFactory = (
    jwtService: JwtService,
    jwtBlackListService: JwtBlackListService,
    loggerService: LoggerService
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            loggerService.debug('Is Token Blacklisted Middleware');

            const auth = req.header('authorization');

            if (!auth) {
                loggerService.error('Access denied, no token provided');
                res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: 'No token provided' });
                return;
            }

            const token = auth.split(' ').at(1) || '';
            const payload = jwtService.verify(token);

            if (!payload) {
                loggerService.error('Access denied, invalid bearer token');
                res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: 'Invalid bearer token' });
                return;
            }

            const blackListed = await jwtBlackListService.isBlacklisted(payload.jti);

            if (!blackListed) {
                loggerService.info('Access granted, token is not blacklisted');
                next();
            } else {
                loggerService.error('Access denied, token blacklisted');
                res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: 'Invalid token' });
                return;
            }
        } catch (error) {
            handleError(res, error, loggerService);
        }
    }
}