import mongoose from "mongoose";

export class MongoDatabase {

    private connection: mongoose.Connection | undefined;

    constructor(
        private readonly mongoURI: string,
    ) {}

    async connect(): Promise<void> {
        this.connection = await mongoose.createConnection(this.mongoURI).asPromise();
    }

    async disconnect(): Promise<void> {
        if (this.connection)
            await this.connection.close();
        else
            console.warn('No connection to close');
    }
}