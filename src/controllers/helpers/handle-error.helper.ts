import { Response } from "express";
import { HttpError } from "../../rules/errors/http.error";
import { UNEXPECTED_ERROR_MESSAGE } from "../constants/unexpected-error.constant";

// TODO: logs-service
export const handleError = (res: Response, error: unknown) => {
    if (error instanceof HttpError)
        res.status(error.statusCode).json({ error: error.message });
    else {
        console.error(error);
        res.status(500).json({ error: UNEXPECTED_ERROR_MESSAGE });
    }
};