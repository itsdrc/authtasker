import { Router } from "express";
import { UserService } from "../services/user.service";
import { UserController } from "../controllers/user.controller";
import { UserModel } from "../databases/mongo/schemas/user.schema";

export class UserRoutes {

    static get routes(): Router {
        const router = Router();
        const service = new UserService(UserModel);
        const controller = new UserController(service);
        router.post('/', controller.create);
        return router;
    }
}