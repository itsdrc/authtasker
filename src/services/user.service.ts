import { CreateUserValidator } from "../rules/validators/create-user.validator";
import { HttpError } from "../rules/errors/http.error";
import { Model } from "mongoose";
import { HashingService } from "./hashing.service";
import { JwtService } from "./jwt.service";
import { LoginUserValidator } from "../rules/validators/login-user.validator";
import { UserResponse } from "../types/user/user-response.type";
import { User } from "../types/user/user.type";
import { EmailService } from "./email.service";
import { ConfigService } from "./config.service";
import { PAGINATION_SETTINGS } from "../rules/constants/pagination.constants";

export class UserService {

    constructor(
        private readonly configService: ConfigService,
        private readonly userModel: Model<User>,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
    ) {}

    private async sendEmailValidationLink(email: string): Promise<void> {
        // Generate a token with email
        const token = this.jwtService.generate({ email });

        // Create a link based on token
        const link = `${this.configService.WEB_URL}/api/users/validate-email/${token}`;

        // Send
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
        // Check if token is a valid token
        const payload = this.jwtService.verify(token);
        if (!payload)
            throw HttpError.badRequest('Invalid token')

        // Email should be in token
        const { email } = payload as { email: string };
        if (!email)
            throw HttpError.internalServer('Email not in token');

        // Check if user email exists in db
        const user = await this.userModel.findOne({ email });
        if (!user)
            throw HttpError.notFound('User not found');

        // Update user data
        user.emailValidated = true;
        await user.save();
    }

    async create(user: CreateUserValidator): Promise<{ user: UserResponse, token: string }> {
        try {
            // Hash password before saving
            const passwordHash = await this.hashingService.hash(user.password);
            user.password = passwordHash;
            const created = await this.userModel.create(user);

            // Generate token with id
            const token = this.jwtService.generate({ id: created.id });

            // Email validation
            if (this.configService.MAIL_SERVICE)
                await this.sendEmailValidationLink(user.email);

            // Return user and token
            return {
                user: created,
                token,
            };

        } catch (error: any) {
            if (error.code == 11000)
                throw HttpError.badRequest(`user with name ${user.name} already exists`);
            else
                throw error;
        }
    }

    async login(userToLogin: LoginUserValidator): Promise<{ user: UserResponse, token: string }> {

        // Check user existence
        const userDb = await this.userModel.findOne({ email: userToLogin.email });
        if (!userDb)
            throw HttpError.badRequest(`User with email ${userToLogin.email} not found`);

        // Check password matching
        const passwordOk = await this.hashingService.compare(
            userToLogin.password,
            userDb.password
        );
        if (!passwordOk)
            throw HttpError.badRequest('Incorrect password');

        // Generate token with id
        const token = this.jwtService.generate({ id: userDb.id });

        // Return user and token
        return {
            user: userDb,
            token,
        }
    }

    async findOne(id: string): Promise<UserResponse> {
        const userDb = await this.userModel.findById(id).exec();
        if (!userDb)
            throw HttpError.badRequest(`User with id ${id} not found`);
        return userDb;
    }

    async findAll(limit?: number, page?: number): Promise<UserResponse[]> {         
        if (!limit)
            limit = PAGINATION_SETTINGS.DEFAULT_LIMIT;

        if (!page)
            page = PAGINATION_SETTINGS.DEFAULT_PAGE;

        const offset = (page - 1) * limit;

        return this.userModel.find()
            .skip(offset)
            .limit(limit)
            .exec();
    }
}