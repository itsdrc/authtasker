import { Router } from "express";
import { Model } from "mongoose";

import { HashingService } from "@root/services/hashing.service";
import { User } from "@root/types/user/user.type";
import { UserSeedRoutes } from "./user.seed.routes";

export class SeedRoutes {

    constructor(        
        private readonly userModel: Model<User>,
        private readonly hashingService: HashingService,    
    ) {}

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