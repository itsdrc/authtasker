import { loadUserModel } from "@root/databases/mongo/models/users/user.model.load";
import { MongoDatabase } from "@root/databases/mongo/mongo.database";
import { ConfigService } from "@root/services";
import { SystemLoggerService } from "@root/services/system-logger.service";

export default async ()=>{
    SystemLoggerService.info('Integration global teardown');

    await MongoDatabase.connect(process.env.MONGO_URI!);
    const userModel = loadUserModel({
        HTTP_LOGS: false
    } as ConfigService);
    
    await userModel.deleteMany({ email: { $ne: process.env.ADMIN_EMAIL } });  
    SystemLoggerService.warn('All db documents deleted (but admin)');

    await MongoDatabase.disconnect();  
};