import { AsyncLocalStorage } from "async_hooks";
import winston from "winston";
import { AsyncLocalStorageStore } from "@root/types/common/asyncLocalStorage.type";
import { ConfigService } from "./config.service";

/*  
    WINSTON LEVELS
    error: number;
    warn: number;
    info: number;
    http: number;
    verbose: number;
    debug: number;
    silly: number 
*/

export class HttpLoggerService {

    constructor(
        private readonly configService: ConfigService,
        private readonly asyncLocalStorage: AsyncLocalStorage<AsyncLocalStorageStore>
    ) {}

    // development: all
    // production: no debug messages

    private readonly logger = winston.createLogger({
        level: this.configService.NODE_ENV === 'production' ? 'info' : 'debug',
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.printf(({ level, message, timestamp, route, requestId }) => {
                        const colorizer = winston.format.colorize().colorize;

                        const coloredMessage = colorizer(level, `${(message as string).toUpperCase()}`);
                        const coloredTimestamp = colorizer(level, `[${timestamp}]`);
                        const coloredRoute = colorizer(level, route as string);
                        const coloredRequest = colorizer(level, `[REQUEST: ${requestId}]`);
                        const coloredLevel = colorizer(level, `[${(level as string).toUpperCase()}]`);

                        return `${coloredTimestamp} ${coloredRoute} ${coloredRequest} ${coloredLevel}: ${coloredMessage}`;
                    }),
                ),
            }),
            new winston.transports.File({
                level: 'info',
                filename: 'logs/http.logs.log',
            })
        ]
    });

    private log(level: 'info' | 'error' | 'debug' | 'warn', message: string): void {
        const requestId = this.asyncLocalStorage.getStore()?.requestId || 'N/A';
        const route = this.asyncLocalStorage.getStore()?.route || 'Unknown Route';
        this.logger.log({
            level,
            message,
            requestId,
            route,
        });
    }

    info(message: string) {
        this.log('info', message);
    }

    error(message: string) {
        this.log('error', message);
    }

    debug(message: string) {
        this.log('debug', message);
    }

    warn(message: string) {
        this.log('warn', message);
    }
}