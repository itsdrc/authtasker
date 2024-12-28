import { jwtService } from "./jwt-service";

export const generateValidTokenWithId = (id: string) => {
    const token = jwtService.generate({ id });
    return token;
}