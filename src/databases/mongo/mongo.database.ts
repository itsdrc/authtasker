import { SystemLoggerService } from "@root/services/system-logger.service";
import mongoose from "mongoose";

export class MongoDatabase {

    // TODO: envs to set timeout ms
    static async connect(mongoURI: string): Promise<boolean> {
        try {
            await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 1000 });
            SystemLoggerService.info(`Connected to mongo database`);
            return true;
        } catch (error) {
            SystemLoggerService.error(`Failed to connect to mongo database - ${error}`);
            return false;
        }
    }

    static async disconnect(): Promise<boolean> {
        try {
            await mongoose.disconnect();
            SystemLoggerService.info(`Disconnected from mongo database`);
            return true;
        } catch (error) {
            SystemLoggerService.error(`Failed to disconnect from mongo database - ${error}`);
            return false;
        }
    }
}