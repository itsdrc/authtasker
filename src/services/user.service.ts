import { HydratedDocument, Model, Types } from "mongoose";

import { ConfigService } from "./config.service";
import { CreateUserValidator, LoginUserValidator } from "../rules/validators/models/user";
import { EmailService } from "./email.service";
import { HashingService } from "./hashing.service";
import { HttpError } from "../rules/errors/http.error";
import { IUser } from "../interfaces/user/user.interface";
import { JwtService } from "./jwt.service";
import { LoggerService } from "./logger.service";
import { SystemLoggerService } from "./system-logger.service";
import { UpdateUserValidator } from "../rules/validators/models/user/update-user.validator";
import { UserRole } from "@root/types/user/user-roles.type";
import { FORBIDDEN_MESSAGE } from "@root/rules/errors/messages/error.messages";

export class UserService {

    constructor(
        private readonly configService: ConfigService,
        private readonly userModel: Model<IUser>,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
        private readonly loggerService: LoggerService,
        private readonly emailService?: EmailService,
    ) {
        if (!this.configService.mailServiceIsDefined())
            SystemLoggerService.warn('Email validation is not enabled');
    }

    private async sendEmailValidationLink(email: string): Promise<void> {
        // this function shouldn't be called if emailService is not provided 
        if (!this.emailService) {
            SystemLoggerService.error('An email validation is trying to be sent but email service is not injected');
            throw HttpError.internalServer('Email can not be validated due to a server error');
        }

        const token = this.jwtService.generate({ email });
        // web url is appended with a default "/" when read
        const link = `${this.configService.WEB_URL}api/users/confirmEmailValidation/${token}`;

        await this.emailService.sendMail({
            to: email,
            subject: 'Email validation',
            html: `
            <h1> Validate your email </h1>
            <p> Click below to validate your email </p>
            <a href= "${link}"> Validate your email ${email} </a>`,
        });

        this.loggerService.info(`Email validation sent to ${email}`);
    }

    async requestEmailValidation(id: string): Promise<void> {
        const user = await this.userModel
            .findById(id)
            .exec();

        if (!user) {
            // todo: logging
            throw HttpError.badRequest('User not found');
        }

        if (this.configService.mailServiceIsDefined()) {
            await this.sendEmailValidationLink(user.email);            
        } else {
            this.loggerService.debug('Email validation not sent because is not enabled')
        }
    }

    async confirmEmailValidation(token: string): Promise<void> {
        // token verification
        const payload = this.jwtService.verify<{ email: string }>(token);
        if (!payload) {
            this.loggerService.error('INVALID TOKEN');
            throw HttpError.badRequest('Invalid token')
        }

        const email = payload.email;
        if (!email) {
            this.loggerService.error('EMAIL NOT IN TOKEN');
            throw HttpError.badRequest('Email not in token');
        }

        // check user existence
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            this.loggerService.error(`USER ${email} NOT FOUND`);
            throw HttpError.notFound('User not found');
        }

        // update 
        user.emailValidated = true;
        user.role = 'editor';

        await user.save();

        this.loggerService.info(`User ${user.id} email validated, now is editor`);
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
            throw HttpError.notFound(`User with id ${id} not found`);

        return userDb;
    }

    async findAll(limit: number, page: number): Promise<HydratedDocument<IUser>[]> {
        // if (!Number.isInteger(limit) || !Number.isInteger(!page)) {
        //     // TODO: logging
        //     throw HttpError.badRequest('Limit and page must be a valid integer');
        // }

        if (limit <= 0) {
            // TODO: logging
            throw HttpError.badRequest('Limit must be a valid number');
        }

        if (limit > 100) {
            // TODO: logging
            throw HttpError.badRequest('Limit is too large');
        }

        const totalDocuments = await this.userModel
            .countDocuments()
            .exec();

        if (totalDocuments === 0) {
            // TODO: logging
            return [];
        }

        const totalPages = Math.ceil(totalDocuments / limit);

        if (page <= 0) {
            // TODO: logging
            throw HttpError.badRequest('Page must be a valid number');
        }

        if (page > totalPages) {
            // TODO: logging
            throw HttpError.badRequest('Invalid page');
        }

        const offset = (page - 1) * limit;

        return await this.userModel
            .find()
            .skip(offset)
            .limit(limit)
            .exec();
    }

    async deleteOne(requestUserInfo: { id: string, role: UserRole }, id: string): Promise<void> {
        const userToDelete = await this.IsModificationAuthorized(requestUserInfo, id);
        if (!userToDelete) {
            // TODO: logging
            throw HttpError.forbidden(FORBIDDEN_MESSAGE);
        }
        await userToDelete.deleteOne().exec();
        this.loggerService.info(`USER ${id} DELETED`);
    }

    async updateOne(requestUserInfo: { id: string, role: UserRole }, id: string, propertiesUpdated: UpdateUserValidator): Promise<HydratedDocument<IUser>> {
        const userToUpdate = await this.IsModificationAuthorized(requestUserInfo, id);
        if (!userToUpdate) {
            // TODO: logging
            throw HttpError.forbidden(FORBIDDEN_MESSAGE);
        }

        if (propertiesUpdated.password) {
            userToUpdate.password = await this.hashingService.hash(propertiesUpdated.password);        
        }

        // if email is different change "emailValidated" prop        
        if (propertiesUpdated.email) {
            if (userToUpdate.email !== propertiesUpdated.email) {                
                userToUpdate.emailValidated = false;
                userToUpdate.role = 'readonly';
            }
            userToUpdate.email = propertiesUpdated.email;            
        }

        if(propertiesUpdated.name){
            userToUpdate.name = propertiesUpdated.name
        }

        await userToUpdate.save();
        this.loggerService.info(`User ${id} updated`);

        return userToUpdate;
    }

    // returns the user to modify in order to not have to findOne it again
    private async IsModificationAuthorized(requestUserInfo: { id: string, role: UserRole }, userIdToUpdate: string): Promise<HydratedDocument<IUser> | null> {
        const userToModify = await this.findOne(userIdToUpdate);

        // users can modify themselves
        if (requestUserInfo.id === userToModify.id)
            return userToModify;

        // admins can modify other users (except for other admins)
        if (requestUserInfo.role === 'admin') {
            if (!(userToModify.role === 'admin'))
                return userToModify;
        }

        return null;
    }
}