import { loadUserModel } from "@root/databases/mongo/models/user.model.load";
import { MongoDatabase } from "@root/databases/mongo/mongo.database";
import { ConfigService } from "@root/services";
import { SystemLoggerService } from "@root/services/system-logger.service";

export default async ()=>{
    SystemLoggerService.info('Integration global teardown');

    const mongoDb = new MongoDatabase(
        global.CONFIG_SERVICE,
        null as any
    );
    await mongoDb.connect();
    
    const userModel = loadUserModel(global.CONFIG_SERVICE);
    
    await userModel.deleteMany({ email: { $ne: process.env.ADMIN_EMAIL } });  
    SystemLoggerService.warn('All db documents deleted (but admin)');

    await mongoDb.disconnect();
};