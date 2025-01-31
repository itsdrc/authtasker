import { Request, Response } from "express";

import { CreateUserValidator, LoginUserValidator } from "@root/rules/validators/models/user";
import { handleError } from "@root/common/handlers/error.handler";
import { HTTP_STATUS_CODE } from "@root/rules/constants/http-status-codes.constants";
import { LoggerService } from "@root/services/logger.service";
import { UpdateUserValidator } from "@root/rules/validators/models/user/update-user.validator";
import { UserService } from "@root/services/user.service";
import { PAGINATION_SETTINGS } from "@root/rules/constants/pagination.constants";
import { getUserInfoOrHandleError } from "./handlers/get-user-info.handler";

export class UserController {

    constructor(
        private readonly userService: UserService,
        private readonly loggerService: LoggerService,
    ) {}

    readonly create = async (req: Request, res: Response): Promise<void> => {
        try {
            this.loggerService.info('User creation attempt');
            const user = req.body;
            const [error, validatedUser] = await CreateUserValidator
                .validateAndTransform(user);

            if (validatedUser) {
                this.loggerService.info(`User data successfully validated`);
                const created = await this.userService.create(validatedUser);
                res.status(HTTP_STATUS_CODE.CREATED).json(created);
                return;
            } else {
                this.loggerService.error(`User data validation failed`);
                res.status(HTTP_STATUS_CODE.BADREQUEST).json({ error });
                return;
            }

        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    };

    readonly login = async (req: Request, res: Response): Promise<void> => {
        try {
            this.loggerService.info('User login attempt');
            const user = req.body;
            const [error, validatedUser] = await LoginUserValidator.validate(user);

            if (validatedUser) {
                this.loggerService.info(`User data successfully validated`);
                const loggedIn = await this.userService.login(validatedUser);
                res.status(HTTP_STATUS_CODE.OK).json(loggedIn);
                return;
            } else {
                this.loggerService.error(`User data validation failed`);
                res.status(HTTP_STATUS_CODE.BADREQUEST).json({ error });
                return;
            }

        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }

    readonly logout = async (req: Request, res: Response): Promise<void> => {
        try {
            this.loggerService.info('User logout attempt');
            const requestUserInfo = getUserInfoOrHandleError(req, res);

            if (requestUserInfo) {
                await this.userService.logout(requestUserInfo);
                res.status(HTTP_STATUS_CODE.NO_CONTENT).end();
                return;
            }

        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }

    readonly requestEmailValidation = async (req: Request, res: Response): Promise<void> => {
        try {
            this.loggerService.info('Email validation request attempt');
            const requestUserInfo = getUserInfoOrHandleError(req, res);

            if (requestUserInfo) {
                await this.userService.requestEmailValidation(requestUserInfo.id);
                res.status(HTTP_STATUS_CODE.NO_CONTENT).end();
                return;
            }

        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }

    readonly confirmEmailValidation = async (req: Request, res: Response): Promise<void> => {
        try {
            this.loggerService.info('Confirm email validation attempt');
            const token = req.params.token;

            if (!token) {
                this.loggerService.error('Can not confirm email, no token provided');
                res.status(HTTP_STATUS_CODE.BADREQUEST).json({ error: 'No token provided' });
                return;
            }

            await this.userService.confirmEmailValidation(token);
            res.status(HTTP_STATUS_CODE.OK).send('Email successfully validated');

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
            const limit = (req.query.limit) ? +req.query.limit : PAGINATION_SETTINGS.DEFAULT_LIMIT;
            const page = (req.query.page) ? +req.query.page : PAGINATION_SETTINGS.DEFAULT_PAGE;
            const usersFound = await this.userService.findAll(limit, page);
            res.status(HTTP_STATUS_CODE.OK).json(usersFound);
        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }

    readonly deleteOne = async (req: Request, res: Response): Promise<void> => {
        try {
            this.loggerService.info('User deletion attempt');

            const userIdToUpdate = req.params.id;
            const requestUserInfo = getUserInfoOrHandleError(req, res);

            if (requestUserInfo) {
                await this.userService.deleteOne(requestUserInfo, userIdToUpdate);
                res.status(HTTP_STATUS_CODE.NO_CONTENT).end();
                return;
            }

        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }

    readonly updateOne = async (req: Request, res: Response): Promise<void> => {
        try {
            this.loggerService.info('User update attempt');

            const userIdToUpdate = req.params.id;
            const propertiesToUpdate = req.body;

            const [error, validatedProperties] = await UpdateUserValidator
                .validateAndTransform(propertiesToUpdate);

            if (validatedProperties) {
                this.loggerService.info(`User data successfully validated`);
                const requestUserInfo = getUserInfoOrHandleError(req, res);

                if (requestUserInfo) {
                    const updated = await this.userService.updateOne(requestUserInfo, userIdToUpdate, validatedProperties);
                    res.status(HTTP_STATUS_CODE.OK).json(updated);
                    return;
                }

            } else {
                this.loggerService.error(`User data validation failed`);
                res.status(HTTP_STATUS_CODE.BADREQUEST).json({ error });
                return;
            }
        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }
}