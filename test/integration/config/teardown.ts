import { loadUserModel } from "@root/databases/mongo/models/users/user.model.load";
import { MongoDatabase } from "@root/databases/mongo/mongo.database";
import { SystemLoggerService } from "@root/services/system-logger.service";

export default async () => {
    const userModel = loadUserModel({} as any);
    await userModel.deleteMany().exec();
    SystemLoggerService.warn('All documents deleted');

    await MongoDatabase.disconnect().then(ok => {
        if (!ok) SystemLoggerService.error('Failed to disconnect from test db');
    });
}