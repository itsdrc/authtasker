import { JwtService } from "@root/services";

export const jwtService = new JwtService(
    process.env.JWT_EXPIRATION_TIME!,
    process.env.JWT_PRIVATE_KEY!,
);