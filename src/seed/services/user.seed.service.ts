import { Model } from "mongoose";
import { faker } from '@faker-js/faker';

import { HashingService } from "@root/services/hashing.service";
import { IUser } from "@root/interfaces/user/user.interface";
import { UserRequest } from "@root/types/user/user-request.type";
import { ConfigService } from "@root/services/config.service";

export class UserSeedService {

    constructor(
        private readonly configService: ConfigService,
        private readonly userModel: Model<IUser>,
        private readonly hashingService: HashingService,
    ) {}

    private async generateRandomUser(): Promise<UserRequest> {
        return {
            name: faker.person.fullName().toLowerCase(),
            email: faker.internet.email(),
            password: await this.hashingService.hash(faker.food.vegetable()),            
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