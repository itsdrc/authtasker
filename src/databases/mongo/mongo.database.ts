import mongoose from "mongoose";

export class MongoDatabase {

    static async connect(mongoURI: string): Promise<boolean> {
        try {
            await mongoose.connect(mongoURI);
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