import { config } from 'dotenv'
import { MongoDatabase } from "@root/databases/mongo/mongo.database";
import { SystemLoggerService } from "@root/services/system-logger.service";

config({
    path: '.env.test'
});

export default async () => {
    const mongoUri = process.env.MONGO_URI;
    const connected = await MongoDatabase.connect(mongoUri!);
    if (!connected) {
        SystemLoggerService.error('Failed to connect to db');
        process.exit(1);
    }
}