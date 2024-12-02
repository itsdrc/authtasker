import { Request, Response } from "express";
import { HTTP_STATUS_CODE } from "@root/rules/constants/http-status-codes.constants";
import { CreateUserValidator, LoginUserValidator } from "@root/rules/validators/models/user";
import { UserService } from "@root/services/user.service";
import { UpdateUserValidator } from "@root/rules/validators/models/user/update-user.validator";
import { HttpLoggerService } from "@root/services/http-logger.service";
import { HttpError } from "@root/rules/errors/http.error";
import { UNEXPECTED_ERROR_MESSAGE } from "./constants/unexpected-error.constant";

export class UserController {

    constructor(
        private readonly userService: UserService,
        private readonly loggerService: HttpLoggerService,
    ) {}

    handleError(res: Response, error: Error) {
        if (error instanceof HttpError) {
            res.status(error.statusCode)
                .json({ error: error.message });
        }
        else {
            res.status(500)
                .json({ error: UNEXPECTED_ERROR_MESSAGE });
            this.loggerService.error(`UNEXPECTED ERROR - ${error.message}`);
        }
    };

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
            this.handleError(res, error as any);
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
            this.handleError(res, error as any);
        }
    }

    readonly validateEmail = async (req: Request, res: Response): Promise<void> => {
        try {
            this.loggerService.info('EMAIL VALIDATION ATTEMP');
            const token = req.params.token;
            await this.userService.validateEmail(token);
            res.status(HTTP_STATUS_CODE.NO_CONTENT).end();
        } catch (error) {
            this.handleError(res, error as any);
        }
    }

    readonly findOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const userFound = await this.userService.findOne(id);
            res.status(HTTP_STATUS_CODE.OK).json(userFound);
        } catch (error) {
            this.handleError(res, error as any);
        }
    }

    readonly findAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const limit = (req.query.limit) ? +req.query.limit : undefined;
            const page = (req.query.page) ? +req.query.page : undefined;
            const usersFound = await this.userService.findAll(limit, page);
            res.status(HTTP_STATUS_CODE.OK).json(usersFound);
        } catch (error) {
            this.handleError(res, error as any);
        }
    }

    readonly deleteOne = async (req: Request, res: Response): Promise<void> => {
        this.loggerService.info('USER DELETION ATTEMP');
        try {
            const id = req.params.id;
            await this.userService.deleteOne(id);
            res.status(HTTP_STATUS_CODE.NO_CONTENT).end();
        } catch (error) {
            this.handleError(res, error as any);
        }
    }

    readonly updateOne = async (req: Request, res: Response): Promise<void> => {
        this.loggerService.info('USER UPDATE ATTEMP');
        try {
            const id = req.params.id;
            const propertiesToUpdate = req.body;
            const [error, validatedProperties] = await UpdateUserValidator.validateAndTransform(propertiesToUpdate);

            if (validatedProperties) {
                this.loggerService.info(`VALIDATION SUCESS`);
                const userUpdated = await this.userService.updateOne(id, validatedProperties);
                res.status(HTTP_STATUS_CODE.OK).json(userUpdated);
            } else {
                this.loggerService.error(`VALIDATION REJECTED`);
                res.status(HTTP_STATUS_CODE.BADREQUEST).json({ error });
                return;
            }
        } catch (error) {
            this.handleError(res, error as any);
        }
    }
}