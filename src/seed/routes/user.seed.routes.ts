import { Model } from "mongoose";
import { User } from "../../types/user/user.type";
import { Router } from "express";
import { UserSeedService } from "../services/user.seed.service";
import { HashingService } from "../../services/hashing.service";
import { UserSeedController } from "../controllers/user.seed.controller";

export class UserSeedRoutes {

    constructor(        
        private readonly userModel: Model<User>,
        private readonly hashingService: HashingService,
    ) {}

    get routes(){        
        const userSeedService = new UserSeedService(
            this.userModel,
            this.hashingService
        );
        const userSeedController = new UserSeedController(userSeedService);        
        
        const router = Router();
        router.post('/bunch/:total', userSeedController.seedBunch);

        return router;
    }    
}