import { Model } from "mongoose";
import { User } from "../../types/user/user.type";
import { Router } from "express";
import { HashingService } from "../../services/hashing.service";
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