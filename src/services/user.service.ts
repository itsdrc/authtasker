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
import { JwtBlackListService } from "./jwt-blacklist.service";
import { TOKEN_PURPOSES } from "@root/rules/constants/token-purposes.constants";

export class UserService {

    constructor(
        private readonly configService: ConfigService,
        private readonly userModel: Model<IUser>,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
        private readonly jwtBlacklistService: JwtBlackListService,
        private readonly loggerService: LoggerService,
        private readonly emailService?: EmailService,
    ) {
        if (!this.configService.mailServiceIsDefined())
            SystemLoggerService.warn('Email validation is not enabled');
    }

    private async blackListToken(jti: string, tokenExp: number) {
        const currentTime = Math.floor(Date.now() / 1000);
        const remainingTokenTTL = tokenExp! - currentTime;
        await this.jwtBlacklistService.blacklist(jti, remainingTokenTTL);
    }

    private throwInvalidTokenError(): never {
        const error = 'Invalid token';
        this.loggerService.error(error);
        throw HttpError.badRequest(error);
    }

    private generateSessionToken(userId: string): string {
        const token = this.jwtService.generate(this.configService.JWT_SESSION_EXPIRATION_TIME, {
            id: userId,
            purpose: TOKEN_PURPOSES.SESSION
        });

        return token;
    }

    private handlePossibleDuplicatedKeyError(error: any): never {
        if (error.code && error.code === 11000) {
            const duplicatedKey = Object.keys(error.keyValue);
            const keyValue = Object.values(error.keyValue);
            const message = `User with ${duplicatedKey} "${keyValue}" already exists`;
            this.loggerService.error(message);
            throw HttpError.badRequest(message);
        } else {
            // rethrowing        
            throw error;
        }
    }

    private async sendEmailValidationLink(email: string): Promise<void> {
        // this function shouldn't be called if emailService is not provided 
        if (!this.emailService) {
            SystemLoggerService.error('An email validation is trying to be sent but email service is not injected');
            throw HttpError.internalServer('Email can not be validated due to a server error');
        }

        const jwtExpirationTime = '10m';
        const token = this.jwtService.generate(jwtExpirationTime, {
            purpose: TOKEN_PURPOSES.EMAIL_VALIDATION,
            email: email,
        });

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

        if (user?.emailValidated === true) {
            this.loggerService.error(`Email ${user.email} is already validated`);
            throw HttpError.badRequest('User email is already validated');
        }

        if (!user) {
            this.loggerService.error(`User with id ${id} not found`);
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
            this.throwInvalidTokenError();
        }

        const emailInToken = payload.email;
        if (!emailInToken) {
            this.loggerService.debug('Email not in token');
            this.throwInvalidTokenError();
        }

        const validPurpose = payload.purpose === TOKEN_PURPOSES.EMAIL_VALIDATION;
        if (!validPurpose) {
            this.loggerService.debug('Unexpected token purpose');
            this.throwInvalidTokenError();
        }

        const tokenIsBlacklisted = await this.jwtBlacklistService.isBlacklisted(payload.jti)
        if (tokenIsBlacklisted) {
            this.loggerService.debug('Token is blacklisted');
            this.throwInvalidTokenError();
        }

        // single-use token
        await this.blackListToken(payload.jti, payload.exp!);

        // check user existence
        const user = await this.userModel.findOne({ email: payload.email }).exec();
        if (!user) {
            this.loggerService.error(`User ${payload.email} not found`);
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
            const token = this.generateSessionToken(created.id);

            this.loggerService.info(`USER ${created.id} CREATED`);

            return {
                user: created,
                token,
            };

        } catch (error: any) {
            this.handlePossibleDuplicatedKeyError(error);
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
        const token = this.generateSessionToken(userDb.id);

        this.loggerService.info(`USER ${userDb.id} LOGGED IN`);

        return {
            user: userDb,
            token,
        }
    }

    async logout(jti: string, tokenExpTime: number): Promise<void> {
        await this.blackListToken(jti, tokenExpTime);
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
        if (limit <= 0) {
            this.loggerService.error('Limit is not a valid number');
            throw HttpError.badRequest('Limit must be a valid number');
        }

        if (limit > 100) {
            const error = 'Limit is too large';
            this.loggerService.error(error);
            throw HttpError.badRequest(error);
        }

        const totalDocuments = await this.userModel
            .countDocuments()
            .exec();

        if (totalDocuments === 0) {
            this.loggerService.info('No documents found');
            return [];
        }

        const totalPages = Math.ceil(totalDocuments / limit);

        if (page <= 0) {
            this.loggerService.error('Page is not a valid number');
            throw HttpError.badRequest('Page must be a valid number');
        }

        if (page > totalPages) {
            const error = 'Invalid page';
            this.loggerService.error(error);
            throw HttpError.badRequest(error);
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
            this.loggerService.error('User is not authorized to perform this action');
            throw HttpError.forbidden(FORBIDDEN_MESSAGE);
        }
        await userToDelete.deleteOne().exec();
        this.loggerService.info(`USER ${id} DELETED`);
    }

    async updateOne(requestUserInfo: { id: string, role: UserRole }, id: string, propertiesUpdated: UpdateUserValidator): Promise<HydratedDocument<IUser>> {
        try {
            const userToUpdate = await this.IsModificationAuthorized(requestUserInfo, id);
            if (!userToUpdate) {
                this.loggerService.error('User is not authorized to perform this action');
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

            if (propertiesUpdated.name) {
                userToUpdate.name = propertiesUpdated.name
            }

            await userToUpdate.save();
            this.loggerService.info(`User ${id} updated`);

            return userToUpdate;
        } catch (error: any) {
            this.handlePossibleDuplicatedKeyError(error);
        }
    }

    // returns the user to modify in order to not have to findOne it again
    private async IsModificationAuthorized(requestUserInfo: { id: string, role: UserRole }, userIdToUpdate: string): Promise<HydratedDocument<IUser> | null> {
        const userToModify = await this.findOne(userIdToUpdate);

        // admin users can modify other users (but not other admins)
        if (requestUserInfo.role === 'admin' && userToModify.role !== 'admin')
            return userToModify;

        // users can modify themselves
        if (requestUserInfo.id === userToModify.id)
            return userToModify;

        return null;
    }
}