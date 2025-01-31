import mongoose from "mongoose";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { EventManager } from "@root/events/eventManager";
import { LoggerService } from "@root/services/logger.service";

export class MongooseEventsListener {

    constructor(private readonly loggerService: LoggerService) {
        this.listenConnectionEvents();
        this.listModelEvents('user');
        this.listModelEvents('task')
    }

    listenConnectionEvents() {
        mongoose.connection.on('connected', () => {
            SystemLoggerService.info(`connected to mongo database`);
        });

        mongoose.connection.on('disconnected', () => {
            SystemLoggerService.error(`mongo database disconnected`);
        });

        mongoose.connection.on('error', (err) => {
            SystemLoggerService.error(`mongoose connection error - ${err}`);
        });
    }

    // for example: mongoose.userModel.save
    listModelEvents(model: string) {
        EventManager.listen(`mongoose.${model}Model.save`, (property: string) => {
            this.loggerService.debug(`${model} "${property}" saved in db`);
        });

        EventManager.listen(`mongoose.${model}Model.findOne`, (prop: string) => {
            this.loggerService.debug(`${model} ${prop} found in db`);
        });

        EventManager.listen(`mongoose.${model}Model.deleteOne`, (prop: string) => {
            this.loggerService.debug(`${model} found user removed from db`);
        });
    }
}