import { TOKEN_PURPOSES } from "@root/rules/constants/token-purposes.constants";
import { jwtService } from "./jwt-service"

export const getEmailValidationToken = (email: string): string => {
    return jwtService.generate('1m', {
        email,
        purpose: TOKEN_PURPOSES.EMAIL_VALIDATION,
    });
}