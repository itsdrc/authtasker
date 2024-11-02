import mongoose from "mongoose";

export class MongoDatabase {

    static connect(mongoURI: string): Promise<mongoose.Mongoose> {
        return mongoose.connect(mongoURI);
    }

    static disconnect(): Promise<void> {
        return mongoose.disconnect();
    }
}