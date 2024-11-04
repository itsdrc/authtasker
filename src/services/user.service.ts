import { CreateUserValidator } from "../rules/validators/create-user.validator";
import { HttpError } from "../rules/errors/http.error";
import { Model } from "mongoose";
import { UserRequest } from "../types/user/user-request.type";
import { HashingService } from "./hashing.service";

export class UserService {

    constructor(
        private readonly userModel: Model<UserRequest>,
        private readonly hashingService: HashingService,
    ){}

    // TODO: hash password, validate email and return token
    async create(user: CreateUserValidator): Promise<UserRequest>{
        try {
            const passwordHash = await this.hashingService.hash(user.password);

            user.password = passwordHash;

            const created = await this.userModel.create(user);
            
            return created;
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
}