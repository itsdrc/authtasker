import { AsyncLocalStorage } from "async_hooks";
import { Router } from "express";

import { ConfigService } from "@root/services/config.service";
import { EmailService } from "@root/services/email.service";
import { HashingService } from "@root/services/hashing.service";
import { IAsyncLocalStorageStore } from "@root/interfaces/common/async-local-storage.interface";
import { JwtService } from "@root/services/jwt.service";
import { LoggerService } from "@root/services/logger.service";
import { requestContextMiddlewareFactory } from "@root/middlewares/request-context.middleware";
import { SeedRoutes } from "@root/seed/routes/seed.routes";
import { UserRoutes } from "./user.routes";
import { loadUserModel } from "@root/databases/mongo/models/users/user.schema.load";

export class AppRoutes {

    constructor(
        private readonly configService: ConfigService,
        private readonly loggerService: LoggerService,
        private readonly asyncLocalStorage: AsyncLocalStorage<IAsyncLocalStorageStore>
    ) {}

    get routes(): Router {
        // common services

        let emailService: EmailService | undefined;
        if (this.configService.mailServiceIsDefined()) {
            emailService = new EmailService({
                host: this.configService.MAIL_SERVICE_HOST,
                port: this.configService.MAIL_SERVICE_PORT,
                user: this.configService.MAIL_SERVICE_USER,
                pass: this.configService.MAIL_SERVICE_PASS,
            });
        }

        const jwtService = new JwtService(
            this.configService.JWT_EXPIRATION_TIME,
            this.configService.JWT_PRIVATE_KEY
        );

        const hashingService = new HashingService(
            this.configService.BCRYPT_SALT_ROUNDS
        );

        const userModel = loadUserModel(this.configService);
        
        const userRoutes = new UserRoutes(
            this.configService,
            userModel,
            hashingService,
            jwtService,
            this.loggerService,
            emailService,
        );

        const router = Router();

        // global middlewares
        router.use(requestContextMiddlewareFactory(
            this.asyncLocalStorage,
            this.loggerService,
        ));

        // apis
        router.use('/api/users', userRoutes.routes);

        if (this.configService.NODE_ENV === 'development') {
            const seedRoutes = new SeedRoutes(
                userModel,
                hashingService,
                this.loggerService,
            );
            router.use('/api/seed', seedRoutes.routes);
        }

        return router;
    }
}