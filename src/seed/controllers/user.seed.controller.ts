import { Request, Response } from "express";

import { UserSeedService } from "../services/user.seed.service";
import { HTTP_STATUS_CODE } from "@root/rules/constants/http-status-codes.constants";
import { LoggerService } from "@root/services/logger.service";
import { handleError } from "@root/common/helpers/handle-error.helper";

export class UserSeedController {

    constructor(
        private readonly userSeedService: UserSeedService,
        private readonly loggerService: LoggerService,
    ) {}

    readonly seedBunch = async (req: Request, res: Response) => {
        try {
            const total = +req.params.total;
            await this.userSeedService.seedBunch(total);
            res.status(HTTP_STATUS_CODE.CREATED).send('Bunch created');
            this.loggerService.warn(`All users deleted`);
            this.loggerService.debug(`Database seeded with ${total} users`);
        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }
}