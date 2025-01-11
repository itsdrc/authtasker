import { jwtService } from "./jwt-service"

export const getEmailValidationToken = (email: string): string => {
    return jwtService.generate('1m', {
        email,
        purpose: 'emailValidation'
    });
}