import { AsyncLocalStorage } from "async_hooks";
import winston from "winston";

export class LoggerService {

    constructor(
        private readonly asyncLocalStorage: AsyncLocalStorage<{requestId: string}>
    ){}

    private readonly logger = winston.createLogger({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.prettyPrint({
                colorize: true
            })
        ),
        transports: [
            new winston.transports.Console(),
        ]
    });

    log(message: string) {
        const requestId = this.asyncLocalStorage.getStore()?.requestId;
        this.logger.info(`[${requestId}] ${message}`);
    }
}