import { Router } from "express";
import { Model } from "mongoose";

import { HashingService } from "@root/services/hashing.service";
import { IUser } from "@root/interfaces/user/user.interface";
import { LoggerService } from "@root/services/logger.service";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { UserSeedRoutes } from "./user.seed.routes";
import { ConfigService } from "@root/services/config.service";

export class SeedRoutes {

    constructor(
        private readonly configService: ConfigService,
        private readonly userModel: Model<IUser>,
        private readonly hashingService: HashingService,
        private readonly loggerService: LoggerService,
    ) {
        SystemLoggerService.warn('Seed routes loaded');
    }

    get routes() {
        const userSeedRoutes = new UserSeedRoutes(
            this.configService,
            this.userModel,
            this.hashingService,
            this.loggerService,            
        );

        const router = Router();
        router.use('/users', userSeedRoutes.routes);

        return router;
    }
}