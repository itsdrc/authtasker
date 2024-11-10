import { Response } from "express";
import { HttpError } from "../../rules/errors/http.error";

// TODO: logs-service
export const handleError = (res:Response, error: unknown) => {
    if (error instanceof HttpError)
        res.status(error.statusCode).json({ error: error.message });
    else{
        console.error(error);
        res.status(500).json({ error: 'Unexpected error' });
    }
};