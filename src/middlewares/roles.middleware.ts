import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";

import { canAccess } from "./helpers/can-access.helper";
import { handleError } from "@root/common/helpers/handle-error.helper";
import { HTTP_STATUS_CODE } from "@root/rules/constants/http-status-codes.constants";
import { IUser } from "@root/interfaces/user/user.interface";
import { JwtService } from "@root/services/jwt.service";
import { LoggerService } from "@root/services/logger.service";
import type { UserRole } from "@root/types/user/user-roles.type";
import { FORBIDDEN_MESSAGE } from "@root/rules/errors/messages/error.messages";
import { TOKEN_PURPOSES } from "@root/rules/constants/token-purposes.constants";
import { JwtBlackListService } from "@root/services";

export const rolesMiddlewareFactory = (
    minRoleRequired: UserRole,
    userModel: Model<IUser>,
    loggerService: LoggerService,
    jwtService: JwtService,
    jwtBlacklistService: JwtBlackListService,
) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const returnInvalidBearerToken = (): void => {
                loggerService.error('Access denied, invalid bearer token');
                res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: 'Invalid bearer token' });
            };

            loggerService.debug('Executing roles middleware');

            // token not provided
            const authorizationHeader = req.header('authorization');
            if (!authorizationHeader) {
                loggerService.error('Access denied, no token provided');
                res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: 'No token provided' });
                return;
            }

            const token = authorizationHeader.split(' ').at(1) || '';

            // token is not valid
            const payload = jwtService.verify<{ id: string }>(token);
            if (!payload) {
                loggerService.debug('Token sent is not valid or not generated by this server seed');
                return returnInvalidBearerToken();
            }

            // token purpose is not the expected
            const tokenPurpose = payload.purpose;
            if (tokenPurpose !== TOKEN_PURPOSES.SESSION) {
                loggerService.debug(`Token purpose "${tokenPurpose}" is not the expected purpose`);
                return returnInvalidBearerToken();
            }

            // token is blacklisted
            const tokenIsBlacklisted = await jwtBlacklistService.isBlacklisted(payload.jti);
            if (tokenIsBlacklisted) {
                loggerService.debug(`Token is blacklisted`);
                return returnInvalidBearerToken();
            }

            // user id not in token
            const userId = payload.id;
            if (!userId) {
                loggerService.debug('User id not in token');
                return returnInvalidBearerToken();
            }

            // user in token not exists
            const user = await userModel.findById(userId).exec();
            if (!user) {
                loggerService.debug('User in token does not exist');
                return returnInvalidBearerToken();
            }

            if (canAccess(minRoleRequired, user.role)) {
                loggerService.info(`Access granted for user ${userId} with role "${user.role}"`)
                Object.defineProperties(req, {
                    userId: { value: userId },
                    userRole: { value: user.role },
                    jti: { value: payload.jti },
                    tokenExp: { value: payload.exp }
                });
                next();
            }
            else {
                loggerService.error('Access denied. Insufficient permissions')
                res.status(HTTP_STATUS_CODE.FORBIDDEN)
                    .json({ error: FORBIDDEN_MESSAGE })
                return;
            }

        } catch (error) {
            handleError(res, error, loggerService);
        }
    };
}