import { HydratedDocument, Model, Types } from "mongoose";

import { ConfigService } from "./config.service";
import { CreateUserValidator, LoginUserValidator } from "../rules/validators/models/user";
import { EmailService } from "./email.service";
import { HashingService } from "./hashing.service";
import { HttpError } from "../rules/errors/http.error";
import { IUser } from "../interfaces/user/user.interface";
import { JwtService } from "./jwt.service";
import { LoggerService } from "./logger.service";
import { PAGINATION_SETTINGS } from "../rules/constants/pagination.constants";
import { SystemLoggerService } from "./system-logger.service";
import { UpdateUserValidator } from "../rules/validators/models/user/update-user.validator";
import { UserRole } from "@root/types/user/user-roles.type";
import { Http } from "winston/lib/winston/transports";

export class UserService {

    constructor(
        private readonly configService: ConfigService,
        private readonly userModel: Model<IUser>,
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
        // web url is appended with a default "/" when read
        const link = `${this.configService.WEB_URL}api/users/validate-email/${token}`;

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
        const payload = this.jwtService.verify<{ email: string }>(token);
        if (!payload) {
            this.loggerService.error('INVALID TOKEN');
            throw HttpError.badRequest('Invalid token')
        }

        const email = payload.email;

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

    async create(user: CreateUserValidator): Promise<{ user: HydratedDocument<IUser>, token: string }> {
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
                this.loggerService.error(`DUPLICATE KEY ERROR: ${duplicatedKey}`);
                throw HttpError.badRequest(`${duplicatedKey} already exists`);
            }
            else {
                throw error;
            }
        }
    }

    async login(userToLogin: LoginUserValidator): Promise<{ user: HydratedDocument<IUser>, token: string }> {
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

    async findOne(id: string): Promise<HydratedDocument<IUser>> {
        let userDb;

        if (Types.ObjectId.isValid(id))
            userDb = await this.userModel.findById(id).exec();

        // id is not valid / user not found
        if (!userDb)
            throw HttpError.badRequest(`User with id ${id} not found`);

        return userDb;
    }

    async findAll(limit?: number, page?: number): Promise<HydratedDocument<IUser>[]> {
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
        const user = await this.findOne(id);
        if (user.role === 'admin') {
            this.loggerService.error('Can not delete admin users');
            throw HttpError.unAuthorized('You do not have permissions to perform this action');
        }

        await user.deleteOne().exec();
        this.loggerService.info(`USER ${id} DELETED`);
    }

    async updateOne(id: string, propertiesUpdated: UpdateUserValidator): Promise<HydratedDocument<IUser>> {
        const user = await this.findOne(id);

        if (user.role === 'admin') {
            this.loggerService.error('Can not update admin users');
            throw HttpError.unAuthorized('You do not have permissions to perform this action');
        }

        Object.assign(user, propertiesUpdated);
            
        if (propertiesUpdated.password)
            user.password = await this.hashingService.hash(propertiesUpdated.password);

        // if email is different change "emailValidated" prop
        if (propertiesUpdated.email) {
            if (user.email !== propertiesUpdated.email)
                user.emailValidated = false;
        }

        await user.save();
        this.loggerService.info(`User ${id} updated`);

        return user;
    }
}