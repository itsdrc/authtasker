import { Request, Response } from "express"
import { UserService } from "../services/user.service"
import { CreateUserValidator } from "../rules/validators/create-user.validator";
import { HttpError } from "../rules/errors/http.error";
import { handleError } from "./helpers/handle-error.helper";

export class UserController {

    constructor(
        private readonly userService: UserService
    ) {}

    readonly create = async (req: Request, res: Response): Promise<void> => {
        const user = req.body;
        const [errors, validatedUser] = await CreateUserValidator.create(user);

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
}