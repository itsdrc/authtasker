import { Request, Response } from "express"
import { UserService } from "../services/user.service"
import { CreateUserValidator, LoginUserValidator } from "../rules/validators/models/user";
import { handleError } from "./helpers/handle-error.helper";
import { HTTP_STATUS_CODE } from "../rules/constants/http-status-codes.constants";
import { UpdateUserValidator } from "../rules/validators/models/user/update-user.validator";

export class UserController {

    constructor(
        private readonly userService: UserService
    ) {}

    readonly create = async (req: Request, res: Response): Promise<void> => {
        const user = req.body;
        const [errors, validatedUser] = await CreateUserValidator.validateAndTransform(user);

        if (validatedUser){
            try {
                const created = await this.userService.create(validatedUser);
                res.status(HTTP_STATUS_CODE.CREATED).json(created);
            } catch (error) {
                handleError(res, error);
            }            
        } else {
            res.status(HTTP_STATUS_CODE.BADREQUEST).json({ errors });
            return;
        }
    }

    readonly login = async (req: Request, res: Response): Promise<void> => {
        const user = req.body;
        const [errors, validatedUser] = await LoginUserValidator.validate(user);

        if (validatedUser) {
            try {
                const loggedIn = await this.userService.login(validatedUser);
                res.status(HTTP_STATUS_CODE.OK).json(loggedIn);
            } catch (error) {
                handleError(res, error);
            }
        } else {
            res.status(HTTP_STATUS_CODE.BADREQUEST).json({ errors });
            return;
        }
    }

    readonly validateEmail = async (req: Request, res: Response): Promise<void> => {
        const token = req.params.token;
        try {
            await this.userService.validateEmail(token);
            res.status(HTTP_STATUS_CODE.OK).send('Email validated');
        } catch (error) {
            handleError(res, error);
        }
    }

    readonly findOne = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        try {
            const userFound = await this.userService.findOne(id);
            res.status(HTTP_STATUS_CODE.OK).json(userFound);
        } catch (error) {
            handleError(res, error);
        }
    }

    readonly findAll = async (req: Request, res: Response): Promise<void> => {
        const limit = (req.query.limit) ? +req.query.limit : undefined;
        const page = (req.query.page) ? +req.query.page : undefined;

        try {
            const usersFound = await this.userService.findAll(limit, page);
            res.status(HTTP_STATUS_CODE.OK).json(usersFound);
        } catch (error) {
            handleError(res, error);
        }
    }

    readonly deleteOne = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        try {
            await this.userService.deleteOne(id);
            res.status(HTTP_STATUS_CODE.NO_CONTENT).end();
        } catch (error) {
            handleError(res, error);
        }
    }

    readonly updateOne = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const propertiesToUpdate = req.body;
        const [error, validatedProperties] = await UpdateUserValidator.validateAndTransform(propertiesToUpdate);

        if (validatedProperties) {
            try {
                const userUpdated = await this.userService.updateOne(id, validatedProperties);
                res.status(HTTP_STATUS_CODE.OK).json(userUpdated);
            } catch (error) {
                handleError(res, error);
            }
        } else {
            res.status(HTTP_STATUS_CODE.BADREQUEST).json({ error });
            return;
        }
    }
}