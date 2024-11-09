import { Request, Response } from "express"
import { UserService } from "../services/user.service"
import { CreateUserValidator } from "../rules/validators/create-user.validator";
import { handleError } from "./helpers/handle-error.helper";
import { LoginUserValidator } from "../rules/validators/login-user.validator";
import { HTTP_STATUS_CODES } from "../rules/constants/http-status-codes.constants";

export class UserController {

    constructor(
        private readonly userService: UserService
    ) {}

    readonly create = async (req: Request, res: Response): Promise<void> => {
        const user = req.body;
        const [errors, validatedUser] = await CreateUserValidator.validateAndTransform(user);

        if (errors) {
            res.status(HTTP_STATUS_CODES.BADREQUEST).json({ errors });
            return;
        }

        try {
            const created = await this.userService.create(validatedUser);
            res.status(HTTP_STATUS_CODES.OK).json(created);
        } catch (error) {
            handleError(res, error);
        }
    }

    readonly login = async (req: Request, res: Response): Promise<void> => {
        const user = req.body;
        const [errors, validatedUser] = await LoginUserValidator.validate(user);

        if (errors) {
            res.status(HTTP_STATUS_CODES.BADREQUEST).json({ errors });
            return;
        }

        try {
            const loggedIn = await this.userService.login(validatedUser);
            res.status(HTTP_STATUS_CODES.OK).json(loggedIn);
        } catch (error) {
            handleError(res, error);
        }
    }

    readonly validateEmail = async (req: Request, res: Response): Promise<void> => {
        const token = req.params.token;
        try {
            await this.userService.validateEmail(token);
            res.status(HTTP_STATUS_CODES.OK).send('Email validated');
        } catch (error) {
            handleError(res, error);
        }
    }
}