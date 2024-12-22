import { AsyncLocalStorage } from "async_hooks";
import { Model } from "mongoose";
import { Router } from "express";

import {
    ConfigService,
    EmailService,
    HashingService,
    JwtService,
    LoggerService
} from "@root/services";
import { IAsyncLocalStorageStore } from "@root/interfaces/common/async-local-storage.interface";
import { IUser } from "@root/interfaces/user/user.interface";
import { loadUserModel } from "@root/databases/mongo/models/users/user.model.load";
import { requestContextMiddlewareFactory } from "@root/middlewares/request-context.middleware";
import { SeedRoutes } from "@root/seed/routes/seed.routes";
import { UserRoutes } from "./user.routes";

export class AppRoutes {

    private readonly jwtService: JwtService;
    private readonly hashingService: HashingService;
    private readonly emailService?: EmailService;
    private readonly userModel: Model<IUser>;

    constructor(
        private readonly configService: ConfigService,
        private readonly loggerService: LoggerService,
        private readonly asyncLocalStorage: AsyncLocalStorage<IAsyncLocalStorageStore>
    ) {
        this.jwtService = new JwtService(
            this.configService.JWT_EXPIRATION_TIME,
            this.configService.JWT_PRIVATE_KEY
        );

        this.hashingService = new HashingService(
            this.configService.BCRYPT_SALT_ROUNDS
        );

        this.userModel = loadUserModel(this.configService);

        if (this.configService.mailServiceIsDefined()) {
            this.emailService = new EmailService({
                host: this.configService.MAIL_SERVICE_HOST,
                port: this.configService.MAIL_SERVICE_PORT,
                user: this.configService.MAIL_SERVICE_USER,
                pass: this.configService.MAIL_SERVICE_PASS,
            });
        }
    }

    private buildGlobalMiddlewares() {
        return [
            requestContextMiddlewareFactory(
                this.asyncLocalStorage,
                this.loggerService,
            )
        ];
    }

    private buildUserRoutes(): Promise<Router> {
        const userRoutes = new UserRoutes(
            this.configService,
            this.userModel,
            this.hashingService,
            this.jwtService,
            this.loggerService,
            this.emailService,
        );
        return userRoutes.build();
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

        if (this.configService.NODE_ENV === 'development')
            router.use('/seed', this.buildSeedRoutes());

        return router;
    }
}