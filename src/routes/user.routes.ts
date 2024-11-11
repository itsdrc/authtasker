import { Router } from "express";
import { UserService } from "../services/user.service";
import { UserController } from "../controllers/user.controller";
import { HashingService } from "../services/hashing.service";
import { JwtService } from "../services/jwt.service";
import { EmailService } from "../services/email.service";
import { User } from "../types/user/user.type";
import { Model } from "mongoose";
import { ConfigService } from "../services/config.service";

export class UserRoutes {

    constructor(
        private readonly configService: ConfigService,
        private readonly userModel: Model<User>,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
        private readonly emailService?: EmailService,
    ) {}

    get routes(): Router {
        const router = Router();
        const service = new UserService(
            this.configService,
            this.userModel,
            this.hashingService,
            this.jwtService,
            this.emailService
        );
        const controller = new UserController(service);
        router.post('/create', controller.create);
        router.post('/login', controller.login);
        router.get('/validate-email/:token', controller.validateEmail);
        router.get('/:id', controller.findOne);
        router.get('/',controller.findAll);                
        return router;
    }
}