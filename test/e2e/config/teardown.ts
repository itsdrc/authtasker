import { MongoDatabase } from "@root/databases/mongo/mongo.database";
import { UserModel } from "@root/databases/mongo/schemas/user.schema"
import { SystemLoggerService } from "@root/services/system-logger.service";

export default async ()=>{
    await MongoDatabase.connect(process.env.MONGO_URI!);
    await UserModel.deleteMany().exec();
    await MongoDatabase.disconnect();
    SystemLoggerService.warn('All db documents deleted');
}