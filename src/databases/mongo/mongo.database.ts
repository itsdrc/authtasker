import { SystemLoggerService } from "@root/services/system-logger.service";
import mongoose from "mongoose";

export class MongoDatabase {

    // TODO: envs to set timeout ms
    static async connect(mongoURI: string): Promise<boolean> {
        try {
            await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 1000 });
            return true;
        } catch (error) {
            return false;
        }
    }

    static async disconnect(): Promise<boolean> {
        try {
            await mongoose.disconnect();
            return true;
        } catch (error) {
            return false;
        }
    }
}