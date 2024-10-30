import { Request,Response } from "express"
import { UserService } from "../services/user.service"

export class UserController {

    constructor(
        private readonly userService: UserService
    ) {}

    readonly create = async (req: Request, res: Response) => {
        return this.userService.create().then((created) => {
            res.status(200).json(created)
        });
    }
}