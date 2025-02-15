import rateLimit from "express-rate-limit";
import { ConfigService } from "@root/services";

export const apiLimiterMiddlewareFactory = (configService: ConfigService) => {
    return rateLimit({
        windowMs: 1 * 60 * 1000,
        max: configService.API_MAX_REQ_PER_MINUTE,
        message: 'Too many requests, please try again later.',
        standardHeaders: false,
        legacyHeaders: false
    });
};