import { jwtService } from "./jwt-service";

export const generateValidTokenWithEmail = (email: string) => {
    const token = jwtService.generate({ email });
    return token;
}