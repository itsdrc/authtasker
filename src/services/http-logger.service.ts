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
                    winston.format.printf(({ level, message, timestamp, method, requestId }) => {
                        const colorizer = winston.format.colorize().colorize;

                        const messageUpperCase = `${(message as string).toUpperCase()}`;
                        const coloredTimestamp = colorizer(level, `[${timestamp}]`);
                        const coloredMethod = colorizer(level, `[${method}]`);
                        const coloredRequest = colorizer(level, `[${requestId}]`);
                        const coloredLevel = colorizer(level, `[${(level as string).toUpperCase()}]`);

                        return `${coloredTimestamp} ${coloredRequest} ${coloredMethod}  ${coloredLevel}: ${messageUpperCase}`;
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
        if(this.configService.HTTP_LOGS){
            const requestId = this.asyncLocalStorage.getStore()?.requestId || 'N/A';
            const method = this.asyncLocalStorage.getStore()?.method || 'Unknown Route';
            const url = this.asyncLocalStorage.getStore()?.url;
            this.logger.log({
                level,
                message,
                method,
                url,
                requestId,
            });
        }
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