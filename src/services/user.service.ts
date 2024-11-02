import { CreateUserValidator } from "../rules/validators/create-user.validator";
import { HttpError } from "../rules/errors/http.error";
import { Model } from "mongoose";
import { UserRequest } from "../types/user/user-request.type";

export class UserService {

    constructor(
        private readonly userModel: Model<UserRequest>
    ){}

    async create(user: CreateUserValidator): Promise<UserRequest>{
        try {
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