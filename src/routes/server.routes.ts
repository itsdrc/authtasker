import { AsyncLocalStorage } from "async_hooks";
import { Model } from "mongoose";
import { Router } from "express";

import {
    ConfigService,
    EmailService,
    HashingService,
    JwtBlackListService,
    JwtService,
    LoggerService,
    RedisService
} from "@root/services";
import { IAsyncLocalStorageStore } from "@root/interfaces/common/async-local-storage.interface";
import { IUser } from "@root/interfaces/user/user.interface";
import { loadUserModel } from "@root/databases/mongo/models/users/user.model.load";
import { requestContextMiddlewareFactory } from "@root/middlewares/request-context.middleware";
import { SeedRoutes } from "@root/seed/routes/seed.routes";
import { UserRoutes } from "./user.routes";
import { TasksRoutes } from "./tasks.routes";
import { ITasks } from "@root/interfaces/tasks/task.interface";
import { loadTasksModel } from "@root/databases/mongo/models/tasks/tasks.model.load";

export class AppRoutes {

    private readonly jwtService: JwtService;
    private readonly hashingService: HashingService;
    private readonly emailService?: EmailService;
    private readonly userModel: Model<IUser>;
    private readonly tasksModel: Model<ITasks>;
    private readonly jwtBlacklistService: JwtBlackListService;

    constructor(
        private readonly configService: ConfigService,
        private readonly loggerService: LoggerService,
        private readonly asyncLocalStorage: AsyncLocalStorage<IAsyncLocalStorageStore>,
        private readonly redisService: RedisService,
    ) {
        this.jwtService = new JwtService(
            this.configService.JWT_PRIVATE_KEY,
        );

        this.hashingService = new HashingService(
            this.configService.BCRYPT_SALT_ROUNDS
        );

        this.userModel = loadUserModel(this.configService);
        this.tasksModel = loadTasksModel(this.configService);

        if (this.configService.mailServiceIsDefined()) {
            this.emailService = new EmailService({
                host: this.configService.MAIL_SERVICE_HOST,
                port: this.configService.MAIL_SERVICE_PORT,
                user: this.configService.MAIL_SERVICE_USER,
                pass: this.configService.MAIL_SERVICE_PASS,
            });
        }
        this.jwtBlacklistService = new JwtBlackListService(redisService);
    }

    private buildGlobalMiddlewares() {
        return [
            requestContextMiddlewareFactory(
                this.asyncLocalStorage,
                this.loggerService,
            )
        ];
    }

    private async buildUserRoutes(): Promise<Router> {
        const userRoutes = new UserRoutes(
            this.configService,
            this.userModel,
            this.hashingService,
            this.jwtService,
            this.jwtBlacklistService,
            this.loggerService,
            this.emailService,
        );
        return await userRoutes.build();
    }

    private async buildTasksRoutes(): Promise<Router> {
        const tasksRoutes = new TasksRoutes(
            this.loggerService,
            this.configService,
            this.tasksModel,
            this.userModel,
            this.jwtService,
            this.jwtBlacklistService
        );
        return await tasksRoutes.build();
    }

    private buildSeedRoutes() {
        const seedRoutes = new SeedRoutes(
            this.configService,
            this.userModel,
            this.hashingService,
            this.loggerService,
        );
        return seedRoutes.routes;
    }

    async buildApp() {
        const router = Router();

        router.use(this.buildGlobalMiddlewares());
        router.use('/api/users', await this.buildUserRoutes());
        router.use('/api/tasks', await this.buildTasksRoutes());

        if (this.configService.NODE_ENV === 'development')
            router.use('/seed', this.buildSeedRoutes());

        return router;
    }
}