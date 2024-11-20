import { Request, Response } from "express";

import { UserSeedService } from "../services/user.seed.service";
import { HTTP_STATUS_CODE } from "@root/rules/constants/http-status-codes.constants";

export class UserSeedController {

    constructor(
        private readonly userSeedService: UserSeedService
    ) {}

    readonly seedBunch = async (req: Request, res: Response) => {
        try {
            const total = +req.params.total;
            await this.userSeedService.seedBunch(total);
            res.status(HTTP_STATUS_CODE.CREATED).send('Bunch created');
        } catch (error) {
            // TODO: logs?
            console.log(error);
        }
    }
}