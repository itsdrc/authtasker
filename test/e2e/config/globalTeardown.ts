import { loadUserModel } from "@root/databases/mongo/models/users/user.model.load";
import { MongoDatabase } from "@root/databases/mongo/mongo.database"
import { SystemLoggerService } from "@root/services/system-logger.service";
import { rm } from "fs";

export default async () => {
    SystemLoggerService.info('E2E global teardown');

    await MongoDatabase.connect(process.env.MONGO_URI!);
    const userModel = loadUserModel({} as any);

    await userModel.deleteMany({ email: { $ne: process.env.ADMIN_EMAIL } });
    SystemLoggerService.warn('All db documents deleted (but admin)');

    await MongoDatabase.disconnect();

    rm(`${__dirname}/token.txt`, () => {
        SystemLoggerService.info('Token removed');
    });
}