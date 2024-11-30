import winston from "winston";

export class SystemLoggerService {

    private static logger: winston.Logger;

    static {
        SystemLoggerService.logger = winston.createLogger({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.cli(),
                    )
                }),
                new winston.transports.File({
                    filename: 'logs/system.logs.log'
                }), 
            ]
        });
    }

    static info(message: string) {
        SystemLoggerService.logger.info(message);
    }

    static error(message: string){
        try {
            SystemLoggerService.logger.error(message);
        } catch (error) {
            console.error(error);
        }
    }
}