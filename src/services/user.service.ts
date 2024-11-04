import { CreateUserValidator } from "../rules/validators/create-user.validator";
import { HttpError } from "../rules/errors/http.error";
import { Model } from "mongoose";
import { UserRequest } from "../types/user/user-request.type";
import { HashingService } from "./hashing.service";
import { JwtService } from "./jwt.service";
import { LoginUserValidator } from "../rules/validators/login-user.validator";

export class UserService {

    constructor(
        private readonly userModel: Model<UserRequest>,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
    ) {}

    // TODO: validate email
    async create(user: CreateUserValidator): Promise<{ user: UserRequest, token: string }> {
        try {
            const passwordHash = await this.hashingService.hash(user.password);

            user.password = passwordHash;

            const created = await this.userModel.create(user);
            const token = this.jwtService.generate({ id: created.id });

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

    async login(userToLogin: LoginUserValidator): Promise<{ user: UserRequest, token: string }> {

        const userDb = await this.userModel.findOne({
            email: userToLogin.email
        });

        if (!userDb)
            throw HttpError.badRequest(`User with email ${userToLogin.email} not found`);

        const passwordOk = await this.hashingService.compare(
            userToLogin.password,
            userDb.password
        );

        if(!passwordOk)
            throw HttpError.badRequest('Incorrect password');

        const token = this.jwtService.generate({id: userDb.id});

        return {
            user: userDb,
            token,
        }
    }
}