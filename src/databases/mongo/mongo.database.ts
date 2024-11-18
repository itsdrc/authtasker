import mongoose from "mongoose";

export class MongoDatabase {

    // TODO: envs to set timeout ms
    static connect(mongoURI: string): Promise<mongoose.Mongoose> {
        return mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 10000 });        
    }

    static disconnect(): Promise<void> {
        return mongoose.disconnect();
    }
}