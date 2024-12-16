import { loadUserModel } from "@root/databases/mongo/models/users/user.model.load";
import { MongoDatabase } from "@root/databases/mongo/mongo.database";
import { ConfigService } from "@root/services/config.service";
import { SystemLoggerService } from "@root/services/system-logger.service";

export default async () => {
    SystemLoggerService.info('E2E Teardown');

    const configService = new ConfigService();
    if (configService.NODE_ENV !== 'e2e') {
        SystemLoggerService.error('e2e mode is not enabled');
        process.exit(1);
    }    
    
    await MongoDatabase.connect(configService.MONGO_URI);
    
    const userModel = loadUserModel(configService);
    await userModel.deleteMany().exec();
    await MongoDatabase.disconnect();

    SystemLoggerService.warn('All db documents deleted');
}