import { Router } from "express";
import { UserService } from "../services/user.service";
import { UserController } from "../controllers/user.controller";

export class UserRoutes {

    static get routes(): Router {
        const router = Router();
        const service = new UserService();
        const controller = new UserController(service);
        router.post('/', controller.create);
        return router;
    }
}