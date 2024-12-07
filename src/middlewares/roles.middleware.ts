import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";

import type { UserRole } from "@root/types/user/user-roles.type";
import { HTTP_STATUS_CODE } from "@root/rules/constants/http-status-codes.constants";
import { JwtService } from "@root/services/jwt.service";
import { LoggerService } from "@root/services/logger.service";
import { User } from "@root/types/user/user.type";
import { canAccess } from "./helpers/can-access.helper";
import { handleError } from "@root/common/helpers/handle-error.helper";

export const rolesMiddlewareFactory = (
    minRoleRequired: UserRole,
    userModel: Model<User>,
    loggerService: LoggerService,
    jwtService: JwtService,
) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            loggerService.debug('PROCESSING ROLE...');
            const authorizationHeader = req.header('authorization');

            if (!authorizationHeader) {
                loggerService.error('Access denied, no token provided');
                res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: 'No token provided' });
                return;
            }

            const token = authorizationHeader.split(' ').at(1) || '';
            const payload = jwtService.verify(token);

            if (!payload) {
                loggerService.error('Access denied, invalid bearer token');
                res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: 'Invalid bearer token' });
                return;
            }

            const userId = (payload as any).id;
            const user = await userModel.findById(userId).exec();

            if (!user) {
                loggerService.error(`Access denied, user: ${userId} not found`);
                res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: 'User not found' })
                return
            }

            if (canAccess(minRoleRequired, user.role)) {
                loggerService.info(`Access granted for user ${userId} with role "${user.role}"`)
                next();
            }
            else {
                loggerService.error('Access denied. Insufficient permissions')
                res.status(HTTP_STATUS_CODE.UNAUTHORIZED)
                    .json({ error: 'You do not have permission to perform this action' })
                return
            }

        } catch (error) {
            handleError(res, error, loggerService);
        }
    };
}