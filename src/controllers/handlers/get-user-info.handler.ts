import { UserFromRequest } from "@root/interfaces/user/user-from-request.interface";
import { HTTP_STATUS_CODE } from "@root/rules/constants/http-status-codes.constants";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { Request, Response } from "express";

// handles the request information obtained by roles middleware
export const getUserInfoOrHandleError = (req: Request, res: Response): UserFromRequest | undefined => {
    const role = (req as any).userRole;
    const id = (req as any).userId;
    const jti = (req as any).jti;
    const tokenExp = (req as any).tokenExp;

    if (!id) {
        res.status(HTTP_STATUS_CODE.INTERNALSERVER).json({ error: 'Can not deduce the request user id' });
        SystemLoggerService.error('User id was not stablished in middleware');
        return;
    }

    if (!role) {
        res.status(HTTP_STATUS_CODE.INTERNALSERVER).json({ error: 'Can not deduce the request user role' });
        SystemLoggerService.error('User role was not stablished in middleware');
        return;
    }

    if (!jti) {
        res.status(HTTP_STATUS_CODE.INTERNALSERVER).json({ error: 'Unexpected error' });
        SystemLoggerService.error('jti was not stablished in middleware');
        return;
    }

    if (!tokenExp) {
        res.status(HTTP_STATUS_CODE.INTERNALSERVER).json({ error: 'Unexpected error' });
        SystemLoggerService.error('Token expiration time was not stablished in middleware');
        return;
    }

    return {
        id,
        role,
        jti,
        tokenExp
    };
}