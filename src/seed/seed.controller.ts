import { Request, Response } from "express";
import { LoggerService } from "@root/services";
import { UserSeedService } from "./services/user.seed.service";
import { TasksSeedService } from "./services/tasks.seed.service";
import { handleError } from "@root/common/handlers/error.handler";

export class SeedController {

    constructor(
        private readonly loggerService: LoggerService,
        private readonly userSeedService: UserSeedService,
        private readonly tasksSeedService: TasksSeedService,
    ) {}

    seedUsers = async (req: Request, res: Response) => {
        try {
            const total = +req.params.total;
            await this.userSeedService.seedBunch(total);
            res.status(201).end();

            this.loggerService.debug(`Database seeded with ${total} users`);

        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    };

    seedTasks = async (req: Request, res: Response) => {
        try {
            const total = +req.params.total;
            await this.tasksSeedService.seedBunch(total);
            res.status(201).end();

            this.loggerService.debug(`Database seeded with ${total} tasks for admin user`);

        } catch (error) {
            handleError(res, error, this.loggerService);
        }
    }
}