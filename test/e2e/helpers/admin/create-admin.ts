import { HydratedDocument } from "mongoose";
import { loadUserModel } from "@root/databases/mongo/models/user.model.load";
import { ConfigService } from "@root/services/config.service";
import { HashingService } from "@root/services/hashing.service";
import { IUser } from "@root/interfaces/user/user.interface";
import { MongoDatabase } from "@root/databases/mongo/mongo.database";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { mock } from "jest-mock-extended";
import { LoggerService } from "@root/services";
import { config } from "dotenv";

// disable logs when user model is loaded
SystemLoggerService.info = jest.fn();

const configService = new ConfigService();
const userModel = loadUserModel(configService);
const hashingService = new HashingService(configService.BCRYPT_SALT_ROUNDS);

// simulates an admin created by server
export const createAdmin = async (): Promise<HydratedDocument<IUser>> => {
    const mongoDatabase = new MongoDatabase(configService, null as any);

    const created = await userModel.create({
        name: global.DATA_GENERATOR.name(),
        email: global.DATA_GENERATOR.email(),
        password: await hashingService.hash(global.DATA_GENERATOR.password()),
        role: 'admin'
    });

    await mongoDatabase.disconnect();
    return created;
}