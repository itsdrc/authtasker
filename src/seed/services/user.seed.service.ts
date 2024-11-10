import { Model } from "mongoose";
import { User } from "../../types/user/user.type";
import { HashingService } from "../../services/hashing.service";
import { UserRequest } from "../../types/user/user-request.type";
import { faker } from '@faker-js/faker';

export class UserSeedService {

    constructor(
        private readonly userModel: Model<User>,
        private readonly hashingService: HashingService,
    ) {}

    private async generateRandomUser(): Promise<UserRequest> {
        return {
            name: faker.person.fullName().toLowerCase(),
            email: faker.internet.email(),
            password: await this.hashingService.hash(faker.food.vegetable()),
            role: Math.floor(Math.random() * 10) % 2 == 0 ? 'admin' : 'readonly',
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
        await this.userModel.deleteMany();        
        const users = await this.generateBunchOfUsers(n);        
        return await this.userModel.insertMany(users);
    }
}