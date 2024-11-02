import { Response } from "express";
import { HttpError } from "../../rules/errors/http.error";

export const handleError = (res:Response, error: unknown) => {
    if (error instanceof HttpError)
        res.status(error.statusCode).json({ error: error.message });
    else
        res.status(500).json({ unhandledError: error });
};