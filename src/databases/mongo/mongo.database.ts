import { SystemLoggerService } from "@root/services/system-logger.service";
import mongoose from "mongoose";

export class MongoDatabase {

    // TODO: envs to set timeout ms
    static async connect(mongoURI: string): Promise<void> {
        try {
            await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 10000 });               
            SystemLoggerService.info(`Connected to mongo database`);
        } catch (error) {
            SystemLoggerService.error(`Failed to connect to mongo database - ${error}`);
        }        
    }

    static async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
            SystemLoggerService.info(`Disconnected from mongo database`);
        } catch (error) {
            SystemLoggerService.error(`Failed to disconnect from mongo database - ${error}`);
        }
    }
}