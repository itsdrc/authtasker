import { Model } from "mongoose";
import { Router } from "express";
import { ConfigService } from "@root/services/config.service";
import { User } from "@root/types/user/user.type";
import { HashingService } from "@root/services/hashing.service";
import { JwtService } from "@root/services/jwt.service";
import { EmailService } from "@root/services/email.service";
import { UserService } from "@root/services/user.service";
import { UserController } from "@root/controllers/user.controller";
import { LoggerService } from "@root/services/logger.service";

export class UserRoutes {

    constructor(
        private readonly configService: ConfigService,
        private readonly userModel: Model<User>,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
        private readonly loggerService: LoggerService,
        private readonly emailService?: EmailService,        
    ) {}

    get routes(): Router {
        const router = Router();
        const service = new UserService(
            this.configService,
            this.userModel,
            this.hashingService,
            this.jwtService,
            this.loggerService,
            this.emailService
        );
        const controller = new UserController(service, this.loggerService);        
        router.post('/create', controller.create);
        router.post('/login', controller.login);
        router.get('/validate-email/:token', controller.validateEmail);
        router.get('/:id', controller.findOne);
        router.get('/',controller.findAll);    
        router.delete('/:id', controller.deleteOne);            
        router.patch('/:id', controller.updateOne);
        return router;
    }
}