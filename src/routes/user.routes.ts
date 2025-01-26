import { Model } from "mongoose";
import { Router } from "express";

import { ConfigService } from "@root/services/config.service";
import { HashingService } from "@root/services/hashing.service";
import { IUser } from "@root/interfaces/user/user.interface";
import { LoggerService } from "@root/services/logger.service";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { UserController } from "@root/controllers/user.controller";
import { UserService } from "@root/services/user.service";
import { createAdmin } from "@root/admin/create-admin";
import { RolesMiddlewares } from "@root/types/middlewares/roles.middlewares.type";

export class UserRoutes {

    private readonly userController: UserController;

    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly userModel: Model<IUser>,
        private readonly hashingService: HashingService,
        private readonly loggerService: LoggerService,
        private readonly rolesMiddlewares: RolesMiddlewares,
    ) {
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
        
        router.post('/create', this.userController.create);
        router.post('/login', this.userController.login);
        router.post('/requestEmailValidation', this.rolesMiddlewares.readonly, this.userController.requestEmailValidation);
        router.post('/logout', this.rolesMiddlewares.readonly, this.userController.logout);
        router.get('/confirmEmailValidation/:token', this.userController.confirmEmailValidation);
        router.get('/:id', this.rolesMiddlewares.readonly, this.userController.findOne);
        router.get('/', this.rolesMiddlewares.readonly, this.userController.findAll);
        router.delete('/:id', this.rolesMiddlewares.readonly, this.userController.deleteOne);
        router.patch('/:id', this.rolesMiddlewares.readonly, this.userController.updateOne);

        return router;
    }
}