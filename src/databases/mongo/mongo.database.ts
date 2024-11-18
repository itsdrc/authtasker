import mongoose from "mongoose";

export class MongoDatabase {

    // TODO: envs to set timeout ms
    static async connect(mongoURI: string): Promise<mongoose.Mongoose> {
        return await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 10000 });
    }

    static async disconnect(): Promise<void> {
        return await mongoose.disconnect();
    }
}