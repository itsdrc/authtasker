import { loadUserModel } from "@root/databases/mongo/models/users/user.model.load";
import { MongoDatabase } from "@root/databases/mongo/mongo.database";
import { SystemLoggerService } from "@root/services/system-logger.service";

export default async ()=>{
    await MongoDatabase.connect(process.env.MONGO_URI!);
    const userModel = loadUserModel({} as any);
    await userModel.deleteMany().exec();
    await MongoDatabase.disconnect();
    SystemLoggerService.warn('All db documents deleted');
}