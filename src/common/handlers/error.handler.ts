import { Response } from "express";
import { HTTP_STATUS_CODE } from "@root/rules/constants";
import { HttpError } from "@root/rules/errors/http.error";
import { LoggerService, SystemLoggerService } from "@root/services";

export const handleError = (res: Response, error: Error | unknown, logger: LoggerService) => {
    if (error instanceof HttpError) {
        res.status(error.statusCode).json({ error: error.message });
        // its assumed that error logging was handled in the service function that threw it
        return;
    }

    if (error instanceof Error) {
        res.status(HTTP_STATUS_CODE.INTERNALSERVER).json({ error: 'Unexpected error' });
        logger.error(`Unexpected error: ${error.message}`, error.stack);
        logger.debug(error.stack as string);
        SystemLoggerService
        return;
    }

    // unknown error
    logger.error(`Unknown error: ${error}`);
    SystemLoggerService.error(error as string);
    return res.status(HTTP_STATUS_CODE.INTERNALSERVER).json({ error: 'Unknown error' });
};
