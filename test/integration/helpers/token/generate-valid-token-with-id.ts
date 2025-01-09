import { jwtService } from "./jwt-service";

export const generateValidTokenWithId = (id: string) => {
    const token = jwtService.generate('1m',{ id });
    return token;
}