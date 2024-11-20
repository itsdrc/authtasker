import {Request, Response } from "express";
import { HTTP_STATUS_CODE } from "@root/rules/constants/http-status-codes.constants";
import { CreateUserValidator, LoginUserValidator } from "@root/rules/validators/models/user";
import { UserService } from "@root/services/user.service";
import { handleError } from "./helpers/handle-error.helper";
import { UpdateUserValidator } from "@root/rules/validators/models/user/update-user.validator";

export class UserController {

    constructor(
        private readonly userService: UserService
    ) {}

    private readonly _create = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = req.body;
            const [errors, validatedUser] = await CreateUserValidator.validateAndTransform(user);

            if (validatedUser) {
                const created = await this.userService.create(validatedUser);
                res.status(HTTP_STATUS_CODE.CREATED).json(created);
            } else {
                res.status(HTTP_STATUS_CODE.BADREQUEST).json({ errors });
                return;
            }

        } catch (error) {
            handleError(res, error);
        }
    };
    public get create() {
        return this._create;
    }

    readonly login = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = req.body;
            const [errors, validatedUser] = await LoginUserValidator.validate(user);

            if (validatedUser) {
                const loggedIn = await this.userService.login(validatedUser);
                res.status(HTTP_STATUS_CODE.OK).json(loggedIn);
            } else {
                res.status(HTTP_STATUS_CODE.BADREQUEST).json({ errors });
                return;
            }
        } catch (error) {
            handleError(res, error);
        }
    }

    readonly validateEmail = async (req: Request, res: Response): Promise<void> => {
        try {
            const token = req.params.token;
            await this.userService.validateEmail(token);
            res.status(HTTP_STATUS_CODE.OK).send('Email validated');
        } catch (error) {
            handleError(res, error);
        }
    }

    readonly findOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const userFound = await this.userService.findOne(id);
            res.status(HTTP_STATUS_CODE.OK).json(userFound);
        } catch (error) {
            handleError(res, error);
        }
    }

    readonly findAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const limit = (req.query.limit) ? +req.query.limit : undefined;
            const page = (req.query.page) ? +req.query.page : undefined;
            const usersFound = await this.userService.findAll(limit, page);
            res.status(HTTP_STATUS_CODE.OK).json(usersFound);
        } catch (error) {
            handleError(res, error);
        }
    }

    readonly deleteOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            await this.userService.deleteOne(id);
            res.status(HTTP_STATUS_CODE.NO_CONTENT).end();
        } catch (error) {
            handleError(res, error);
        }
    }

    readonly updateOne = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const propertiesToUpdate = req.body;
            const [error, validatedProperties] = await UpdateUserValidator.validateAndTransform(propertiesToUpdate);

            if (validatedProperties) {
                const userUpdated = await this.userService.updateOne(id, validatedProperties);
                res.status(HTTP_STATUS_CODE.OK).json(userUpdated);
            } else {
                res.status(HTTP_STATUS_CODE.BADREQUEST).json({ error });
                return;
            }
        } catch (error) {
            handleError(res, error);
        }
    }
}