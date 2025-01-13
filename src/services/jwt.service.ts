import jwt, { JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';

interface IJwtPayload {
    jti: string;
    [key: string]: any,
}

export class JwtService {

    constructor(
        private readonly privateKey: string,
    ) {}

    generate(expirationTime: string, payload: object): string {
        Object.defineProperty(
            payload,
            'jti',
            { value: uuidv4(), enumerable: true }
        );

        const token = jwt.sign(payload,
            this.privateKey,
            { expiresIn: expirationTime}
        );
        return token;
    }

    verify<T>(token: string): IJwtPayload & JwtPayload  & T | null {
        try {
            const payload = jwt.verify(token, this.privateKey);
            return payload as any;
        } catch (error) {
            return null;
        }
    }
}