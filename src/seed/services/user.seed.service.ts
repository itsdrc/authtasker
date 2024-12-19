import { Model } from "mongoose";

import { HashingService } from "@root/services/hashing.service";
import { IUser } from "@root/interfaces/user/user.interface";
import { UserRequest } from "@root/types/user/user-request.type";
import { ConfigService } from "@root/services/config.service";
import { UserDataGenerator } from "../generators/user.generator";

export class UserSeedService {

    constructor(
        private readonly configService: ConfigService,
        private readonly userModel: Model<IUser>,
        private readonly hashingService: HashingService,
        private readonly dataGenerator: UserDataGenerator
    ) {}

    private async generateRandomUser(): Promise<UserRequest> {
        return {
            name: this.dataGenerator.name({ respectMinAndMaxLength: false }),
            email: this.dataGenerator.email(),
            password: await this.hashingService.hash(this.dataGenerator.password()),
        };
    }

    private async generateBunchOfUsers(n: number): Promise<UserRequest[]> {
        let users = new Array<UserRequest>;
        for (let i = 0; i < n; i++) {
            users.push(await this.generateRandomUser());
        }
        return users;
    }

    async seedBunch(n: number) {
        await this.userModel.deleteMany({ email: { $ne: this.configService.ADMIN_EMAIL } });
        const users = await this.generateBunchOfUsers(n);
        return await this.userModel.insertMany(users);
    }
}