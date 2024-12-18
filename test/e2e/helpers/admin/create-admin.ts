import { HydratedDocument } from "mongoose";
import * as dataGenerator from "../generators/user-info.generator";
import { loadUserModel } from "@root/databases/mongo/models/users/user.model.load";
import { ConfigService } from "@root/services/config.service";
import { HashingService } from "@root/services/hashing.service";
import { IUser } from "@root/interfaces/user/user.interface";
import { MongoDatabase } from "@root/databases/mongo/mongo.database";

const configService = new ConfigService();
const userModel = loadUserModel(configService);
const hashingService = new HashingService(configService.BCRYPT_SALT_ROUNDS);

// simulates an admin created by server
export const createAdmin = async (): Promise<HydratedDocument<IUser>> => {    
    await MongoDatabase.connect(configService.MONGO_URI);

    const created = await userModel.create({
        name: dataGenerator.name(),
        email: dataGenerator.email(),
        password: await hashingService.hash(dataGenerator.password()),
        role: 'admin'
    });

    await MongoDatabase.disconnect();
    return created;
}