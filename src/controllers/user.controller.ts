import { Request, Response } from "express"
import { UserService } from "../services/user.service"
import { CreateUserValidator } from "../rules/validators/create-user.validator";
import { HttpError } from "../rules/errors/http.error";
import { handleError } from "./helpers/handle-error.helper";
import { LoginUserValidator } from "../rules/validators/login-user.validator";

// TODO: change plain numbers for error codes

export class UserController {

    constructor(
        private readonly userService: UserService
    ) {}

    readonly create = async (req: Request, res: Response): Promise<void> => {
        const user = req.body;
        const [errors, validatedUser] = await CreateUserValidator.validateAndTransform(user);

        if (errors) {
            res.status(400).json({ errors });
            return;
        }

        try {
            const created = await this.userService.create(validatedUser);
            res.status(200).json(created);
        } catch (error) {
            handleError(res, error);
        }
    }

    readonly login = async (req: Request, res: Response): Promise<void> => {
        const user = req.body;
        const [errors, validatedUser] = await LoginUserValidator.validate(user);

        if (errors) {
            res.status(400).json({ errors });
            return;
        }

        try {
            const loggedIn = await this.userService.login(validatedUser);
            res.status(200).json(loggedIn);
        } catch (error) {
            handleError(res, error);
        }
    }

    readonly validateEmail = async (req: Request, res: Response): Promise<void> => {
        const token = req.params.token;
        try {
            await this.userService.validateEmail(token);
            res.status(200).send('Email validated');
        } catch (error) {
            handleError(res, error);
        }
    }
}