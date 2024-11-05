import jwt from "jsonwebtoken";

export class JwtService {

    constructor(
        private readonly expirationTime: string,
        private readonly privateKey: string,
    ) {}

    generate(payload: object): string {
        const token = jwt.sign(payload,
            this.privateKey,
            { expiresIn: this.expirationTime }
        );
        return token;
    }

    verify(token: string): object | string | undefined {
        try {
            const payload = jwt.verify(token, this.privateKey);
            return payload;
        } catch (error) {
            return undefined;
        }
    }
}