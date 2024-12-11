import mongoose from "mongoose";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { EventManager } from "@root/events/eventManager";
import { LoggerService } from "@root/services/logger.service";

export class MongooseEventsListener {

    constructor(private readonly loggerService: LoggerService) {
        this.listenConnectionEvents();
        this.listModelEvents('user');
    }

    listenConnectionEvents() {
        mongoose.connection.on('connected', () => {
            SystemLoggerService.info(`CONNECTED TO MONGO DATABASE`);
        });

        mongoose.connection.on('disconnected', () => {
            SystemLoggerService.error(`MONGO DATABASE DISCONNECTED`);
        });

        mongoose.connection.on('error', (err) => {
            SystemLoggerService.error(`MONGOOSE CONNECTION ERROR - ${err}`);
        });
    }

    // for example: mongoose.userModel.save
    listModelEvents(model: string) {
        EventManager.listen(`mongoose.${model}Model.save`, (property: string) => {
            this.loggerService.debug(`${model} "${property}" SAVED IN DB`);
        });

        EventManager.listen(`mongoose.${model}Model.findOne`, (prop: string) => {
            this.loggerService.debug(`${model} ${prop} FOUND IN DB`);
        });

        EventManager.listen(`mongoose.${model}Model.findOneAndUpdate`, (prop: string) => {
            this.loggerService.debug(`${model} ${prop} UPDATED IN DB`);
        });

        EventManager.listen(`mongoose.${model}Model.deleteOne`, (prop: string) => {
            this.loggerService.debug(`${model} ${prop} DELETED FROM DB`);
        });
    }
}