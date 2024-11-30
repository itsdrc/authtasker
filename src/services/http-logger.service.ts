import { AsyncLocalStorage } from "async_hooks";
import winston from "winston";
import { AsyncLocalStorageStore } from "@root/types/common/asyncLocalStorage.type";
import { ConfigService } from "./config.service";

export class HttpLoggerService {

    constructor(
        private readonly configService: ConfigService,
        private readonly asyncLocalStorage: AsyncLocalStorage<AsyncLocalStorageStore>
    ) {}

    // development: debug, info, warn and error messages
    // production: no debug messages
    private readonly level = this.configService.NODE_ENV === 'development' ? 'debug' : 'info';

    private readonly logger = winston.createLogger({
        level: this.level,
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize({ level: true }),
                    winston.format.timestamp(),
                    winston.format.printf(({ level, message, timestamp, route, requestId }) => {
                        const colorizer = winston.format.colorize().colorize;
                        const coloredMessage = colorizer('debug', (message as string).toLowerCase());
                        return `[${timestamp}] [${level}] ${route}  [REQUEST: ${requestId}]:  ${coloredMessage}`;
                    }),
                ),
            }),
            new winston.transports.File({
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