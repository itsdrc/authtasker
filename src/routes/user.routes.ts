import { Model } from "mongoose";
import { Router } from "express";
import { ConfigService, HashingService, LoggerService, SystemLoggerService, UserService } from "@root/services";
import { createAdmin } from "@root/admin/create-admin";
import { IUser } from "@root/interfaces";
import { RequestLimiterMiddlewares, RolesMiddlewares } from "@root/types/middlewares";
import { UserController } from "@root/controllers";

export class UserRoutes {

    private readonly userController: UserController;

    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly userModel: Model<IUser>,
        private readonly hashingService: HashingService,
        private readonly loggerService: LoggerService,
        private readonly rolesMiddlewares: RolesMiddlewares,
        private readonly requestLimiterMiddlewares: RequestLimiterMiddlewares,
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

        router.post(
            '/register',
            this.requestLimiterMiddlewares.authLimiter,
            this.userController.create
        );

        router.post(
            '/login',
            this.requestLimiterMiddlewares.authLimiter,
            this.userController.login
        );

        router.post(
            '/requestEmailValidation',
            this.requestLimiterMiddlewares.authLimiter,
            this.rolesMiddlewares.readonly,
            this.userController.requestEmailValidation
        );

        router.post(
            '/logout',
            this.requestLimiterMiddlewares.authLimiter,
            this.rolesMiddlewares.readonly,
            this.userController.logout
        );

        router.delete(
            '/:id',
            this.requestLimiterMiddlewares.apiLimiter,
            this.rolesMiddlewares.readonly,
            this.userController.deleteOne
        );

        router.patch(
            '/:id',
            this.requestLimiterMiddlewares.apiLimiter,
            this.rolesMiddlewares.readonly,
            this.userController.updateOne
        );

        router.get(
            '/confirmEmailValidation/:token',
            this.requestLimiterMiddlewares.apiLimiter,
            this.requestLimiterMiddlewares.authLimiter,
            this.userController.confirmEmailValidation
        );

        router.get(
            '/:id',
            this.requestLimiterMiddlewares.apiLimiter,
            this.rolesMiddlewares.readonly,
            this.userController.findOne
        );

        router.get(
            '/',
            this.requestLimiterMiddlewares.apiLimiter,
            this.rolesMiddlewares.readonly,
            this.userController.findAll
        );

        return router;
    }
}