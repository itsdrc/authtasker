import { Model } from "mongoose";
import { Router } from "express";

import { HashingService } from "@root/services/hashing.service";
import { IUser } from "@root/interfaces/user/user.interface";
import { LoggerService } from "@root/services/logger.service";
import { UserSeedController } from "../controllers/user.seed.controller";
import { UserSeedService } from "../services/user.seed.service";
import { ConfigService } from "@root/services/config.service";

export class UserSeedRoutes {

    constructor(
        private readonly configService: ConfigService,
        private readonly userModel: Model<IUser>,
        private readonly hashingService: HashingService,
        private readonly loggerService: LoggerService,
    ) {}

    get routes() {
        const userSeedService = new UserSeedService(
            this.configService,
            this.userModel,
            this.hashingService,
        );
        
        const userSeedController = new UserSeedController(
            userSeedService,
            this.loggerService,
        );

        const router = Router();
        router.post('/bunch/:total', userSeedController.seedBunch);

        return router;
    }
}