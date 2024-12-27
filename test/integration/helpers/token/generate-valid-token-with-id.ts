import { JwtService } from "@root/services";

const jwtService = new JwtService(
    process.env.JWT_EXPIRATION_TIME!,
    process.env.JWT_PRIVATE_KEY!,
);

export const generateValidTokenWithId = (id: string) => {
    const token = jwtService.generate({ id });
    return token; 
}