import { loadUserModel } from "@root/databases/mongo/models/users/user.schema.load";
import { MongoDatabase } from "@root/databases/mongo/mongo.database";
import { SystemLoggerService } from "@root/services/system-logger.service";

export default async ()=>{
    await MongoDatabase.connect(process.env.MONGO_URI!);
    const userModel = loadUserModel({} as any);
    userModel.deleteMany().exec();
    await MongoDatabase.disconnect();
    SystemLoggerService.warn('All db documents deleted');
}