import { JwtService } from "@root/services";

export const jwtService = new JwtService(
    process.env.JWT_PRIVATE_KEY!,    
);