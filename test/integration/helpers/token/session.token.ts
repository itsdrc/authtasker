import { TOKEN_PURPOSES } from "@root/rules/constants/token-purposes.constants";
import { jwtService } from "./jwt-service";

export const getSessionToken = (id: string): string => {
    return jwtService.generate('1m', {
        id,
        purpose: TOKEN_PURPOSES.SESSION,
    });
}