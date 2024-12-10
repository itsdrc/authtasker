import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';

interface IJwtPayload {
    jti: string;
    [key: string]: any,
}

export class JwtService {

    constructor(
        private readonly expirationTime: string,
        private readonly privateKey: string,
    ) {}

    generate(payload: object): string {
        Object.defineProperty(
            payload,
            'jti',
            { value: uuidv4() }
        );

        const token = jwt.sign(payload,
            this.privateKey,
            { expiresIn: this.expirationTime }
        );
        return token;
    }

    verify<T>(token: string): IJwtPayload & T | undefined {
        try {
            const payload = jwt.verify(token, this.privateKey);
            return payload as any;
        } catch (error) {
            return undefined;
        }
    }
}