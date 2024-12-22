import { Model } from "mongoose";
import { Router } from "express";

import { ConfigService } from "@root/services/config.service";
import { EmailService } from "@root/services/email.service";
import { HashingService } from "@root/services/hashing.service";
import { IUser } from "@root/interfaces/user/user.interface";
import { JwtService } from "@root/services/jwt.service";
import { LoggerService } from "@root/services/logger.service";
import { rolesMiddlewareFactory } from "@root/middlewares/roles.middleware";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { UserController } from "@root/controllers/user.controller";
import { UserService } from "@root/services/user.service";
import { createAdmin } from "@root/admin/create-admin";

export class UserRoutes {

    private readonly userService: UserService;
    private readonly userController: UserController;

    constructor(
        private readonly configService: ConfigService,
        private readonly userModel: Model<IUser>,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
        private readonly loggerService: LoggerService,
        private readonly emailService?: EmailService,
    ) {
        this.userService = new UserService(
            this.configService,
            this.userModel,
            this.hashingService,
            this.jwtService,
            this.loggerService,
            this.emailService
        );

        this.userController = new UserController(
            this.userService,
            this.loggerService
        );

        SystemLoggerService.info('User routes loaded');
    }

    private async initialData() {
        await createAdmin(
            this.userModel,
            this.configService,
            this.hashingService
        );
    }

    async build(): Promise<Router> {
        await this.initialData();

        const router = Router();
        const readonlyMiddleware = rolesMiddlewareFactory(
            'readonly',
            this.userModel,
            this.loggerService,
            this.jwtService
        );

        router.post('/create', this.userController.create);
        router.post('/login', this.userController.login);
        router.get('/validate-email/:token', this.userController.validateEmail);

        router.get('/:id', readonlyMiddleware, this.userController.findOne);
        router.get('/', readonlyMiddleware, this.userController.findAll);
        router.delete('/:id', readonlyMiddleware, this.userController.deleteOne);
        router.patch('/:id', readonlyMiddleware, this.userController.updateOne);

        return router;
    }
}