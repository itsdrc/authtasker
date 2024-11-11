import { Router } from "express";
import { UserRoutes } from "./user.routes";
import { ConfigService } from "../services/config.service";
import { HashingService } from "../services/hashing.service";
import { JwtService } from "../services/jwt.service";
import { EmailService } from "../services/email.service";
import { UserModel } from "../databases/mongo/schemas/user.schema";
import { SeedRoutes } from "../seed/routes/seed.routes";

export class AppRoutes {

    constructor(private readonly configService: ConfigService) {}

    get routes(): Router {
        // common services
        
        let emailService: EmailService | undefined ;
        if(this.configService.mailServiceIsDefined()){
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

        const userRoutes = new UserRoutes(
            this.configService,
            UserModel,
            hashingService,
            jwtService,
            emailService,
        );

        const router = Router();
        router.use('/api/users', userRoutes.routes);        

        if (this.configService.NODE_ENV != 'production') {
            const seedRoutes = new SeedRoutes(
                UserModel,
                hashingService
            );
            router.use('/api/seed', seedRoutes.routes);
        }

        return router;
    }
}