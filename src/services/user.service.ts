import { CreateUserValidator } from "../rules/validators/create-user.validator";
import { HttpError } from "../rules/errors/http.error";
import { Model } from "mongoose";
import { HashingService } from "./hashing.service";
import { JwtService } from "./jwt.service";
import { LoginUserValidator } from "../rules/validators/login-user.validator";
import { UserResponse } from "../types/user/user-response.type";
import { User } from "../types/user/user.type";
import { EmailService } from "./email.service";
import { ENVS } from "../config/envs.config";

export class UserService {

    constructor(
        private readonly userModel: Model<User>,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
    ) {}

    private async sendEmailValidationLink(email: string) {
        const token = this.jwtService.generate({ email });
        const link = `${ENVS.WEB_URL}/api/users/validate-email/${token}`;
        const html = `
        <h1> Validate your email </h1>
        <p> Click below to validate your email </p>
        <a href= "${link}"> Validate your email ${email} </a>`
        await this.emailService.sendMail({
            to: email,
            subject: 'Email validation',
            html,
        });
    }

    async validateEmail(token: string): Promise<void> {
        const payload = this.jwtService.verify(token);

        const { email } = payload as { email: string };
        if (!email)
            throw HttpError.internalServer('Email not in token');

        const user = await this.userModel.findOne({ email });
        if (!user)
            throw HttpError.notFound('User not found');

        user.emailValidated = true;
        await user.save();
    }

    async create(user: CreateUserValidator): Promise<{ user: UserResponse, token: string }> {
        try {
            const passwordHash = await this.hashingService.hash(user.password);
            user.password = passwordHash;

            const created = await this.userModel.create(user);

            const token = this.jwtService.generate({ id: created.id });
            await this.sendEmailValidationLink(user.email);

            return {
                user: created,
                token,
            };            
        } catch (error: any) {
            if (error.code == 11000)
                throw HttpError.badRequest(`user with name ${user.name} already exists`);
            else {
                // TODO: logs-service
                console.log(error.message);
                throw HttpError.internalServer(`Unexpected error`);
            }
        }
    }

    async login(userToLogin: LoginUserValidator): Promise<{ user: UserResponse, token: string }> {

        const userDb = await this.userModel.findOne({
            email: userToLogin.email
        });

        if (!userDb)
            throw HttpError.badRequest(`User with email ${userToLogin.email} not found`);

        const passwordOk = await this.hashingService.compare(
            userToLogin.password,
            userDb.password
        );

        if (!passwordOk)
            throw HttpError.badRequest('Incorrect password');

        const token = this.jwtService.generate({ id: userDb.id });

        return {
            user: userDb,
            token,
        }
    }
}