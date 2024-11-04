import { Router } from "express";
import { UserService } from "../services/user.service";
import { UserController } from "../controllers/user.controller";
import { UserModel } from "../databases/mongo/schemas/user.schema";
import { HashingService } from "../services/hashing.service";
import { ENVS } from "../config/envs.config";

export class UserRoutes {

    static get routes(): Router {
        const router = Router();        
        const hashingService = new HashingService(ENVS.BCRYPT_SALT_ROUNDS);
        const service = new UserService(
            UserModel,
            hashingService
        );
        const controller = new UserController(service);
        router.post('/', controller.create);
        return router;
    }
}