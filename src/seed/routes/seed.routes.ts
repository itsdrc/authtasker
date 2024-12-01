import { Router } from "express";
import { Model } from "mongoose";

import { HashingService } from "@root/services/hashing.service";
import { User } from "@root/types/user/user.type";
import { UserSeedRoutes } from "./user.seed.routes";
import { SystemLoggerService } from "@root/services/system-logger.service";

export class SeedRoutes {

    constructor(        
        private readonly userModel: Model<User>,
        private readonly hashingService: HashingService,    
    ) {
        SystemLoggerService.info('Seed routes loaded');
    }

    get routes(){    
        const userSeedRoutes = new UserSeedRoutes(            
            this.userModel,
            this.hashingService
        );

        const router = Router();
        router.use('/users', userSeedRoutes.routes);
        
        return router;
    }
}