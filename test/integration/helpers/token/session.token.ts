import { jwtService } from "./jwt-service";

export const getSessionToken = (id: string): string => {
    return jwtService.generate('1m', { id });
}