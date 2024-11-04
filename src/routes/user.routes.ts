import { Router } from "express";
import { UserService } from "../services/user.service";
import { UserController } from "../controllers/user.controller";
import { UserModel } from "../databases/mongo/schemas/user.schema";
import { HashingService } from "../services/hashing.service";
import { ENVS } from "../config/envs.config";
import { JwtService } from "../services/jwt-token.service";

export class UserRoutes {

    // TODO: use only a single service instance for all routes across the application
    static get routes(): Router {
        const router = Router();
        const hashingService = new HashingService(ENVS.BCRYPT_SALT_ROUNDS);
        const jwtService = new JwtService(ENVS.JWT_EXPIRATION_TIME, ENVS.JWT_PRIVATE_KEY);
        const service = new UserService(
            UserModel,
            hashingService,
            jwtService,
        );
        const controller = new UserController(service);
        router.post('/create', controller.create);
        router.post('/login', controller.login);
        return router;
    }
}