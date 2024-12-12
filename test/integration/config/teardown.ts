import { MongoDatabase } from "@root/databases/mongo/mongo.database";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { UserModel } from "@root/databases/mongo/schemas/user.schema";

export default async () => {
    await UserModel.deleteMany().exec();
    SystemLoggerService.warn('All documents deleted');

    const disc = await MongoDatabase.disconnect();
    if (!disc)
        SystemLoggerService.error('Failed to disconnect from test db');
}