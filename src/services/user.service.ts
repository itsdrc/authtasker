import { HydratedDocument, Model, Types } from "mongoose";

import { ConfigService } from "./config.service";
import { CreateUserValidator, LoginUserValidator } from "../rules/validators/models/user";
import { EmailService } from "./email.service";
import { HashingService } from "./hashing.service";
import { HttpError } from "../rules/errors/http.error";
import { JwtService } from "./jwt.service";
import { PAGINATION_SETTINGS } from "../rules/constants/pagination.constants";
import { UpdateUserValidator } from "../rules/validators/models/user/update-user.validator";
import { User } from "../types/user/user.type";
import { LoggerService } from "./logger.service";
import { SystemLoggerService } from "./system-logger.service";

export class UserService {

    constructor(
        private readonly configService: ConfigService,
        private readonly userModel: Model<User>,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
        private readonly loggerService: LoggerService,
        private readonly emailService?: EmailService,
    ) {}

    private async sendEmailValidationLink(email: string): Promise<void> {
        // this function shouldn't be called if emailService is not provided 
        if (!this.emailService) {
            SystemLoggerService.error('AN EMAIL VALIDATION IS TRYING TO BE SENT BUT EMAIL SERVICE IS NOT INJECTED');
            throw HttpError.internalServer('Email can not be validated due to a server error');
        }

        const token = this.jwtService.generate({ email });
        const link = `${this.configService.WEB_URL}/api/users/validate-email/${token}`;

        await this.emailService.sendMail({
            to: email,
            subject: 'Email validation',
            html: `
            <h1> Validate your email </h1>
            <p> Click below to validate your email </p>
            <a href= "${link}"> Validate your email ${email} </a>`,
        });
    }

    async validateEmail(token: string): Promise<void> {
        // token verification
        const payload = this.jwtService.verify(token);
        if (!payload) {
            this.loggerService.error('INVALID TOKEN');
            throw HttpError.badRequest('Invalid token')
        }

        const { email } = payload as { email: string };
        if (!email) {
            this.loggerService.error('EMAIL NOT IN TOKEN');
            throw HttpError.internalServer('Email not in token');
        }

        // check user existence
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            this.loggerService.error(`USER ${email} NOT FOUND`);
            throw HttpError.notFound('User not found');
        }

        // update 
        user.emailValidated = true;
        await user.save();

        this.loggerService.info(`USER ${user.id} UPDATED TO VALID`);
    }

    async create(user: CreateUserValidator): Promise<{ user: HydratedDocument<User>, token: string }> {
        try {
            // hashing
            const passwordHash = await this.hashingService.hash(user.password);
            user.password = passwordHash;

            // creation in db
            const created = await this.userModel.create(user);

            // token generation
            const token = this.jwtService.generate({ id: created.id });

            // email validation
            if (this.configService.mailServiceIsDefined()) {
                await this.sendEmailValidationLink(user.email);
                this.loggerService.info('EMAIL VALIDATION LINK SENT');
            } else {
                this.loggerService.warn(`EMAIL VALIDATION NOT ENABLED`);
            }

            this.loggerService.info(`USER ${created.id} CREATED`);

            return {
                user: created,
                token,
            };

        } catch (error: any) {
            if (error.code == 11000) {
                const duplicatedKey = Object.values(error.keyValue).join(', ');
                this.loggerService.error(`DUPLICATE KEY ERROR`);
                throw HttpError.badRequest(`${duplicatedKey} already exists`);
            }
            else {
                throw error;
            }
        }
    }

    async login(userToLogin: LoginUserValidator): Promise<{ user: HydratedDocument<User>, token: string }> {
        // check user existence
        const userDb = await this.userModel.findOne({ email: userToLogin.email }).exec();
        if (!userDb) {
            this.loggerService.error(`USER ${userToLogin.email} NOT FOUND`);
            throw HttpError.badRequest(`User with email ${userToLogin.email} not found`);
        }

        // check password
        const passwordOk = await this.hashingService.compare(
            userToLogin.password,
            userDb.password
        );
        if (!passwordOk) {
            this.loggerService.error('PASSWORD DOES NOT MATCH');
            throw HttpError.badRequest('Incorrect password');
        }

        // token generation
        const token = this.jwtService.generate({ id: userDb.id });

        this.loggerService.info(`USER ${userDb.id} LOGGED IN`);

        return {
            user: userDb,
            token,
        }
    }

    async findOne(id: string): Promise<HydratedDocument<User>> {
        let userDb;
        // avoids the error throwing when id is not a mongo id
        // otherwise is easy to know that we are using mongo as db
        if (Types.ObjectId.isValid(id))
            userDb = await this.userModel.findById(id).exec();

        if (!userDb)
            throw HttpError.badRequest(`User with id ${id} not found`);

        return userDb;
    }

    async findAll(limit?: number, page?: number): Promise<HydratedDocument<User>[]> {
        if (!limit)
            limit = PAGINATION_SETTINGS.DEFAULT_LIMIT;

        if (!page)
            page = PAGINATION_SETTINGS.DEFAULT_PAGE;

        const offset = (page - 1) * limit;

        return await this.userModel.find()
            .skip(offset)
            .limit(limit)
            .exec();
    }

    async deleteOne(id: string): Promise<void> {
        let deleted;
        if (Types.ObjectId.isValid(id))
            deleted = await this.userModel.findByIdAndDelete(id).exec();

        if (!deleted) {
            this.loggerService.error(`USER ${id} NOT FOUND`);
            throw HttpError.badRequest(`User with id ${id} not found`);
        }

        this.loggerService.info(`USER ${id} DELETED`);
    }

    async updateOne(id: string, propertiesUpdated: UpdateUserValidator): Promise<HydratedDocument<User>> {
        // TODO: what if password is updated or email (emailValidated should be false);
        let user;
        if (Types.ObjectId.isValid(id))
            user = await this.userModel.findByIdAndUpdate(id, propertiesUpdated).exec();

        if (!user) {
            this.loggerService.error(`USER ${id} NOT FOUND`);
            throw HttpError.badRequest(`User with id ${id} not found`);
        }

        Object.assign(user, propertiesUpdated);
        this.loggerService.info(`USER ${id} UPDATED`);

        return user;
    }
}