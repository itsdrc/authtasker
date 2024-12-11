import { Request, Response } from "express";

import { CreateUserValidator, LoginUserValidator } from "@root/rules/validators/models/user";
import { handleError } from "@root/common/helpers/handle-error.helper";
import { HTTP_STATUS_CODE } from "@root/rules/constants/http-status-codes.constants";
import { LoggerService } from "@root/services/logger.service";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { UpdateUserValidator } from "@root/rules/validators/models/user/update-user.validator";
import { UserService } from "@root/services/user.service";

export class UserController {

    constructor(
        private readonly userService: UserService,
        private readonly loggerService: LoggerService,
    ) {}

    private async isAuthorizedToModify(req: Request, res: Response): Promise<boolean> {
        const userToDeleteId = req.params.id;
        const requestUserId = (req as any).userId;
        const requestUserRole = (req as any).userRole;

        if (!requestUserId) {
            res.status(HTTP_STATUS_CODE.INTERNALSERVER)
                .json({ error: 'Can not deduce the request user id' });
            SystemLoggerService.error('User id was not stablished in middleware');
            return false;
        }

        if (!requestUserRole) {
            res.status(HTTP_STATUS_CODE.INTERNALSERVER)
                .json({ error: 'Can not deduce the request user role' });
            SystemLoggerService.error('User role was not stablished in middleware');
            return false;
        }

        if (requestUserRole === 'admin')
            return true;

        if (requestUserId === userToDeleteId) {
            return true;
        } else {
            res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: 'You do not have permission to perform this action' });
            return false;
        }
    }

    readonly create = async (req: Request, res: Response): Promise<void> => {
        try {
            this.loggerService.info('USER CREATION ATTEMP');
            const user = req.body;
            const [error, validatedUser] = await CreateUserValidator.validateAndTransform(user);

            if (validatedUser) {
                this.loggerService.info(`VALIDATION SUCESS`);
                const created = await this.userService.create(validatedUser);
                res.status(HTTP_STATUS_CODE.CREATED).json(created);
            } else {
                this.loggerService.error(`VALIDATION REJECTED`);
                res.status(HTTP_STATUS_CODE.BADREQUEST).json({ error });
                return;
            }

        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    };

    readonly login = async (req: Request, res: Response): Promise<void> => {
        try {
            this.loggerService.info('USER LOGIN ATTEMP');
            const user = req.body;
            const [error, validatedUser] = await LoginUserValidator.validate(user);

            if (validatedUser) {
                this.loggerService.info(`VALIDATION SUCESS`);
                const loggedIn = await this.userService.login(validatedUser);
                res.status(HTTP_STATUS_CODE.OK).json(loggedIn);
            } else {
                this.loggerService.error(`VALIDATION REJECTED`);
                res.status(HTTP_STATUS_CODE.BADREQUEST).json({ error });
                return;
            }

        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }

    readonly validateEmail = async (req: Request, res: Response): Promise<void> => {
        try {
            this.loggerService.info('EMAIL VALIDATION ATTEMP');
            const token = req.params.token;
            await this.userService.validateEmail(token);
            res.status(HTTP_STATUS_CODE.NO_CONTENT).end();
        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }

    readonly findOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const userFound = await this.userService.findOne(id);
            res.status(HTTP_STATUS_CODE.OK).json(userFound);
        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }

    readonly findAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const limit = (req.query.limit) ? +req.query.limit : undefined;
            const page = (req.query.page) ? +req.query.page : undefined;
            const usersFound = await this.userService.findAll(limit, page);
            res.status(HTTP_STATUS_CODE.OK).json(usersFound);
        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }

    readonly deleteOne = async (req: Request, res: Response): Promise<void> => {
        try {
            this.loggerService.info('USER DELETION ATTEMP');

            const id = req.params.id;
            const authorized = await this.isAuthorizedToModify(req, res);

            if (authorized) {
                await this.userService.deleteOne(id);
                res.status(HTTP_STATUS_CODE.NO_CONTENT).end();
                return;
            }

        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }

    readonly updateOne = async (req: Request, res: Response): Promise<void> => {
        try {
            this.loggerService.info('USER UPDATE ATTEMP');
            const id = req.params.id;
            const propertiesToUpdate = req.body;

            const [error, validatedProperties] = await UpdateUserValidator
                .validateAndTransform(propertiesToUpdate);

            if (validatedProperties) {
                this.loggerService.info(`VALIDATION SUCESS`);

                const authorized = await this.isAuthorizedToModify(req, res);
                if (authorized) {
                    const userUpdated = await this.userService.updateOne(id, validatedProperties);
                    res.status(HTTP_STATUS_CODE.OK).json(userUpdated);
                    return;
                }

            } else {
                this.loggerService.error(`VALIDATION REJECTED`);
                res.status(HTTP_STATUS_CODE.BADREQUEST).json({ error });
                return;
            }
        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }
}