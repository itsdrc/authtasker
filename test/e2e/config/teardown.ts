import { MongoDatabase } from "@root/databases/mongo/mongo.database";
import { SystemLoggerService } from "@root/services/system-logger.service";

export default async () => {
    SystemLoggerService.info('E2E Teardown');    
    
    await global.USER_MODEL.deleteMany().exec();
    SystemLoggerService.warn('All db documents deleted');

    await MongoDatabase.disconnect();
}