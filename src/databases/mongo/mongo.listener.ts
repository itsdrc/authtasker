import mongoose from "mongoose";
import { HttpLoggerService } from "@root/services/http-logger.service";
import { SystemLoggerService } from "@root/services/system-logger.service";

export class MongoListener {

    constructor(private readonly loggerService: HttpLoggerService) {
        // this.listenUserEvents();
        this.listenConnectionEvents();
    }

    listenConnectionEvents() {
        mongoose.connection.on('connected', () => {
            SystemLoggerService.info(`Connected to mongo database`);
        });

        mongoose.connection.on('error', (err) => {
            SystemLoggerService.error(`Mongoose connection error - ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            SystemLoggerService.error(`Mongoose disconnected from the database`);
        });
    }
}