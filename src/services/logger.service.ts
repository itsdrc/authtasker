import { AsyncLocalStorage } from "async_hooks";
import winston from "winston";
import { AsyncLocalStorageStore } from "@root/types/common/asyncLocalStorage.type";
import { ConfigService } from "./config.service";
import { RequestLog } from "@root/types/logs/request.log.type";

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

export class LoggerService {

    private logger: winston.Logger;

    constructor(
        private readonly configService: ConfigService,
        private readonly asyncLocalStorage: AsyncLocalStorage<AsyncLocalStorageStore>
    ) {
        const currentEnv = this.configService.NODE_ENV;

        const consoleTransport = new winston.transports.Console({
            // no debug messages in production mode
            level: currentEnv === 'production' ? 'info' : 'debug',
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
        });

        const devLogsFilename = 'logs/dev/http.logs.log';
        const prodLogsFilename = 'logs/prod/http.logs.log';

        const filename = currentEnv === 'production' ? prodLogsFilename : devLogsFilename;
        const fileTransport = new winston.transports.File({
            // no debug messages in fs
            level: 'info',
            filename
        });

        this.logger = winston.createLogger({
            transports: [
                consoleTransport,
                fileTransport
            ]
        });
    }

    private log(
        level: 'info' | 'error' | 'debug' | 'warn',
        message: string,
        stackTrace?: string
    ): void {
        if (this.configService.HTTP_LOGS) {
            const requestId = this.asyncLocalStorage.getStore()?.requestId || 'N/A';
            const method = this.asyncLocalStorage.getStore()?.method || 'Unknown Route';
            const url = this.asyncLocalStorage.getStore()?.url;
            this.logger.log({
                level,
                message,
                method,
                url,
                requestId,
                stackTrace,
            });
        }
    }

    info(message: string) {
        this.log('info', message);
    }

    error(message: string, stackTrace?: string) {
        this.log('error', message, stackTrace);
    }

    debug(message: string) {
        this.log('debug', message);
    }

    warn(message: string) {
        this.log('warn', message);
    }

    logRequest(data: RequestLog) {
        if (this.configService.HTTP_LOGS) {
            this.logger.log({
                message: `Request completed (${data.responseTime}ms)`,
                level: 'info',
                ...data
            })
        };
    }
}