import mongoose from "mongoose";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { EventManager } from "@root/events/eventManager";
import { HttpLoggerService } from "@root/services/http-logger.service";

export class MongooseEventsListener {

    constructor(private readonly loggerService: HttpLoggerService) {
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
        EventManager.listen(`mongoose.${model}Model.save`, (id: string) => {
            this.loggerService.debug(`${model} ${id} SAVED IN DB`);
        });

        EventManager.listen(`mongoose.${model}Model.findOne`, (id: string) => {
            this.loggerService.debug(`${model} ${id} FOUND IN DB`);
        });

        EventManager.listen(`mongoose.${model}Model.findOneAndUpdate`, (id: string) => {
            this.loggerService.debug(`${model} ${id} UPDATED IN DB`);
        });

        EventManager.listen(`mongoose.${model}Model.deleteOne`, (id: string) => {
            this.loggerService.debug(`${model} ${id} DELETED FROM DB`);
        });
    }
}